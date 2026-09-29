import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Shield,
  UserCheck,
  Clock,
  Menu,
  X,
  AlertTriangle,
  History,
  CheckCircle2,
  ChevronDown,
  LogOut,
  UserCog,
  Database,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  toggleSidebar?: () => void;
  activeMenu?: string;
  setActiveMenu?: (menu: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  toggleSidebar,
  activeMenu = 'dashboard',
  setActiveMenu = (_menu: string) => {},
}) => {
  const handleToggle = onToggleSidebar || toggleSidebar || (() => {});
  const {
    currentUser,
    logout,
    notifications,
    markNotificationRead,
    isSupabaseOnline,
    supabaseLatency,
  } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle & App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
                LAZUARDI SECURITY MANAGEMENT SYSTEM
              </h1>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight sm:hidden">
                LSMS SECURITY
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Lazuardi GCS</p>
            </div>
          </div>
        </div>

        {/* Center Section: Realtime Digital Clock & Supabase Status */}
        <div className="hidden md:flex items-center gap-3">
          <div
            onClick={() => {
              if (currentUser.role !== 'User') {
                setActiveMenu('master-data');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              currentUser.role !== 'User' ? 'cursor-pointer hover:bg-emerald-100' : 'cursor-default'
            } ${
              isSupabaseOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={
              currentUser.role !== 'User'
                ? 'Klik untuk membuka Pengaturan Master Data & Database'
                : 'Status Koneksi Database Supabase'
            }
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase DB</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{dateStr}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-mono font-bold">{timeStr}</span>
          </div>
        </div>

        {/* Right Section: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-600" />
                    Notifikasi Sistem ({unreadNotifs.length})
                  </span>
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkModule) setActiveMenu(n.linkModule);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                          !n.read ? 'bg-blue-50/50 font-medium' : ''
                        }`}
                      >
                        {n.type === 'visitor_overdue' && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        {n.type === 'incident_critical' && (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        {n.type === 'general' && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">Tidak ada notifikasi.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium text-blue-900 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              <div className="text-left hidden sm:block">
                <span className="block font-bold leading-none text-blue-900">{currentUser.name}</span>
                <span className="text-[10px] text-blue-700 font-semibold">{currentUser.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-700" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{currentUser.name}</p>
                  <p className="text-[11px] font-semibold text-blue-700">{currentUser.role}</p>
                  {currentUser.unit && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.unit}</p>
                  )}
                </div>

                <div className="mt-1 px-2 space-y-1">
                  {currentUser.role === 'Administrator' && (
                    <button
                      onClick={() => {
                        setActiveMenu('users');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer"
                    >
                      <UserCog className="w-3.5 h-3.5 text-blue-600" />
                      <span>Pengaturan User</span>
                    </button>
                  )}
                  {currentUser.role !== 'User' && (
                    <button
                      onClick={() => {
                        setActiveMenu('audit-log');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Audit Log</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold border-t border-slate-100 mt-1 pt-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
