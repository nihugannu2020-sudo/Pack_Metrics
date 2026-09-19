import React, { useState } from 'react';
import type { UserRole } from '../types';
import { ShieldCheck, Factory, Building2, User, Key, Building, Hash } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onLogin: (name: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, role, onLogin }) => {
  const [fullName, setFullName] = useState('');
  const [govtId, setGovtId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      if (username === 'admin' && password === 'admin@123') {
        onLogin('Officer V. Sharma');
      } else {
        setError('Invalid admin credentials.');
      }
    } else if (role === 'inspector') {
      if (!fullName.trim() || !govtId.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      onLogin(fullName.trim());
    } else if (role === 'manufacturer') {
      if (!fullName.trim() || !companyName.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      onLogin(`${fullName.trim()} - ${companyName.trim()}`);
    }
  };

  const roleInfo = {
    inspector: { title: 'Govt Agent Login', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    manufacturer: { title: 'Manufacturer Login', icon: Factory, color: 'text-navy', bg: 'bg-teal-50' },
    admin: { title: 'Admin Login', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' }
  }[role];

  const Icon = roleInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-md w-full p-6 overflow-hidden animate-slide-up relative bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${roleInfo.bg}`}>
              <Icon className={`w-5 h-5 ${roleInfo.color}`} />
            </div>
            <h2 className="text-xl font-bold font-heading text-teal-900">{roleInfo.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">✕</button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          {role === 'inspector' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-teal-600" /> Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Inspector R. Kumar" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-teal-600" /> Unique Govt ID</label>
                <input type="text" value={govtId} onChange={e => setGovtId(e.target.value)} placeholder="e.g. LM-84920" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
            </>
          )}

          {role === 'manufacturer' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-teal-600" /> Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Ramesh Patel" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-teal-600" /> Manufacturing Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Apex Foods Ltd." className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
            </>
          )}

          {role === 'admin' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-teal-600" /> Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1.5 flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-teal-600" /> Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
            </>
          )}

          <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-lg shadow hover:bg-teal-700 transition">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
};
