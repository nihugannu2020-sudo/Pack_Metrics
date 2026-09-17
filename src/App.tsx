import React, { useState, useEffect } from 'react';
import type { UserRole } from './types';
import { DB } from './utils/db';
import { Navbar } from './components/Navbar';
import { RolePickerModal } from './components/RolePickerModal';
import { LandingPage } from './pages/LandingPage';
import { InspectorDashboard } from './components/dashboards/InspectorDashboard';
import { ManufacturerDashboard } from './components/dashboards/ManufacturerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { RulesReference } from './pages/RulesReference';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('inspector');
  const [userName, setUserName] = useState<string>('Inspector Rajesh Kumar');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  const defaultNames: Record<UserRole, string> = {
    inspector: 'Inspector Rajesh Kumar',
    manufacturer: 'Apex Foods Quality Mgr',
    admin: 'Officer V. Sharma',
  };

  const resolveRoleName = (role: UserRole, name: string): string => {
    const knownDefaultNames = Object.values(defaultNames);
    return name.trim() && !knownDefaultNames.includes(name.trim()) ? name.trim() : defaultNames[role];
  };

  useEffect(() => {
    const role = DB.getUserRole();
    const name = resolveRoleName(role, DB.getUserName());
    setCurrentRole(role);
    setUserName(name);
    DB.setUserName(name);
  }, []);

  const handleSelectRole = (role: UserRole, name: string) => {
    const resolvedName = resolveRoleName(role, name);
    setCurrentRole(role);
    setUserName(resolvedName);
    DB.setUserRole(role);
    DB.setUserName(resolvedName);

    // Auto navigate to corresponding dashboard
    if (role === 'inspector') setActiveTab('inspector');
    else if (role === 'manufacturer') setActiveTab('manufacturer');
    else if (role === 'admin') setActiveTab('admin');
  };

  const authorizedTab = activeTab === 'landing' || activeTab === 'rules' || activeTab === currentRole
    ? activeTab
    : currentRole;

  return (
    <div className="min-h-screen bg-ivory text-teal-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        userName={userName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRolePicker={() => setIsRoleModalOpen(true)}
      />

      {/* Page Routing */}
      <main className="flex-1">
        {authorizedTab === 'landing' && (
          <LandingPage
            onLaunchDemo={() => setActiveTab('inspector')}
            onSelectRole={(r) => handleSelectRole(r, userName)}
          />
        )}

        {authorizedTab === 'inspector' && currentRole === 'inspector' && <InspectorDashboard officerName={userName} />}

        {authorizedTab === 'manufacturer' && currentRole === 'manufacturer' && <ManufacturerDashboard userName={userName} />}

        {authorizedTab === 'admin' && currentRole === 'admin' && <AdminDashboard />}

        {authorizedTab === 'rules' && <RulesReference />}
      </main>

      {/* Role Switcher Modal */}
      <RolePickerModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        currentName={userName}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
}

export default App;
