import React from 'react';
import type { UserRole } from '../types';
import { ShieldCheck, UserCheck, BookOpen, BarChart3, User, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  userName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRolePicker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userName,
  activeTab,
  setActiveTab,
  onOpenRolePicker,
}) => {
  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    inspector: { label: 'Field Inspector', bg: 'bg-saffron text-white', text: 'Legal Metrology Inspectorate' },
    manufacturer: { label: 'Manufacturer', bg: 'bg-navy text-white', text: 'Packer & Industry Portal' },
    admin: { label: 'Admin / Officer', bg: 'bg-emerald-700 text-white', text: 'Ministry & Analytics Portal' },
  };

  const currentBadge = roleBadges[currentRole];

  const navItems = [
    { id: 'inspector', label: 'Inspector Scan', icon: ShieldCheck, role: 'inspector' },
    { id: 'manufacturer', label: 'Manufacturer Portal', icon: UserCheck, role: 'manufacturer' },
    { id: 'admin', label: 'Admin Analytics', icon: BarChart3, role: 'admin' },
    { id: 'rules', label: 'Rules Reference', icon: BookOpen, role: 'all' },
  ];

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-40 shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Govt Header */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 saffron-gradient rounded-lg flex items-center justify-center shadow-lg border border-saffron-500">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-heading font-bold text-xl tracking-tight text-white">PackMetrics</span>
                <span className="text-[10px] bg-saffron/20 text-saffron-100 border border-saffron/40 font-semibold px-1.5 py-0.5 rounded">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-light hidden sm:block">
                Legal Metrology Compliance System • Govt of India
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-saffron text-white shadow'
                      : 'text-slate-200 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Role Badge & Switcher */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-saffron" />
                {userName}
              </span>
              <span className="text-[10px] text-slate-300">{currentBadge.text}</span>
            </div>

            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${currentBadge.bg} shadow-sm`}>
              {currentBadge.label}
            </span>

            <button
              onClick={onOpenRolePicker}
              title="Switch Persona / Role"
              className="flex items-center gap-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 px-2.5 py-1.5 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-saffron" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden bg-navy-950 border-t border-navy-800 px-2 py-1.5 flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded text-[10px] ${
                isActive ? 'text-saffron font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
