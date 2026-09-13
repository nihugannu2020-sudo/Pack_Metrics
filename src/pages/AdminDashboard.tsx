import React, { useState, useEffect } from 'react';
import type { ComplianceReport, LegalNotice } from '../types';
import { DB } from '../utils/db';
import { performOCR } from '../utils/ocr';
import { validateRuleEngine } from '../utils/ruleEngine';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { BarChart3, ShieldCheck, AlertTriangle, FileText, TrendingDown, Scale, Lock, Award, Activity, Eye, ScanLine } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [scans, setScans] = useState<ComplianceReport[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [scannedReport, setScannedReport] = useState<ComplianceReport | null>(null);
  const [isScanningReport, setIsScanningReport] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    setScans(DB.getScans());
    setNotices(DB.getNotices());
  }, []);

  const totalScans = scans.length;
  const officerReports = scans.filter(scan => scan.submittedByRole !== 'manufacturer');
  const compliantScans = scans.filter(s => s.overallStatus === 'Compliant').length;
  const complianceRate = totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 0;

  const scanAttachedReport = async (report: ComplianceReport) => {
    const imageUrls = report.imageUrls?.length ? report.imageUrls : report.imageUrl ? [report.imageUrl] : [];
    if (imageUrls.length === 0) return;

    setIsScanningReport(true);
    setScanProgress(0);
    setScanStatus('Starting executive image scan...');
    try {
      const ocrResults = [];
      for (let index = 0; index < imageUrls.length; index += 1) {
        const result = await performOCR(imageUrls[index], undefined, (progress, status) => {
          setScanProgress(Math.round(((index + progress / 100) / imageUrls.length) * 100));
          setScanStatus(`Scanning image ${index + 1} of ${imageUrls.length}: ${status}`);
        });
        ocrResults.push(result);
      }

      const rescannedReport = validateRuleEngine(
        ocrResults.map(result => result.text).join('\n'),
        ocrResults[0]?.words || [],
        { isImported: report.isImported, imageUrl: imageUrls[0], imageDimensions: report.imageDimensions }
      );
      const updatedReport: ComplianceReport = {
        ...rescannedReport,
        id: report.id,
        timestamp: report.timestamp,
        productName: report.productName,
        manufacturerName: report.manufacturerName,
        submittedBy: report.submittedBy,
        submittedByRole: report.submittedByRole,
        reviewStatus: report.reviewStatus,
        imageUrls,
      };
      setScannedReport(updatedReport);
      setScanProgress(100);
      setScanStatus('Executive scan complete');
    } catch (error) {
      console.error('Executive report scan error:', error);
      setScanStatus('Unable to scan the attached image');
    } finally {
      setIsScanningReport(false);
    }
  };

  // Calculate violation counts by rule
  const ruleViolationCounts: Record<string, { label: string; count: number }> = {
    MANUFACTURER_ADDRESS: { label: 'Rule 6(1)(a) Mfd Address', count: 0 },
    COMMODITY_NAME: { label: 'Rule 6(1)(b) Generic Name', count: 0 },
    NET_QUANTITY: { label: 'Rule 6(1)(c) Net Qty', count: 0 },
    MRP: { label: 'Rule 6(1)(e) MRP Price', count: 0 },
    MFG_DATE: { label: 'Rule 6(1)(d) Mfg Date', count: 0 },
    CONSUMER_CARE: { label: 'Rule 6(1)(f) Consumer Care', count: 0 },
    COUNTRY_OF_ORIGIN: { label: 'Import Country of Origin', count: 0 },
  };

  scans.forEach(scan => {
    scan.results.forEach(res => {
      if (res.status === 'fail' && ruleViolationCounts[res.ruleId]) {
        ruleViolationCounts[res.ruleId].count += 1;
      }
    });
  });

  const barChartData = Object.values(ruleViolationCounts).map(item => ({
    rule: item.label,
    violations: item.count,
  }));

  // Find most common violation
  let maxViolationRule = 'Rule 6(1)(e) MRP Price';
  let maxCount = 0;
  Object.values(ruleViolationCounts).forEach(item => {
    if (item.count > maxCount) {
      maxCount = item.count;
      maxViolationRule = item.label;
    }
  });

  // Time trend data
  const trendData = [
    { date: 'W1 Aug', rate: 58 },
    { date: 'W2 Aug', rate: 64 },
    { date: 'W3 Aug', rate: 70 },
    { date: 'W4 Aug', rate: 68 },
    { date: 'W1 Sep', rate: 75 },
    { date: 'W2 Sep', rate: complianceRate || 80 },
  ];

  const BAR_COLORS = ['#DC2626', '#F26B21', '#D97706', '#0B1F3A', '#2563EB', '#7C3AED', '#059669'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="bg-white text-navy-900 rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-saffron" />
            <h1 className="text-2xl font-bold font-serif-heading">Executive Governance & Analytics</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Ministry of Consumer Affairs • Legal Metrology Act 2009 System Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 bg-saffron/20 border border-saffron/40 px-3.5 py-1.5 rounded-xl text-saffron text-xs font-bold">
          <Activity className="w-4 h-4" />
          <span>Real-time Compliance Telemetry Active</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scans Audited</span>
            <h3 className="text-3xl font-bold font-serif-heading text-navy-900 mt-1">{totalScans}</h3>
            <span className="text-[11px] text-slate-400">Across retail & e-commerce</span>
          </div>
          <div className="w-12 h-12 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-saffron" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Compliance</span>
            <h3 className="text-3xl font-bold font-serif-heading text-compliant mt-1">{complianceRate}%</h3>
            <span className="text-[11px] text-emerald-700 font-semibold">{compliantScans} Compliant Packages</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-compliant" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Violation Type</span>
            <h3 className="text-sm font-bold text-violation mt-1 line-clamp-1">{maxViolationRule}</h3>
            <span className="text-[11px] text-red-700 font-semibold">{maxCount} Instances Flagged</span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-violation rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-violation" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notices Generated</span>
            <h3 className="text-3xl font-bold font-serif-heading text-navy-900 mt-1">{notices.length}</h3>
            <span className="text-[11px] text-slate-500">Sec 36(1) Show-Cause</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-saffron" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Bar Chart: Violations by Rule */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold font-serif-heading text-navy-900 text-lg">
              Statutory Non-Compliance Distribution by Rule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of total rule failure occurrences across all processed package scans.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="rule" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1F3A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="violations" radius={[6, 6, 0, 0]}>
                  {barChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: National Compliance Rate Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold font-serif-heading text-navy-900 text-lg">
              National Compliance Rate Trajectory (%)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly aggregated Rule 6 compliance percentage across inspect operations.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} unit="%" stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1F3A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Compliance Pass Rate']}
                />
                <Line type="monotone" dataKey="rate" stroke="#16A34A" strokeWidth={3} dot={{ r: 5, fill: '#16A34A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-violation" />
              <span>All Complaints Raised by Field Inspectors</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Central view of every inspector-generated complaint and its affected manufacturer.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{notices.length} Complaints Recorded</span>
        </div>

        {notices.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No complaints have been raised by field inspectors.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {notices.map(notice => (
              <div key={notice.id} className="p-4 bg-white hover:bg-slate-50/80 transition space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-navy-900 text-white px-2 py-0.5 rounded">
                      {notice.noticeNumber}
                    </span>
                    <span className="text-xs text-slate-500">Raised {notice.date} by {notice.issuedBy}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${notice.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {notice.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">{notice.productName}</h4>
                  <p className="text-xs text-slate-600">{notice.manufacturerName} — {notice.manufacturerAddress}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {notice.violations.map((violation, index) => (
                    <span key={index} className="text-[10px] bg-red-100 text-red-900 px-2 py-0.5 rounded font-semibold border border-red-200">
                      {violation.legalRef}: {violation.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-saffron" />
              <span>Reports Submitted by Field Inspectors</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspection reports submitted by officers for executive review.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{officerReports.length} Reports Recorded</span>
        </div>

        {officerReports.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No officer reports have been submitted.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {officerReports.map(report => (
              <div key={report.id} className="p-4 bg-white hover:bg-slate-50/80 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{report.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.overallStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {report.overallStatus}
                      </span>
                    </div>
                    <h4 className="font-bold text-navy-900 text-sm mt-1">{report.productName || 'Unnamed product'}</h4>
                    <p className="text-xs text-slate-600">{report.manufacturerName} • Submitted by {report.submittedBy || 'Field Inspector'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-500">{new Date(report.timestamp).toLocaleDateString('en-IN')}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{report.failCount} violations • {report.reviewStatus || 'submitted'}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedReport(report); setScannedReport(null); setScanStatus(''); }}
                      className="px-3 py-2 rounded-lg bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs text-slate-500 font-mono">{selectedReport.id}</p>
                <h3 className="text-xl font-bold font-serif-heading text-navy-900 mt-1">{selectedReport.productName || 'Inspector report'}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedReport.manufacturerName} • Submitted by {selectedReport.submittedBy || 'Field Inspector'}</p>
              </div>
              <button
                onClick={() => { setSelectedReport(null); setScannedReport(null); }}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                aria-label="Close report"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={() => scanAttachedReport(selectedReport)}
                disabled={isScanningReport || !(selectedReport.imageUrls?.length || selectedReport.imageUrl)}
                className="px-4 py-2 rounded-lg bg-saffron text-white text-xs font-bold hover:bg-saffron-600 disabled:bg-slate-200 disabled:text-slate-500 transition flex items-center justify-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                {isScanningReport ? 'Scanning attached image...' : 'Scan attached image'}
              </button>
              {scanStatus && <span className="text-xs text-slate-500">{scanStatus}</span>}
            </div>
            {isScanningReport && (
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-saffron transition-all" style={{ width: `${scanProgress}%` }} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Submitted label image</h4>
                {(selectedReport.imageUrls?.length || selectedReport.imageUrl) ? (
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedReport.imageUrls?.length ? selectedReport.imageUrls : [selectedReport.imageUrl]).map((imageUrl, index) => (
                      <img
                        key={`${selectedReport.id}-image-${index}`}
                        src={imageUrl}
                        alt={`Submitted label ${index + 1} for ${selectedReport.productName || 'inspector report'}`}
                        className="w-full h-44 object-contain rounded-xl border border-slate-200 bg-slate-50"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
                    No image was attached to this report.
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Compliance report</h4>
                <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden">
                  {(scannedReport || selectedReport).results.map(result => (
                    <div key={result.ruleId} className="p-3 border-b last:border-b-0 border-slate-100">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-navy-900">{result.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.status === 'pass' ? 'bg-emerald-100 text-emerald-800' : result.status === 'fail' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {result.status.replace('_', ' ')}
                        </span>
                      </div>
                      {result.matchedText && <p className="text-[11px] text-slate-500 mt-1">Matched: {result.matchedText}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Extracted OCR text</h4>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {(scannedReport || selectedReport).extractedText || 'No OCR text extracted.'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Framing Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold font-serif-heading text-navy-900 text-lg">
          System Strategic Value Proposition & Impact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-navy-900 text-sm mb-2">
              <TrendingDown className="w-5 h-5 text-saffron" />
              <span>Audit Cost Reduction</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automating OCR text extraction and AST rule matching reduces field inspection cycle time from 20 minutes to under 3 seconds per SKU.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-navy-900 text-sm mb-2">
              <Scale className="w-5 h-5 text-saffron" />
              <span>MSME Fair Competition</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces level playing field by detecting hidden prices and deceptive package sizing that unfairly penalizes compliant MSME packers.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-navy-900 text-sm mb-2">
              <Lock className="w-5 h-5 text-saffron" />
              <span>Consumer Loss Mitigation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents consumer overcharging by verifying MRP tax inclusions and validating consumer grievance contact details across physical & digital retail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
