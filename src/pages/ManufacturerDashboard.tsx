import React, { useState, useEffect, useRef } from 'react';
import type { ComplianceReport, LegalNotice, SampleLabelPreset } from '../types';
import { DB } from '../utils/db';
import { API } from '../services/api';
import { SAMPLE_PRESETS, generateCanvasLabel } from '../utils/sampleGenerator';
import { performOCR } from '../utils/ocr';
import { validateRuleEngine } from '../utils/ruleEngine';
import { readFileAsDataUrl, stitchImages, compressImage } from '../utils/file';
import toast from 'react-hot-toast';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { Factory, ShieldCheck, FileText, CheckCircle, AlertTriangle, Building, Upload, Send, Eye, CheckCircle2, XCircle, Clock, Info, ShieldAlert, CheckSquare, Sparkles, Loader2, AlertCircle, Scan, Search, Plus, ArrowLeft, ScanLine } from 'lucide-react';

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
  const [mergedCustomImage, setMergedCustomImage] = useState<string | null>(null);
  const [customProductName, setCustomProductName] = useState<string>('');
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'report'>('dashboard');
  const reportSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScans(DB.getScans());
    setNotices(DB.getNotices());
  }, []);

  const nameParts = userName.split(' - ');
  const personName = nameParts[0];
  const companyNameFromLogin = nameParts.length > 1 ? nameParts[1] : '';

  const manufacturerNames = Array.from(new Set(scans.map(s => s.manufacturerName).filter(Boolean)));
  const normalizedUserName = userName.toLowerCase();
  const ownedManufacturer = companyNameFromLogin || manufacturerNames.find(name =>
    name.toLowerCase().split(/\s+/).some(word => word.length >= 4 && normalizedUserName.includes(word))
  ) || userName;

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
    
    const existing = DB.getScans().find(s => s.id === report.id);
    if (existing) {
      DB.updateScan(manufacturerReport);
    } else {
      DB.saveScan(manufacturerReport);
    }
    
    setCurrentReport(manufacturerReport);
    setScans(DB.getScans());

    // Async fetch AI explanations and executive summary
    setIsExplaining(true);
    Promise.all([
      API.getExplanations(manufacturerReport),
      API.getExecutiveSummary(manufacturerReport)
    ]).then(([explanations, executiveSummary]) => {
      const updatedResults = manufacturerReport.results.map(r => ({
        ...r,
        aiExplanation: explanations[r.ruleId]
      }));
      const updatedReport = { 
        ...manufacturerReport, 
        results: updatedResults,
        executiveSummary 
      };
      setCurrentReport(updatedReport);
      DB.updateScan(updatedReport);
      setScans(DB.getScans());
    }).catch(console.error).finally(() => setIsExplaining(false));
  };

  const createNewAudit = () => {
    if (!customProductName.trim()) return;
    
    // Create a draft scan
    const draftScan: ComplianceReport = {
      id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      productName: customProductName.trim(),
      manufacturerName: ownedManufacturer || userName,
      isImported: false,
      imageUrl: '',
      extractedText: '',
      words: [],
      results: [],
      passCount: 0,
      failCount: 0,
      reviewCount: 0,
      overallStatus: 'Draft',
      submittedBy: userName,
      submittedByRole: 'manufacturer',
      reviewStatus: 'draft',
    };
    
    DB.saveScan(draftScan);
    setCurrentReport(draftScan);
    setScans(DB.getScans());
    setCustomFilePreviews([]);
    setActiveView('upload');
  };

  const handleCustomFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageUrls = await Promise.all(files.map(readFileAsDataUrl));
    const mergedImageUrl = await stitchImages(imageUrls);
    
    setCustomFilePreviews(imageUrls);
    setMergedCustomImage(mergedImageUrl);
  };

  const handleRunAiScan = async () => {
    if (!mergedCustomImage) return;
    setIsScanning(true);

    try {
      const ocrResult = await performOCR(mergedCustomImage, undefined, (progress, status) => {
        setOcrProgress(progress);
        setOcrStatusText(status);
      });
      const report = validateRuleEngine(ocrResult.text, ocrResult.words, { isImported: false, imageUrl: mergedCustomImage });
      
      // Compress the images heavily to store them safely in localStorage
      const compressedImageUrls = await Promise.all(customFilePreviews.map(url => compressImage(url, 800, 0.4)));
      const compressedMergedImageUrl = await compressImage(mergedCustomImage, 800, 0.4);
      
      // Preserve the draft ID so it updates the existing folder instead of creating a new one
      if (currentReport && currentReport.id) {
        report.id = currentReport.id;
      }
      
      report.imageUrl = compressedMergedImageUrl;
      report.imageUrls = compressedImageUrls;
      report.productName = currentReport?.productName || customProductName.trim() || 'Custom Uploaded Report';
      report.manufacturerName = ownedManufacturer || userName;
      saveDraftReport(report);
      setActiveView('report');
      setCustomProductName(''); // Reset after upload
      setMergedCustomImage(null);
      setCustomFilePreviews([]);
    } catch (err) {
      console.error('Manufacturer upload error:', err);
      toast.error('Scan failed. Please check if the backend is running.');
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
    toast.success('Audit report submitted successfully!');
  };

  if (activeView === 'upload') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
        <button 
          onClick={() => setActiveView('dashboard')} 
          className="text-teal-700 font-semibold flex items-center gap-2 hover:text-teal-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-heading text-teal-900">Upload Packaging Images</h2>
            <p className="text-slate-500">For commodity: <strong className="text-teal-700">{currentReport?.productName}</strong></p>
          </div>

          <label className={`border-2 border-dashed rounded-xl p-10 text-center block transition ${isScanning ? 'border-teal-300 bg-teal-50 opacity-75 cursor-wait' : 'border-slate-300 hover:border-teal-500 cursor-pointer bg-slate-50 hover:bg-teal-50/30'}`}>
            <input type="file" accept="image/*" multiple onChange={handleCustomFileUpload} disabled={isScanning} className="hidden" />
            <Upload className="w-10 h-10 text-teal-600 mx-auto mb-4" />
            <span className="block text-sm font-bold text-teal-900">Click or drag package images here</span>
            <span className="block text-xs text-slate-500 mt-2">PNG, JPG, or WEBP up to 10MB</span>
          </label>

          {isScanning && (
            <div className="bg-slate-50 border border-teal-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm font-semibold text-teal-900">
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-teal-600" /> {ocrStatusText || 'Extracting text via AI...'}</span>
                <span>{ocrProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}

          {customFilePreviews.length > 0 && !isScanning && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {customFilePreviews.map((preview, index) => (
                  <img key={preview} src={preview} alt={`Uploaded label ${index + 1}`} className="h-32 w-full rounded-lg border border-slate-200 object-cover shadow-sm" />
                ))}
              </div>
              <button
                onClick={handleRunAiScan}
                disabled={isScanning}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ScanLine className="w-5 h-5" />
                Run AI Scan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeView === 'report' && currentReport) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
        <button 
          onClick={() => setActiveView('dashboard')} 
          className="text-teal-700 font-semibold flex items-center gap-2 hover:text-teal-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="space-y-6">
          <div ref={reportSectionRef} id="manufacturer-report" className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-mono text-slate-500">{currentReport.id}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentReport.overallStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {currentReport.overallStatus}
                </span>
              </div>
              <h4 className="text-xl font-bold font-heading text-teal-900 mt-2">{currentReport.productName || 'Uploaded package report'}</h4>
              <p className="text-sm text-slate-500 mt-1">{currentReport.passCount} passed, {currentReport.failCount} failed, {currentReport.reviewCount} requiring review</p>
              
              {(currentReport.failCount > 0 || currentReport.reviewCount > 0) && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Needs attention</p>
                  <div className="space-y-3">
                    {currentReport.results
                      .filter(result => result.status !== 'pass')
                      .map(result => (
                        <div
                          key={result.ruleId}
                          className={`text-sm p-3 rounded-xl border ${
                            result.status === 'fail'
                              ? 'bg-red-50/70 text-red-900 border-red-200'
                              : 'bg-amber-50/70 text-amber-900 border-amber-200'
                          }`}
                        >
                          <div className="font-semibold flex items-center justify-between mb-2">
                            <span>{result.status === 'fail' ? 'Missing: ' : 'Review: '}{result.title}</span>
                            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-white/60 border border-current/10">{result.ruleId}</span>
                          </div>
                          {(result.matchedText || result.warning || result.guidanceNote || isExplaining || result.aiExplanation) && (
                            <details className="mt-2 group" open>
                              <summary className="cursor-pointer font-semibold text-slate-600 text-xs list-none flex items-center gap-1.5 transition-colors group-hover:text-indigo-600">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span>AI Explanation & Details</span>
                              </summary>
                              
                              <div className="mt-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-3 text-sm">
                                {isExplaining && !result.aiExplanation && (
                                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating AI Insights...
                                  </div>
                                )}
                                {result.aiExplanation && (
                                  <div className="text-slate-700 leading-relaxed border-b border-indigo-100/50 pb-3">
                                    <span className="font-semibold text-indigo-900 block mb-1">AI Assessment:</span>
                                    {result.aiExplanation}
                                  </div>
                                )}
                                
                                {result.matchedText && (
                                  <p className="text-slate-600">
                                    <strong className="text-slate-700">Matched Evidence:</strong>{' '}
                                    <span className="font-mono text-xs bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{result.matchedText}</span>
                                  </p>
                                )}
                                {result.warning && <p className="text-amber-700 flex items-start gap-1.5 text-xs font-medium"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{result.warning}</p>}
                                {result.guidanceNote && <p className="text-slate-500 italic text-xs"><span className="font-semibold text-slate-600">Rule Guidance:</span> {result.guidanceNote}</p>}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {currentReport.reviewStatus === 'submitted' && <p className="text-sm text-amber-700 font-semibold mt-3">Submitted to inspector for approval</p>}
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={submitCurrentReport}
                disabled={currentReport.reviewStatus === 'submitted' || currentReport.reviewStatus === 'approved'}
                className="w-full px-5 py-3 rounded-xl text-sm font-bold text-white bg-teal-900 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-500 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {currentReport.reviewStatus === 'submitted' ? 'Awaiting Inspector' : 'Submit for Approval'}
              </button>
            </div>
          </div>
          
          <ExecutiveSummary summary={currentReport.executiveSummary} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header & Filter */}
      <div className="bg-white text-teal-900 rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-teal-600" />
            <h1 className="text-2xl font-bold font-heading">Manufacturer & Packer Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-teal-600">{personName}</strong> • Self-Audit & Legal Notice Management
          </p>
        </div>

        <div className="flex items-center gap-2 bg-teal-900 p-2.5 rounded-xl border border-teal-800">
          <Building className="w-4 h-4 text-teal-300" />
          <span className="text-xs text-teal-200 font-semibold">Organization:</span>
          <span className="text-sm text-white font-bold">{ownedManufacturer || 'No organization assigned'}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Audits</span>
            <h3 className="text-3xl font-bold font-heading text-teal-900 mt-1">{totalScans}</h3>
            <span className="text-xs text-slate-500">Commodity audits recorded</span>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Pass Rate</span>
            <h3 className="text-3xl font-bold font-heading text-emerald-700 mt-1">{complianceRate}%</h3>
            <span className="text-xs text-emerald-700 font-semibold">{compliantScans} of {totalScans} Compliant</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legal Notices</span>
            <h3 className="text-3xl font-bold font-heading text-rose-700 mt-1">{filteredNotices.length}</h3>
            <span className="text-xs text-rose-700 font-semibold">
              {filteredNotices.filter(n => n.status === 'Open').length} Pending Action
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Instruction Column */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold font-heading text-teal-900 text-sm mb-6 uppercase tracking-wider">How to Audit</h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[31px] before:w-0.5 before:bg-slate-100">
              
              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-4 border-white flex items-center justify-center text-teal-600 z-10 shrink-0 shadow-sm">
                  <Scan className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 shadow-sm mt-1">
                  <h4 className="font-bold text-teal-900 text-sm">1. Scan Image</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Upload a clear photo of the packaging.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-4 border-white flex items-center justify-center text-teal-600 z-10 shrink-0 shadow-sm">
                  <Search className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 shadow-sm mt-1">
                  <h4 className="font-bold text-teal-900 text-sm">2. AI Checking</h4>
                  <p className="text-[11px] text-slate-500 mt-1">AI extracts text and checks compliance.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-4 border-white flex items-center justify-center text-teal-600 z-10 shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 shadow-sm mt-1">
                  <h4 className="font-bold text-teal-900 text-sm">3. Verify Results</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Review the generated checklist report.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 border-4 border-white flex items-center justify-center text-teal-600 z-10 shrink-0 shadow-sm">
                  <Send className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 shadow-sm mt-1">
                  <h4 className="font-bold text-teal-900 text-sm">4. Submit Notice</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Submit for inspector approval.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Folders Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold font-heading text-teal-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  My Product Audits
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a commodity folder below, or create a new audit.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter new commodity name..."
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
              />
              <button 
                onClick={createNewAudit}
                disabled={!customProductName.trim()}
                className="px-5 py-2 bg-teal-900 hover:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Create New Audit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setCurrentReport(scan);
                    if (scan.overallStatus === 'Draft') {
                      setActiveView('upload');
                    } else {
                      setActiveView('report');
                    }
                  }}
                  className={`text-left p-4 rounded-xl border transition group hover:-translate-y-0.5 ${currentReport?.id === scan.id ? 'border-teal-500 bg-teal-50/50 shadow-md' : 'border-slate-200 hover:border-teal-400 hover:shadow-md bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${scan.overallStatus === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      scan.overallStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      (scan.overallStatus === 'Draft') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {scan.overallStatus === 'Draft' ? 'Draft' : scan.overallStatus}
                    </span>
                  </div>
                  <h4 className="font-bold font-heading text-teal-900 text-sm line-clamp-1">{scan.productName}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
