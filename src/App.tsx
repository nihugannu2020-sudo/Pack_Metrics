import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import type { UserRole } from './types';
import { DB } from './utils/db';
import { Navbar } from './components/Navbar';
import { RolePickerModal } from './components/RolePickerModal';
import { LandingPage } from './pages/LandingPage';
import { InspectorDashboard } from './components/dashboards/InspectorDashboard';
import { ManufacturerDashboard } from './components/dashboards/ManufacturerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { RulesReference } from './pages/RulesReference';
import { LoginModal } from './components/LoginModal';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('inspector');
  const [userName, setUserName] = useState<string>('Inspector Rajesh Kumar');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

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
    
    const nameParts = resolvedName.split(' - ');
    const personName = nameParts[0].trim();
    const organization = nameParts.length > 1 ? nameParts[1].trim() : (role === 'admin' ? 'System Administrator' : 'Govt of India');
    DB.logUserActivity(role, personName, organization);

    // Auto navigate to corresponding dashboard
    if (role === 'inspector') navigate('/inspector');
    else if (role === 'manufacturer') navigate('/manufacturer');
    else if (role === 'admin') navigate('/admin');
  };

  // Helper for role-based route protection
  const ProtectedRoute = ({ allowedRole, children }: { allowedRole: UserRole, children: React.ReactNode }) => {
    if (currentRole !== allowedRole) {
      return <Navigate to={`/${currentRole}`} replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-ivory text-teal-900 flex flex-col font-sans">
      <Navbar
        currentRole={currentRole}
        userName={userName}
        onOpenRolePicker={() => setIsRoleModalOpen(true)}
      />
      <Toaster position="top-right" />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onSelectRole={(r, n) => handleSelectRole(r, n || userName)} />} />
          <Route path="/rules" element={<RulesReference />} />
          <Route path="/inspector" element={
            <ProtectedRoute allowedRole="inspector">
              <InspectorDashboard officerName={userName} />
            </ProtectedRoute>
          } />
          <Route path="/manufacturer" element={
            <ProtectedRoute allowedRole="manufacturer">
              <ManufacturerDashboard userName={userName} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isRoleModalOpen && (
        <RolePickerModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentRole={currentRole}
          onProceed={(role) => {
            setIsRoleModalOpen(false);
            setLoginRole(role);
          }}
        />
      )}

      {loginRole && (
        <LoginModal
          isOpen={!!loginRole}
          role={loginRole}
          onClose={() => setLoginRole(null)}
          onLogin={(name) => {
            setLoginRole(null);
            handleSelectRole(loginRole, name);
          }}
        />
      )}
    </div>
  );
}

export default App;
