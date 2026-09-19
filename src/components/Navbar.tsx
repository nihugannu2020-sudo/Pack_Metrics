import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import type { UserRole } from '../types';
import { ShieldCheck, UserCheck, BookOpen, BarChart3, User, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  userName: string;
  onOpenRolePicker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userName,
  onOpenRolePicker,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    inspector: { label: 'Field Inspector', bg: 'bg-teal-600 text-white', text: 'Legal Metrology Inspectorate' },
    manufacturer: { label: 'Manufacturer', bg: 'bg-navy text-white', text: 'Packer & Industry Portal' },
    admin: { label: 'Admin / Officer', bg: 'bg-emerald-700 text-white', text: 'Ministry & Analytics Portal' },
  };

  const currentBadge = roleBadges[currentRole];

  const navItems: { id: string; label: string; icon: typeof ShieldCheck; role: UserRole | 'all' }[] = [
    { id: 'inspector', label: 'Inspector Scan', icon: ShieldCheck, role: 'inspector' },
    { id: 'manufacturer', label: 'Manufacturer Portal', icon: UserCheck, role: 'manufacturer' },
    { id: 'admin', label: 'Admin Analytics', icon: BarChart3, role: 'admin' },
    { id: 'rules', label: 'Rules Reference', icon: BookOpen, role: 'all' },
  ];

  const visibleNavItems = navItems.filter(item => item.role === 'all' || item.role === currentRole);

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-3 gap-4">
          {/* Brand Logo & Govt Header */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-9 h-9 flex items-center justify-center">
              <img src="/logo.png" alt="PackMetrics Logo" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-teal-900">PackMetrics</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Compliance workspace
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
            <nav className="hidden md:flex space-x-1 ml-auto mr-4">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              // determine path from id
              const path = item.id === 'rules' ? '/rules' : `/${item.id}`;
              const isActive = currentPath === path;
              return (
                <Link
                  key={item.id}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-orange-500 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Role Badge & Switcher */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                {userName}
              </span>
              <span className="text-[10px] text-slate-500">{currentBadge.text}</span>
            </div>

            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {currentBadge.label}
            </span>

            <button
              onClick={onOpenRolePicker}
              title="Switch Persona / Role"
              className="flex items-center gap-1 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const path = item.id === 'rules' ? '/rules' : `/${item.id}`;
          const isActive = currentPath === path;
          return (
            <Link
              key={item.id}
              to={path}
              className={`flex flex-col items-center py-1 px-2 rounded text-[10px] ${
                isActive ? 'text-blue-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
