import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, AlertOctagon, Globe2, FileCheck2, ArrowRight, Zap, TrendingDown, Scale, Lock, Info, XCircle, Factory, Building2 } from 'lucide-react';
import type { UserRole } from '../types';
import { LoginModal } from '../components/LoginModal';

interface LandingPageProps {
  onSelectRole: (role: 'inspector' | 'manufacturer' | 'admin', name?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  
  const problemSteps = [
    {
      num: '01',
      title: 'Manual Physical Audits',
      desc: 'Inspectors measure text height with handheld rulers across millions of retail packaging SKUs.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Undetected Violations',
      desc: 'Missing MRPs, hidden manufacturer contacts, and non-standard weights slip past manual checks.',
      icon: AlertOctagon,
    },
    {
      num: '03',
      title: 'E-Commerce Blindspots',
      desc: 'Digital dark stores & online marketplaces list packaged goods without mandatory PDP disclosures.',
      icon: Globe2,
    },
    {
      num: '04',
      title: 'Scattered Paper Records',
      desc: 'Lack of centralized digital evidence trails weakens enforcement in legal show-cause proceedings.',
      icon: FileCheck2,
    },
    {
      num: '05',
      title: 'Delayed Legal Notices',
      desc: 'Drafting notices manually takes weeks per violation, causing backlog & loss of consumer trust.',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white text-teal-900 pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Legal Metrology Act 2009 & PCR Rules 2011 Automated Verification
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-teal-900 max-w-4xl mx-auto leading-tight">
            AI-powered Legal Metrology compliance, <span className="text-teal-600">in seconds.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Instant in-browser OCR, AST-style statutory rule verification, visual bounding-box evidence mapping, and automated legal notice generation.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Inspector Card */}
            <button
              onClick={() => setLoginRole('inspector')}
              className="text-left group p-6 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-900 mb-1">Field Inspector</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">Govt Agents: Scan packages & issue legal notices</p>
                </div>
                <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Access Portal <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </button>

            {/* Manufacturer Card */}
            <button
              onClick={() => setLoginRole('manufacturer')}
              className="text-left group p-6 bg-white rounded-2xl border border-slate-200 hover:border-navy shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-900 mb-1">Manufacturer</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">Packers: Self-audit packaging compliance</p>
                </div>
                <div className="flex items-center text-navy font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Access Portal <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => setLoginRole('admin')}
              className="text-left group p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-900 mb-1">Administrator</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">Executive: View national compliance metrics</p>
                </div>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Access Portal <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-4 flex items-center gap-1.5"
            >
              <Info className="w-4 h-4" />
              How to use PackMetrics
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="p-3 text-center border-r border-teal-900 last:border-0">
              <span className="block text-2xl font-bold text-teal-600 font-heading">7 Statutory</span>
              <span className="text-xs text-slate-400">Rule 6 Declarations</span>
            </div>
            <div className="p-3 text-center border-r border-teal-900 last:border-0">
              <span className="block text-2xl font-bold text-teal-900 font-heading">&lt; 3 Seconds</span>
              <span className="text-xs text-slate-500">OCR & Rule Check Time</span>
            </div>
            <div className="p-3 text-center border-r border-teal-900 last:border-0">
              <span className="block text-2xl font-bold text-emerald-400 font-heading">100% Client-Side</span>
              <span className="text-xs text-slate-500">Zero API Key / Server</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-2xl font-bold text-teal-600 font-heading">PDF Notice</span>
              <span className="text-xs text-slate-500">Section 36(1) Draft</span>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm" onClick={() => setShowInstructions(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-teal-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-heading font-bold text-xl flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                How to use PackMetrics
              </h3>
              <button onClick={() => setShowInstructions(false)} className="text-slate-400 hover:text-white transition">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-slate-600">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-teal-900">Choose Your Role</h4>
                  <p className="text-sm">Click "Launch Interactive Demo" to simulate an end-to-end workflow, or select a specific role (Inspector/Manufacturer) from the top right navigation.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-teal-900">Upload Package Images</h4>
                  <p className="text-sm">In the dashboard, upload a photo of a product package or choose one of our sample gallery presets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-teal-900">Review AI OCR Analysis</h4>
                  <p className="text-sm">PackMetrics will instantly scan the image, run it against the Legal Metrology Rule 6 guidelines, and generate an AI-powered compliance checklist.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-teal-900">Take Action</h4>
                  <p className="text-sm">Inspectors can draft and file legal notices directly from the dashboard. Manufacturers can review failures and improve their packaging.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-5 py-2 bg-teal-900 text-white font-semibold rounded-lg hover:bg-teal-900 transition"
              >
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      )}

      {loginRole && (
        <LoginModal
          isOpen={!!loginRole}
          role={loginRole}
          onClose={() => setLoginRole(null)}
          onLogin={(name) => {
            setLoginRole(null);
            onSelectRole(loginRole, name);
          }}
        />
      )}

      {/* Problem Cycle Visual Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-teal-900">
            The Enforcement Challenge in Packaging Compliance
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Traditional manual inspection workflows struggle to keep pace with India's rapidly expanding FMCG and e-commerce retail supply chains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {problemSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold font-heading text-teal-600">{step.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-900 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-teal-900 text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Before / After Transformation Grid */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Paradigm Shift</span>
            <h2 className="text-3xl font-bold font-heading text-teal-900 mt-1">
              How PackMetrics Automates Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-red-50/50 border border-red-200 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-violation font-bold text-lg mb-4">
                <AlertOctagon className="w-5 h-5" />
                <span>Before: Legacy Inspection Workflow</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-violation font-bold">✕</span>
                  <span>Physical ruler measurement of MRP font size & PDP area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violation font-bold">✕</span>
                  <span>Inconsistent interpretation of mandatory manufacturer disclosures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violation font-bold">✕</span>
                  <span>Paper-based inspection reports taking 10-15 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violation font-bold">✕</span>
                  <span>No automated cross-verification for imported product declarations</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-emerald-50/50 border border-emerald-200 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-compliant font-bold text-lg mb-4">
                <ShieldCheck className="w-5 h-5" />
                <span>After: PackMetrics AI Pipeline</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-compliant font-bold">✓</span>
                  <span>Instant OCR text extraction with green/red bounding-box visual evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-compliant font-bold">✓</span>
                  <span>Pure AST-style Rule Engine matching exact 2011 Rule 6 regex patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-compliant font-bold">✓</span>
                  <span>One-click statutory Show-Cause Notice generation exportable to PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-compliant font-bold">✓</span>
                  <span>Centralized digital scan history for executive auditing & trend charts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Impact Framing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-teal-900 text-base mb-2">Audit Cost Reduction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlines officer verification time per SKU by 85%, enabling higher coverage of retail packaging without expanding field force overhead.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-center mb-4">
                <Scale className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-teal-900 text-base mb-2">MSME Fair Competition</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents non-compliant packaging from undercutting legitimate compliant manufacturers who follow statutory standard weight and pricing disclosures.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-teal-900 text-base mb-2">Consumer Loss Mitigation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protects consumers against deceptive package sizing, hidden MRPs, and missing grievance contacts across physical stores and dark-store e-commerce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="mt-auto bg-teal-900 text-white py-8 px-4 border-t border-teal-900 text-center">
        <p className="text-xs text-slate-400">
          PackMetrics Prototype • Legal Metrology Act 2009 & Packaged Commodities Rules 2011 Demo
        </p>
      </footer>
    </div>
  );
};
