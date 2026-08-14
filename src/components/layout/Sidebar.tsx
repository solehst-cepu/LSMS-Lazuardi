import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BarChart3,
  UserPlus,
  UserMinus,
  FileText,
  QrCode,
  AlertOctagon,
  PackageSearch,
  Package,
  Car,
  Database,
  FileSpreadsheet,
  History,
  Shield,
  X,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  setIsOpen?: (open: boolean) => void;
  activeMenu?: string;
  activeTab?: string;
  setActiveMenu?: (menu: string) => void;
  setActiveTab?: (menu: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  roleRequired?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  setIsOpen,
  activeMenu,
  activeTab,
  setActiveMenu,
  setActiveTab,
}) => {
  const currentActiveMenu = activeMenu || activeTab || 'dashboard';
  const handleSetActiveMenu = setActiveMenu || setActiveTab || ((_menu: string) => {});
  const handleClose = onClose || (() => setIsOpen?.(false));

  const { visitors, incidents, currentUser } = useApp();

  const activeVisitorsCount = visitors.filter((v) => v.status === 'Masih di Sekolah').length;
  const overdueCount = visitors.filter((v) => v.status === 'Masih di Sekolah' && (v.durationMinutes || 0) > 240).length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'Closed').length;

  const menuGroups: { groupName: string; items: MenuItem[] }[] = [
    {
      groupName: 'DASHBOARD & ANALYTICS',
      items: [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'analytics', label: 'Dashboard Analytics', icon: BarChart3 },
      ],
    },
    {
      groupName: 'OPERASIONAL VISITOR',
      items: [
        { id: 'visitor-checkin', label: 'Visitor Check In', icon: UserPlus },
        {
          id: 'visitor-checkout',
          label: 'Visitor Check Out',
          icon: UserMinus,
          badge: activeVisitorsCount,
          badgeColor: overdueCount > 0 ? 'bg-amber-500' : 'bg-blue-600',
        },
      ],
    },
    {
      groupName: 'SECURITY OPERATIONS',
      items: [
        { id: 'daily-report', label: 'Daily Security Report', icon: FileText },
        { id: 'patrol', label: 'Patroli Security (QR)', icon: QrCode },
        {
          id: 'incidents',
          label: 'Laporan Insiden',
          icon: AlertOctagon,
          badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
          badgeColor: 'bg-rose-600',
        },
        { id: 'lost-found', label: 'Lost and Found', icon: PackageSearch },
        { id: 'barang-titipan', label: 'Barang Titipan', icon: Package },
        { id: 'school-vehicles', label: 'Kendaraan Sekolah', icon: Car },
      ],
    },
    {
      groupName: 'SISTEM & MASTER DATA',
      items: [
        {
          id: 'master-data',
          label: 'Master Data',
          icon: Database,
          roleRequired: ['Administrator', 'Supervisor Security'],
        },
        {
          id: 'users',
          label: 'Pengaturan User & Login',
          icon: UserCog,
          roleRequired: ['Administrator', 'Supervisor Security'],
        },
        { id: 'reports-export', label: 'Pusat Laporan', icon: FileSpreadsheet },
        { id: 'audit-log', label: 'Audit Log System', icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-wider block">LSMS LAZUARDI</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">
                Security ERP
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card in Sidebar */}
        <div className="p-3 mx-3 mt-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-300 font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 font-medium truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuGroups.map((group) => {
            // Check if user has permission for items
            const filteredItems = group.items.filter((item) => {
              if (!item.roleRequired) return true;
              return item.roleRequired.includes(currentUser.role);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.groupName}>
                <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.groupName}
                </div>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActiveMenu === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleSetActiveMenu(item.id);
                          handleClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                              item.badgeColor || 'bg-blue-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          LSMS v2.5 Lazuardi GIS &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
};
