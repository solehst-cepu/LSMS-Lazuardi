import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AlertOctagon } from 'lucide-react';

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
  const { isAuthenticated, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderAccessDenied = (title: string, message: string) => (
    <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center max-w-md mx-auto my-12">
      <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-xs text-slate-600 mb-6 leading-relaxed">
        {message}
      </p>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );

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
        if (currentUser.role === 'User') {
          return renderAccessDenied(
            'Akses Master Data Ditolak',
            `Akun Anda (${currentUser.name}) memiliki role ${currentUser.role}. Master Data hanya dapat diakses oleh Administrator dan Supervisor.`
          );
        }
        return <MasterDataComponent />;
      case 'users':
        if (currentUser.role !== 'Administrator') {
          return renderAccessDenied(
            'Akses Pengaturan User Ditolak',
            `Akun Anda (${currentUser.name}) memiliki role ${currentUser.role}. Halaman Pengaturan User & Kebijakan Login hanya dapat diakses dan diubah oleh Administrator.`
          );
        }
        return <UserSettingsComponent />;
      case 'reports':
      case 'reports-export':
        return <ReportsCenter />;
      case 'audit-log':
        if (currentUser.role === 'User') {
          return renderAccessDenied(
            'Akses Audit Log Ditolak',
            `Akun Anda (${currentUser.name}) memiliki role ${currentUser.role}. Audit Log hanya dapat dilihat oleh Administrator dan Supervisor.`
          );
        }
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
