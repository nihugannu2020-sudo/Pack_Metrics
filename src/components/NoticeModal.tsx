import React from 'react';
import type { ComplianceReport, LegalNotice } from '../types';
import { generateLegalNoticeText, downloadNoticePDF } from '../utils/noticeGenerator';
import { FileText, Download, FileCheck, AlertCircle } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ComplianceReport | null;
  officerName: string;
  onSaveNotice: (notice: LegalNotice) => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  report,
  officerName,
  onSaveNotice,
}) => {
  if (!isOpen || !report) return null;

  const { text: noticeText, noticeObj } = generateLegalNoticeText(report, officerName);

  const handleDownload = () => {
    onSaveNotice(noticeObj);
    downloadNoticePDF(noticeText, noticeObj.noticeNumber);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center text-violation">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-teal-900">Official Show-Cause Notice</h3>
                <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded border border-navy-200">
                  {noticeObj.noticeNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Issued under Section 36(1) of Legal Metrology Act, 2009 & PCR Rules 2011
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Notice Preview Text Box */}
        <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
          {noticeText}
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> Prototype output for demonstration purposes — not a substitute for legal review.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital evidence hash attached</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Close Preview
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-900 hover:bg-teal-900 rounded-lg shadow flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Download Signed Notice (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
