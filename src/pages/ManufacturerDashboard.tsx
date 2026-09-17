import React, { useState, useEffect, useRef } from 'react';
import type { ComplianceReport, LegalNotice, SampleLabelPreset } from '../types';
import { DB } from '../utils/db';
import { API } from '../services/api';
import { SAMPLE_PRESETS, generateCanvasLabel } from '../utils/sampleGenerator';
import { performOCR } from '../utils/ocr';
import { validateRuleEngine } from '../utils/ruleEngine';
import { readFileAsDataUrl, stitchImages } from '../utils/file';
import { Factory, ShieldCheck, FileText, CheckCircle, AlertTriangle, Building, Upload, Send, Eye, CheckCircle2, XCircle, Clock, Info, ShieldAlert, CheckSquare, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface ManufacturerDashboardProps {
  userName: string;
}

export const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({ userName }) => {
  const [scans, setScans] = useState<ComplianceReport[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatusText, setOcrStatusText] = useState<string>('');
  const [customFilePreviews, setCustomFilePreviews] = useState<string[]>([]);
  const reportSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScans(DB.getScans());
    setNotices(DB.getNotices());
  }, []);

  const manufacturerNames = Array.from(new Set(scans.map(s => s.manufacturerName).filter(Boolean)));
  const normalizedUserName = userName.toLowerCase();
  const ownedManufacturer = manufacturerNames.find(name =>
    name.toLowerCase().split(/\s+/).some(word => word.length >= 4 && normalizedUserName.includes(word))
  ) || '';

  const filteredScans = scans.filter(scan => scan.manufacturerName === ownedManufacturer);
  const filteredNotices = notices.filter(notice => notice.manufacturerName === ownedManufacturer);

  const totalScans = filteredScans.length;
  const compliantScans = filteredScans.filter(s => s.overallStatus === 'Compliant').length;
  const complianceRate = totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 100;

  const saveDraftReport = (report: ComplianceReport) => {
    const manufacturerReport: ComplianceReport = {
      ...report,
      submittedBy: userName,
      submittedByRole: 'manufacturer',
      reviewStatus: 'draft',
    };
    DB.saveScan(manufacturerReport);
    setCurrentReport(manufacturerReport);
    setScans(DB.getScans());

    // Async fetch AI explanations
    setIsExplaining(true);
    API.getExplanations(manufacturerReport).then((explanations) => {
      const updatedResults = manufacturerReport.results.map(r => ({
        ...r,
        aiExplanation: explanations[r.ruleId]
      }));
      const updatedReport = { ...manufacturerReport, results: updatedResults };
      setCurrentReport(updatedReport);
      DB.updateScan(updatedReport);
      setScans(DB.getScans());
    }).catch(console.error).finally(() => setIsExplaining(false));
  };

  const runPresetScan = async (preset: SampleLabelPreset) => {
    setCustomFilePreviews([]);
    setIsScanning(true);
    const { dataUrl, width, height, text: syntheticText, words: syntheticWords } = generateCanvasLabel(preset);

    try {
      const ocrResult = await performOCR(
        dataUrl,
        { text: syntheticText, words: syntheticWords },
        (progress, status) => {
          setOcrProgress(progress);
          setOcrStatusText(status);
        }
      );
      const report = validateRuleEngine(
        ocrResult.text || syntheticText,
        ocrResult.words && ocrResult.words.length > 0 ? ocrResult.words : syntheticWords,
        { isImported: preset.config.isImported, imageUrl: dataUrl, imageDimensions: { width, height } }
      );
      report.productName = preset.config.productName;
      report.manufacturerName = preset.config.manufacturer;
      saveDraftReport(report);
    } catch (err) {
      console.error('Manufacturer scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCustomFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageUrls = await Promise.all(files.map(readFileAsDataUrl));
    const mergedImageUrl = await stitchImages(imageUrls);
    
    setCustomFilePreviews(imageUrls);
    setIsScanning(true);

    try {
      const ocrResult = await performOCR(mergedImageUrl, undefined, (progress, status) => {
        setOcrProgress(progress);
        setOcrStatusText(status);
      });
      const report = validateRuleEngine(ocrResult.text, ocrResult.words, { isImported: false, imageUrl: mergedImageUrl });
      report.imageUrls = imageUrls;
      saveDraftReport(report);
    } catch (err) {
      console.error('Manufacturer upload error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const submitCurrentReport = () => {
    if (!currentReport) return;
    DB.updateScanReview(currentReport.id, { reviewStatus: 'submitted' });
    const submittedReport = { ...currentReport, reviewStatus: 'submitted' as const };
    setCurrentReport(submittedReport);
    setScans(DB.getScans());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter */}
      <div className="bg-white text-teal-900 rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold font-heading">Manufacturer & Packer Portal</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-teal-600">{userName}</strong> • Self-Audit & Legal Notice Management
          </p>
        </div>

        <div className="flex items-center gap-2 bg-teal-900 p-2 rounded-xl border border-navy-700">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-semibold">Organization:</span>
          <span className="text-xs text-white font-bold">{ownedManufacturer || 'No organization assigned'}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products Scanned</span>
            <h3 className="text-3xl font-bold font-heading text-teal-900 mt-1">{totalScans}</h3>
            <span className="text-xs text-slate-500">Across retail inspection log</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Pass Rate</span>
            <h3 className="text-3xl font-bold font-heading text-compliant mt-1">{complianceRate}%</h3>
            <span className="text-xs text-emerald-700 font-semibold">{compliantScans} of {totalScans} Products Compliant</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-compliant" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legal Notices Issued</span>
            <h3 className="text-3xl font-bold font-heading text-violation mt-1">{filteredNotices.length}</h3>
            <span className="text-xs text-red-700 font-semibold">
              {filteredNotices.filter(n => n.status === 'Open').length} Pending Action
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-violation rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-violation" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold font-heading text-teal-900 text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            Run Self-Audit & Submit for Inspector Approval
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Scan a package label, review the automated Rule 6 report, then send it to a field inspector.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Sample label gallery</span>
            {SAMPLE_PRESETS.slice(0, 3).map(preset => (
              <button
                key={preset.id}
                onClick={() => runPresetScan(preset)}
                disabled={isScanning}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition disabled:opacity-50"
              >
                <span className="block text-xs font-bold text-teal-900">{preset.title}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{preset.subtitle}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Upload a package image</span>
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 block transition">
              <input type="file" accept="image/*" multiple onChange={handleCustomFileUpload} className="hidden" />
              <Upload className="w-7 h-7 text-teal-600 mx-auto mb-2" />
              <span className="block text-xs font-bold text-teal-900">Choose label photo</span>
              <span className="block text-[11px] text-slate-500 mt-1">PNG, JPG, or WEBP up to 10MB</span>
            </label>
            {customFilePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {customFilePreviews.map((preview, index) => (
                  <img key={preview} src={preview} alt={`Uploaded package label ${index + 1}`} className="h-24 w-full rounded-lg border border-slate-200 object-contain bg-slate-50" />
                ))}
              </div>
            )}
          </div>
        </div>

        {isScanning && (
          <div className="bg-slate-50 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-teal-900">
              <span>{ocrStatusText || 'Extracting OCR text...'}</span><span>{ocrProgress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 transition-all" style={{ width: `${ocrProgress}%` }} />
            </div>
          </div>
        )}

        {currentReport && !isScanning && (
          <div ref={reportSectionRef} id="manufacturer-report" className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-mono text-slate-500">{currentReport.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentReport.overallStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {currentReport.overallStatus}
                </span>
              </div>
              <h4 className="text-sm font-bold text-teal-900 mt-1">{currentReport.productName || 'Uploaded package report'}</h4>
              <p className="text-xs text-slate-500">{currentReport.passCount} passed, {currentReport.failCount} failed, {currentReport.reviewCount} requiring review</p>
              {(currentReport.failCount > 0 || currentReport.reviewCount > 0) && (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Needs attention</p>
                  <div className="space-y-2">
                    {currentReport.results
                      .filter(result => result.status !== 'pass')
                      .map(result => (
                        <div
                          key={result.ruleId}
                          className={`text-xs p-2.5 rounded-lg ${
                            result.status === 'fail'
                              ? 'bg-red-50/70 text-red-900 border border-red-200'
                              : 'bg-amber-50/70 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <div className="font-semibold flex items-center justify-between">
                            <span>{result.status === 'fail' ? 'Missing: ' : 'Review: '}{result.title}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/60 border border-current/10">{result.ruleId}</span>
                          </div>
                          {(result.matchedText || result.warning || result.guidanceNote || isExplaining || result.aiExplanation) && (
                            <details className="mt-2 group">
                              <summary className="cursor-pointer font-semibold text-slate-600 text-[11px] list-none flex items-center gap-1.5 transition-colors group-hover:text-indigo-600">
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>AI Explanation & Details</span>
                              </summary>
                              
                              <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100/50 space-y-2 text-xs">
                                {isExplaining && !result.aiExplanation && (
                                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Generating AI Insights...
                                  </div>
                                )}
                                {result.aiExplanation && (
                                  <div className="text-slate-700 leading-relaxed border-b border-indigo-100/50 pb-2">
                                    <span className="font-semibold text-indigo-900 block mb-1">AI Assessment:</span>
                                    {result.aiExplanation}
                                  </div>
                                )}
                                
                                {result.matchedText && (
                                  <p className="text-slate-600">
                                    <strong className="text-slate-700">Matched Evidence:</strong>{' '}
                                    <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">{result.matchedText}</span>
                                  </p>
                                )}
                                {result.warning && <p className="text-amber-700 flex items-start gap-1.5"><AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0"/>{result.warning}</p>}
                                {result.guidanceNote && <p className="text-slate-500 italic"><span className="font-semibold text-slate-600">Rule Guidance:</span> {result.guidanceNote}</p>}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {currentReport.reviewStatus === 'submitted' && <p className="text-xs text-amber-700 font-semibold mt-1">Submitted to inspector for approval</p>}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-teal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <Eye className="w-3.5 h-3.5" />
                View Report
              </button>
              <button
                onClick={submitCurrentReport}
                disabled={currentReport.reviewStatus === 'submitted' || currentReport.reviewStatus === 'approved'}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-900 hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-500 transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {currentReport.reviewStatus === 'submitted' ? 'Awaiting Inspector' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
