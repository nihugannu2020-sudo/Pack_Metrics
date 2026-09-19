import React, { useState } from 'react';
import type { UserRole } from '../types';
import { ShieldCheck, Factory, Building2, User, CheckCircle2, ArrowRight } from 'lucide-react';

interface RolePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onProceed: (role: UserRole) => void;
}

export const RolePickerModal: React.FC<RolePickerModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onProceed,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const rolesList = [
    {
      id: 'inspector' as UserRole,
      title: 'Field Inspector',
      subtitle: 'Legal Metrology Officer',
      description: 'Perform live package label OCR scans, inspect statutory declarations, flag non-compliances, and generate legal notices.',
      icon: ShieldCheck,
      badgeColor: 'border-teal-500 bg-teal-50 text-teal-700',
    },
    {
      id: 'manufacturer' as UserRole,
      title: 'Manufacturer / Packer',
      subtitle: 'Industry Compliance Portal',
      description: 'Review compliance rate trends for your products, view flagged label scans, and acknowledge show-cause notices.',
      icon: Factory,
      badgeColor: 'border-navy bg-teal-50 text-teal-900',
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin / Executive',
      subtitle: 'Ministry Governance & Analytics',
      description: 'High-level executive metrics, violation distribution charts, compliance performance over time, and policy impact reports.',
      icon: Building2,
      badgeColor: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    },
  ];

  const handleConfirm = () => {
    onProceed(selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-2xl w-full p-6 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-xl font-bold font-heading text-teal-900">Select User Persona</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch role to experience PackMetrics from different stakeholder perspectives.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
          {rolesList.map(role => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${role.badgeColor} shadow-md scale-[1.02]`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-teal-600' : 'text-teal-900'}`} />
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                  </div>
                  <h4 className="font-bold text-teal-900 text-sm">{role.title}</h4>
                  <span className="text-[11px] font-medium text-slate-500 block mb-2">{role.subtitle}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white teal-gradient rounded-lg shadow hover:opacity-95 transition flex items-center gap-1.5"
          >
            <span>Launch Portal as {rolesList.find(r => r.id === selectedRole)?.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
