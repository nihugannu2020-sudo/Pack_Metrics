import React, { useState, useEffect } from 'react';
import type { UserRole } from './types';
import { DB } from './utils/db';
import { Navbar } from './components/Navbar';
import { RolePickerModal } from './components/RolePickerModal';
import { LandingPage } from './pages/LandingPage';
import { InspectorDashboard } from './pages/InspectorDashboard';
import { ManufacturerDashboard } from './pages/ManufacturerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RulesReference } from './pages/RulesReference';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('inspector');
  const [userName, setUserName] = useState<string>('Inspector Rajesh Kumar');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setCurrentRole(DB.getUserRole());
    setUserName(DB.getUserName());
  }, []);

  const handleSelectRole = (role: UserRole, name: string) => {
    setCurrentRole(role);
    setUserName(name);
    DB.setUserRole(role);
    DB.setUserName(name);

    // Auto navigate to corresponding dashboard
    if (role === 'inspector') setActiveTab('inspector');
    else if (role === 'manufacturer') setActiveTab('manufacturer');
    else if (role === 'admin') setActiveTab('admin');
  };

  return (
    <div className="min-h-screen bg-cream text-navy-900 flex flex-col font-sans">
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
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchDemo={() => setActiveTab('inspector')}
            onSelectRole={(r) => handleSelectRole(r, userName)}
          />
        )}

        {activeTab === 'inspector' && <InspectorDashboard officerName={userName} />}

        {activeTab === 'manufacturer' && <ManufacturerDashboard userName={userName} />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'rules' && <RulesReference />}
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
