import React, { useState } from 'react';
import rulesData from '../data/rules.json';
import { BookOpen, Search, Info, Scale } from 'lucide-react';

export const RulesReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const declarations = rulesData.declarations;
  const filteredDeclarations = declarations.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.legalRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.detectionHint && d.detectionHint.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white text-navy-900 rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-saffron" />
            <h1 className="text-2xl font-bold font-serif-heading">Statutory Rules Reference Directory</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Ground Truth Index: {rulesData.act} & {rulesData.rulesSource}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Rule Code (e.g. Rule 6(1)(a))..."
            className="w-full pl-9 pr-4 py-2 bg-navy-950 text-white placeholder-slate-400 rounded-xl text-xs border border-navy-700 focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>
      </div>

      {/* Rules Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold font-serif-heading text-navy-900 text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-saffron" />
            <span>Rule 6 Mandatory Package Declarations ({filteredDeclarations.length} Active Rules)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Government Gazette Verified</span>
        </div>

        <div className="space-y-4">
          {filteredDeclarations.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-navy-900 text-white px-2.5 py-1 rounded">
                    {rule.legalRef}
                  </span>
                  <h4 className="font-bold text-navy-900 text-sm">{rule.title}</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                  ID: {rule.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">AST Regex Detection Logic:</span>
                  <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                    {rule.regexHints && rule.regexHints.length > 0
                      ? rule.regexHints.join('  ||  ')
                      : 'Heuristic / Prominent line position evaluation'}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Verification Guidance:</span>
                  <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    {rule.detectionHint}
                  </p>
                </div>
              </div>

              {rule.exemptions && (
                <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Statutory Exemptions:</strong> {rule.exemptions.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Font Height Reference Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table 1: Weight / Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold font-serif-heading text-navy-900 text-base">
            Statutory Numeral Height — Net Quantity (Weight / Volume)
          </h4>
          <p className="text-xs text-slate-500">
            Rule 7 requirement for minimum numeral height on principal display panel.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500">
                  <th className="p-2.5">Net Quantity Range</th>
                  <th className="p-2.5">Normal Print (mm)</th>
                  <th className="p-2.5">Molded / Blown (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rulesData.fontHeightTable_WeightOrVolume_mm.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-navy-900">{row.netQuantity}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700">≥ {row.normal} mm</td>
                    <td className="p-2.5 font-mono font-bold text-saffron">≥ {row.moldedOrBlown} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Area of PDP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold font-serif-heading text-navy-900 text-base">
            Statutory Numeral Height — Area of PDP (cm²)
          </h4>
          <p className="text-xs text-slate-500">
            Minimum font height based on calculated Principal Display Panel surface area.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500">
                  <th className="p-2.5">PDP Surface Area</th>
                  <th className="p-2.5">Normal Print (mm)</th>
                  <th className="p-2.5">Molded / Blown (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rulesData.fontHeightTable_AreaOfPDP_mm.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-navy-900">{row.pdpArea}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700">≥ {row.normal} mm</td>
                    <td className="p-2.5 font-mono font-bold text-saffron">≥ {row.moldedOrBlown} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
