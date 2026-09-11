import React, { useState, useEffect } from 'react';
import type { ComplianceReport, LegalNotice } from '../types';
import { DB } from '../utils/db';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Factory, ShieldCheck, FileText, CheckCircle, AlertTriangle, Building, RefreshCw } from 'lucide-react';

interface ManufacturerDashboardProps {
  userName: string;
}

export const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({ userName }) => {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('All Manufacturers');
  const [scans, setScans] = useState<ComplianceReport[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);

  useEffect(() => {
    setScans(DB.getScans());
    setNotices(DB.getNotices());
  }, []);

  // Unique list of manufacturers found in scans
  const manufacturerList = ['All Manufacturers', ...Array.from(new Set(scans.map(s => s.manufacturerName).filter(Boolean)))];

  const filteredScans = selectedManufacturer === 'All Manufacturers'
    ? scans
    : scans.filter(s => s.manufacturerName.toLowerCase().includes(selectedManufacturer.toLowerCase()));

  const filteredNotices = selectedManufacturer === 'All Manufacturers'
    ? notices
    : notices.filter(n => n.manufacturerName.toLowerCase().includes(selectedManufacturer.toLowerCase()));

  const totalScans = filteredScans.length;
  const compliantScans = filteredScans.filter(s => s.overallStatus === 'Compliant').length;
  const complianceRate = totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 100;

  // Chart data: synthesize daily/weekly compliance trend
  const trendData = [
    { date: '01 Sep', compliance: 66 },
    { date: '03 Sep', compliance: 50 },
    { date: '05 Sep', compliance: 60 },
    { date: '07 Sep', compliance: 85 },
    { date: '09 Sep', compliance: 75 },
    { date: 'Current', compliance: complianceRate },
  ];

  const handleToggleNoticeStatus = (noticeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Open' ? 'Acknowledged' : 'Open';
    DB.updateNoticeStatus(noticeId, nextStatus as any);
    setNotices(DB.getNotices());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-lg border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-saffron" />
            <h1 className="text-2xl font-bold font-serif-heading">Manufacturer & Packer Portal</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-saffron">{userName}</strong> • Self-Audit & Legal Notice Management
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-navy-800 p-2 rounded-xl border border-navy-700">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-semibold">Filter Entity:</span>
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="bg-navy-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-navy-700 focus:outline-none focus:ring-1 focus:ring-saffron"
          >
            {manufacturerList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products Scanned</span>
            <h3 className="text-3xl font-bold font-serif-heading text-navy-900 mt-1">{totalScans}</h3>
            <span className="text-xs text-slate-500">Across retail inspection log</span>
          </div>
          <div className="w-12 h-12 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-saffron" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Pass Rate</span>
            <h3 className="text-3xl font-bold font-serif-heading text-compliant mt-1">{complianceRate}%</h3>
            <span className="text-xs text-emerald-700 font-semibold">{compliantScans} of {totalScans} Products Compliant</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-compliant" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legal Notices Issued</span>
            <h3 className="text-3xl font-bold font-serif-heading text-violation mt-1">{filteredNotices.length}</h3>
            <span className="text-xs text-red-700 font-semibold">
              {filteredNotices.filter(n => n.status === 'Open').length} Pending Action
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 text-violation rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-violation" />
          </div>
        </div>
      </div>

      {/* Compliance Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold font-serif-heading text-navy-900 text-lg">
          Package Declaration Compliance Rate Trend
        </h3>
        <p className="text-xs text-slate-500">
          Historical pass percentage tracking Rule 6 compliance across inspect scans over time.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} unit="%" stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1F3A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Compliance Rate']}
              />
              <Line type="monotone" dataKey="compliance" stroke="#F26B21" strokeWidth={3} dot={{ r: 5, fill: '#F26B21' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issued Legal Notices Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-violation" />
              <span>Show-Cause Notices Issued Against Manufacturer</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click status button to toggle acknowledgment or response state.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{filteredNotices.length} Notices Recorded</span>
        </div>

        {filteredNotices.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No show-cause notices issued for the selected manufacturer filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {filteredNotices.map((notice) => (
              <div key={notice.id} className="p-4 bg-white hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-navy-900 text-white px-2 py-0.5 rounded">
                      {notice.noticeNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Issued: {notice.date}</span>
                    <span className="text-xs text-slate-500">• By {notice.issuedBy}</span>
                  </div>
                  <h4 className="font-bold text-navy-900 text-sm">{notice.productName}</h4>
                  <p className="text-xs text-slate-600">{notice.manufacturerName} — {notice.manufacturerAddress}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {notice.violations.map((v, idx) => (
                      <span key={idx} className="text-[10px] bg-red-100 text-red-900 px-2 py-0.5 rounded font-semibold border border-red-200">
                        {v.legalRef}: {v.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleNoticeStatus(notice.id, notice.status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                      notice.status === 'Acknowledged'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-saffron text-white hover:bg-saffron-600'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Status: {notice.status} (Click to Toggle)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
