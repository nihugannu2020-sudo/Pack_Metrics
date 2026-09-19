import React from 'react';
import { ShieldCheck, AlertOctagon, Lightbulb, UserCheck, ChevronRight } from 'lucide-react';
import type { ComplianceReport } from '../types';

interface ExecutiveSummaryProps {
  summary: ComplianceReport['executiveSummary'];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
        </div>
        <h3 className="text-xl font-heading font-bold text-slate-800">AI Executive Summary</h3>
      </div>

      <div className="space-y-6">
        {/* Overall Assessment */}
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            Compliance Assessment
          </h4>
          <p className="text-slate-700 leading-relaxed font-medium">
            {summary.assessment}
          </p>
        </div>

        {/* Agent View */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            Government Agent Simulation
          </h4>
          <p className="text-slate-700 leading-relaxed italic">
            "{summary.agentView}"
          </p>
        </div>

        {/* Recommendations */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Actionable Recommendations
            </h4>
            <ul className="space-y-2">
              {summary.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <ChevronRight className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
