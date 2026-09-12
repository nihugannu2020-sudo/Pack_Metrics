import React, { useState, useEffect } from 'react';
import type { ComplianceReport, LegalNotice, SampleLabelPreset } from '../types';
import { SAMPLE_PRESETS, generateCanvasLabel } from '../utils/sampleGenerator';
import { performOCR } from '../utils/ocr';
import { validateRuleEngine } from '../utils/ruleEngine';
import { BoundingBoxCanvas } from '../components/BoundingBoxCanvas';
import { NoticeModal } from '../components/NoticeModal';
import { DB } from '../utils/db';
import { Upload, CheckCircle2, XCircle, AlertTriangle, FileText, Eye, Info, Sparkles, Filter, ClipboardCheck } from 'lucide-react';

interface InspectorDashboardProps {
  officerName: string;
}

export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({ officerName }) => {
  const [activeSourceTab, setActiveSourceTab] = useState<'gallery' | 'upload'>('gallery');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sample-1-compliant');
  const [isImported, setIsImported] = useState<boolean>(false);
  
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatusText, setOcrStatusText] = useState<string>('');
  
  const [scanHistory, setScanHistory] = useState<ComplianceReport[]>([]);
  const [submittedReports, setSubmittedReports] = useState<ComplianceReport[]>([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const history = DB.getScans();
    setScanHistory(history);
    setSubmittedReports(history.filter(scan => scan.reviewStatus === 'submitted'));
    // Auto-run first sample preset so inspector dashboard isn't empty on load
    runPresetScan(SAMPLE_PRESETS[0]);
  }, []);

  const runPresetScan = async (preset: SampleLabelPreset) => {
    setSelectedPresetId(preset.id);
    setCustomFilePreview(null);
    setIsScanning(true);

    // Generate crisp synthetic label canvas & pre-computed OCR fallback
    const { dataUrl, width, height, text: syntheticText, words: syntheticWords } = generateCanvasLabel(preset);

    try {
      // Run OCR (with fallback to synthetic text if Tesseract worker is loading)
      const ocrResult = await performOCR(
        dataUrl,
        { text: syntheticText, words: syntheticWords },
        (progress, status) => {
          setOcrProgress(progress);
          setOcrStatusText(status);
        }
      );

      // Execute AST Rule Engine
      const report = validateRuleEngine(
        ocrResult.text || syntheticText,
        ocrResult.words && ocrResult.words.length > 0 ? ocrResult.words : syntheticWords,
        {
          isImported: preset.config.isImported || isImported,
          imageUrl: dataUrl,
          imageDimensions: { width, height },
        }
      );

      // Override names if preset has specific titles
      if (preset.config.productName) report.productName = preset.config.productName;
      if (preset.config.manufacturer) report.manufacturerName = preset.config.manufacturer;

      setCurrentReport(report);
      DB.saveScan(report);
      setScanHistory(DB.getScans());
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCustomFilePreview(imageUrl);
    setSelectedPresetId('');
    setIsScanning(true);

    try {
      const ocrResult = await performOCR(file, undefined, (progress, status) => {
        setOcrProgress(progress);
        setOcrStatusText(status);
      });

      const report = validateRuleEngine(ocrResult.text, ocrResult.words, {
        isImported,
        imageUrl,
      });

      setCurrentReport(report);
      DB.saveScan(report);
      setScanHistory(DB.getScans());
    } catch (err) {
      console.error('Custom file scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveNotice = (notice: LegalNotice) => {
    DB.saveNotice(notice);
  };

  const reviewManufacturerReport = (report: ComplianceReport, reviewStatus: 'approved' | 'rejected') => {
    DB.updateScanReview(report.id, {
      reviewStatus,
      reviewedBy: officerName,
      reviewedAt: new Date().toISOString(),
      reviewNote: reviewStatus === 'approved' ? 'Approved by field inspector.' : 'Rejected for additional manufacturer review.',
    });
    const updatedScans = DB.getScans();
    setScanHistory(updatedScans);
    setSubmittedReports(updatedScans.filter(scan => scan.reviewStatus === 'submitted'));
    setCurrentReport({ ...report, reviewStatus, reviewedBy: officerName });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Welcome Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-lg border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-saffron animate-pulse"></span>
            <h1 className="text-2xl font-bold font-serif-heading">Field Inspection Dashboard</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-saffron">{officerName}</strong> • Legal Metrology Inspection Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-navy-800 border border-navy-700 px-3.5 py-2 rounded-xl text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isImported}
              onChange={(e) => {
                setIsImported(e.target.checked);
                if (currentReport) {
                  const updated = validateRuleEngine(currentReport.extractedText, currentReport.words, {
                    isImported: e.target.checked,
                    imageUrl: currentReport.imageUrl,
                  });
                  setCurrentReport(updated);
                }
              }}
              className="accent-saffron w-4 h-4"
            />
            <span>Imported Package Flag (Rule 6(1) Country of Origin)</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Left Panel (Scan & Sample Gallery) vs Right Panel (Canvas Overlay & Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sample Gallery & Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold font-serif-heading text-navy-900 mb-3 flex items-center justify-between">
              <span>Scan Package Label</span>
              <Sparkles className="w-4 h-4 text-saffron" />
            </h2>

            {/* Source Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                onClick={() => setActiveSourceTab('gallery')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  activeSourceTab === 'gallery'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sample Gallery (5 Presets)
              </button>
              <button
                onClick={() => setActiveSourceTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  activeSourceTab === 'upload'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload Custom Photo
              </button>
            </div>

            {/* Gallery View */}
            {activeSourceTab === 'gallery' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-2">
                  Select a pre-built synthetic label to run live OCR & rule engine:
                </p>
                {SAMPLE_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => runPresetScan(preset)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-saffron bg-saffron-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-navy-900 text-xs">{preset.title}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            preset.badgeType === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {preset.badgeType === 'pass' ? 'PASS' : 'VIOLATION'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mb-1">{preset.subtitle}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Upload View */}
            {activeSourceTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-saffron rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-saffron-50/20 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-saffron mx-auto mb-2" />
                  <h4 className="font-bold text-navy-900 text-sm">Upload Package Photo</h4>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP formats up to 10MB</p>
                </div>

                {customFilePreview && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                    <img src={customFilePreview} alt="Uploaded Custom" className="max-h-48 object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OCR Progress Bar if running */}
          {isScanning && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between text-xs font-semibold text-navy-900">
                <span>{ocrStatusText || 'Extracting OCR Text...'}</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-saffron h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Extracted Raw OCR Text Box */}
          {currentReport && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Raw Tesseract OCR Text Output
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentReport.words.length} Tokens
                </span>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                {currentReport.extractedText || 'No text extracted.'}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Canvas Bounding Box Overlay & Compliance Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Canvas Overlay Component */}
          <BoundingBoxCanvas report={currentReport} isScanning={isScanning} />

          {/* Compliance Summary Bar & Action Button */}
          {currentReport && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">Inspection ID: {currentReport.id}</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        currentReport.overallStatus === 'Compliant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {currentReport.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 font-serif-heading mt-1">
                    {currentReport.productName}
                  </h3>
                  <p className="text-xs text-slate-600">{currentReport.manufacturerName}</p>
                </div>

                {/* Generate Legal Notice Button */}
                <button
                  disabled={currentReport.failCount === 0}
                  onClick={() => setIsNoticeModalOpen(true)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2 transition ${
                    currentReport.failCount > 0
                      ? 'bg-violation text-white hover:bg-red-700 cursor-pointer animate-pulse'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Legal Notice ({currentReport.failCount} Violations)</span>
                </button>
              </div>

              {/* Statutory Compliance Checklist Table */}
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-3">
                  Rule 6 Statutory Declaration Checklist
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {currentReport.results.map((result) => {
                    return (
                      <div key={result.ruleId} className="p-3.5 bg-white hover:bg-slate-50 transition space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {result.status === 'pass' && (
                              <CheckCircle2 className="w-5 h-5 text-compliant flex-shrink-0 mt-0.5" />
                            )}
                            {result.status === 'fail' && (
                              <XCircle className="w-5 h-5 text-violation flex-shrink-0 mt-0.5" />
                            )}
                            {result.status === 'manual_review' && (
                              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-navy-50 text-navy-900 px-1.5 py-0.5 rounded border border-navy-100">
                                  {result.legalRef}
                                </span>
                                <h5 className="font-bold text-navy-900 text-xs">{result.title}</h5>
                              </div>
                              
                              {result.matchedText && (
                                <p className="text-xs text-slate-700 mt-1">
                                  <strong>Matched Text:</strong> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{result.matchedText}</span>
                                </p>
                              )}

                              {result.warning && (
                                <p className="text-[11px] text-amber-700 font-medium mt-1">
                                  ⚠️ {result.warning}
                                </p>
                              )}

                              {result.guidanceNote && (
                                <p className="text-[11px] text-slate-500 mt-1 italic">
                                  ℹ️ {result.guidanceNote}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                              result.status === 'pass'
                                ? 'bg-emerald-100 text-emerald-800'
                                : result.status === 'fail'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {result.status === 'pass' ? 'PASS' : result.status === 'fail' ? 'FAIL' : 'MANUAL REVIEW'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Honest Scoping Limitation Footnote */}
              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <Info className="w-4 h-4 text-navy-900 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Prototype Guidance Note:</strong> Measuring physical numeral height in millimeters requires a calibrated camera reference target. PackMetrics displays statutory minimum height requirements next to detected Net Qty/MRP values rather than claiming uncalibrated camera measurements.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manufacturer Submission Review Queue */}
      {submittedReports.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-saffron" />
                Manufacturer Reports Awaiting Approval
              </h3>
              <p className="text-xs text-slate-500 mt-1">Review self-audit evidence before accepting it into the inspection record.</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">{submittedReports.length} Pending</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {submittedReports.map(report => (
              <div key={report.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-navy-900">{report.id}</span>
                    <span className="text-[10px] text-slate-500">Submitted by {report.submittedBy || 'Manufacturer'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-navy-900 mt-1">{report.productName || 'Package label report'}</h4>
                  <p className="text-xs text-slate-600">{report.manufacturerName} • {report.passCount} pass / {report.failCount} fail / {report.reviewCount} review</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentReport(report)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-navy-900 hover:bg-slate-50 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => reviewManufacturerReport(report, 'rejected')} className="px-3 py-2 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button onClick={() => reviewManufacturerReport(report, 'approved')} className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Scans Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
            <Filter className="w-4 h-4 text-saffron" />
            <span>Persisted Inspection History Log</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">{scanHistory.length} Scans Saved</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Scan ID / Date</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Manufacturer / Packer</th>
                <th className="p-3">Pass / Fail</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {scanHistory.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-navy-900">{scan.id}</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(scan.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-navy-900">{scan.productName}</td>
                  <td className="p-3 text-slate-600">{scan.manufacturerName}</td>
                  <td className="p-3">
                    <span className="text-emerald-700 font-bold">{scan.passCount} Pass</span> /{' '}
                    <span className="text-violation font-bold">{scan.failCount} Fail</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        scan.overallStatus === 'Compliant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {scan.overallStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setCurrentReport(scan)}
                      className="text-xs text-saffron hover:text-saffron-700 font-bold flex items-center justify-end gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Exporter Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        report={currentReport}
        officerName={officerName}
        onSaveNotice={handleSaveNotice}
      />
    </div>
  );
};
