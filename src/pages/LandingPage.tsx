import React from 'react';
import { ShieldCheck, Search, AlertOctagon, Globe2, FileCheck2, ArrowRight, Zap, TrendingDown, Scale, Lock } from 'lucide-react';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onSelectRole: (role: 'inspector' | 'manufacturer' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDemo, onSelectRole }) => {
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
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white text-navy-900 pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-blue-700 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Legal Metrology Act 2009 & PCR Rules 2011 Automated Verification
          </div>

          <h1 className="font-serif-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-900 max-w-4xl mx-auto leading-tight">
            AI-powered Legal Metrology compliance, <span className="text-saffron">in seconds.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Instant in-browser OCR, AST-style statutory rule verification, visual bounding-box evidence mapping, and automated legal notice generation.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-8 py-4 bg-saffron text-white font-bold text-base rounded-xl shadow-xl hover:bg-saffron-600 transition flex items-center justify-center gap-2"
            >
              <span>Launch Interactive Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSelectRole('admin')}
              className="w-full sm:w-auto px-6 py-4 bg-white text-slate-700 border border-slate-300 font-semibold text-base rounded-xl hover:bg-slate-50 transition"
            >
              Explore Executive Analytics
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="p-3 text-center border-r border-navy-800 last:border-0">
              <span className="block text-2xl font-bold text-saffron font-serif-heading">7 Statutory</span>
              <span className="text-xs text-slate-400">Rule 6 Declarations</span>
            </div>
            <div className="p-3 text-center border-r border-navy-800 last:border-0">
              <span className="block text-2xl font-bold text-navy-900 font-serif-heading">&lt; 3 Seconds</span>
              <span className="text-xs text-slate-500">OCR & Rule Check Time</span>
            </div>
            <div className="p-3 text-center border-r border-navy-800 last:border-0">
              <span className="block text-2xl font-bold text-emerald-400 font-serif-heading">100% Client-Side</span>
              <span className="text-xs text-slate-500">Zero API Key / Server</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-2xl font-bold text-saffron font-serif-heading">PDF Notice</span>
              <span className="text-xs text-slate-500">Section 36(1) Draft</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Cycle Visual Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif-heading text-navy-900">
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
                    <span className="text-2xl font-bold font-serif-heading text-saffron">{step.num}</span>
                    <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-900 flex items-center justify-center group-hover:bg-saffron group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{step.title}</h3>
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
            <span className="text-xs font-bold uppercase tracking-wider text-saffron">Paradigm Shift</span>
            <h2 className="text-3xl font-bold font-serif-heading text-navy-900 mt-1">
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
              <div className="w-10 h-10 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5 text-saffron" />
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Audit Cost Reduction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlines officer verification time per SKU by 85%, enabling higher coverage of retail packaging without expanding field force overhead.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center mb-4">
                <Scale className="w-5 h-5 text-saffron" />
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">MSME Fair Competition</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents non-compliant packaging from undercutting legitimate compliant manufacturers who follow statutory standard weight and pricing disclosures.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-saffron" />
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Consumer Loss Mitigation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protects consumers against deceptive package sizing, hidden MRPs, and missing grievance contacts across physical stores and dark-store e-commerce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="mt-auto bg-navy-900 text-white py-8 px-4 border-t border-navy-800 text-center">
        <p className="text-xs text-slate-400">
          PackMetrics Prototype • Legal Metrology Act 2009 & Packaged Commodities Rules 2011 Demo
        </p>
      </footer>
    </div>
  );
};
