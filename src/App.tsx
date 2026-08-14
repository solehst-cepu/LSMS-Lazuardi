import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { LoginScreen } from './components/auth/LoginScreen';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { VisitorCheckIn } from './components/visitor/VisitorCheckIn';
import { VisitorCheckOut } from './components/visitor/VisitorCheckOut';
import { PatrolComponent } from './components/patrol/PatrolComponent';
import { DailyReportComponent } from './components/daily/DailyReportComponent';
import { IncidentComponent } from './components/incidents/IncidentComponent';
import { LostFoundComponent } from './components/lostfound/LostFoundComponent';
import { BarangTitipanComponent } from './components/titipan/BarangTitipanComponent';
import { SchoolVehiclesComponent } from './components/vehicles/SchoolVehiclesComponent';
import { MasterDataComponent } from './components/master/MasterDataComponent';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { AuditLogComponent } from './components/audit/AuditLogComponent';
import { UserSettingsComponent } from './components/users/UserSettingsComponent';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'dashboard-main':
        return <MainDashboard setActiveMenu={setActiveTab} />;
      case 'analytics':
      case 'dashboard-analytics':
        return <AnalyticsDashboard />;
      case 'visitor-checkin':
        return <VisitorCheckIn />;
      case 'visitor-checkout':
        return <VisitorCheckOut />;
      case 'patrol':
        return <PatrolComponent />;
      case 'daily-report':
        return <DailyReportComponent />;
      case 'incidents':
        return <IncidentComponent />;
      case 'lost-found':
        return <LostFoundComponent />;
      case 'barang-titipan':
        return <BarangTitipanComponent />;
      case 'school-vehicles':
        return <SchoolVehiclesComponent />;
      case 'master-data':
        return <MasterDataComponent />;
      case 'users':
        return <UserSettingsComponent />;
      case 'reports':
      case 'reports-export':
        return <ReportsCenter />;
      case 'audit-log':
        return <AuditLogComponent />;
      default:
        return <MainDashboard setActiveMenu={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeMenu={activeTab}
        setActiveMenu={setActiveTab}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeMenu={activeTab}
          setActiveMenu={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
