import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  UserX,
  QrCode,
  AlertTriangle,
  FileCheck2,
  PackageSearch,
  Package,
  Car,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  UserPlus,
  AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface MainDashboardProps {
  setActiveMenu?: (menu: string) => void;
  setActiveTab?: (menu: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ setActiveMenu, setActiveTab }) => {
  const handleSetActive = setActiveMenu || setActiveTab || (() => {});
  const {
    visitors,
    patrolLogs,
    incidents,
    dailyReports,
    lostAndFound,
    barangTitipan,
    vehiclesLog,
    notifications,
  } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Stats Calculations
  const visitorsToday = visitors.filter((v) => v.date === todayStr);
  const activeVisitors = visitors.filter((v) => v.status === 'Masih di Sekolah');
  const checkedOutVisitors = visitors.filter((v) => v.date === todayStr && v.status === 'Sudah Keluar');
  const overdueVisitors = activeVisitors.filter((v) => (v.durationMinutes || 0) > 240);

  const patrolToday = patrolLogs.filter((p) => p.date === todayStr);
  const openIncidents = incidents.filter((i) => i.status !== 'Closed');
  const criticalIncidents = incidents.filter((i) => i.priority === 'Critical' && i.status !== 'Closed');

  const pendingLostFound = lostAndFound.filter((l) => l.status === 'Belum Diambil');
  const activeBarangTitipan = barangTitipan.filter((b) => b.status === 'Dititipkan');
  const activeVehicles = vehiclesLog.filter((v) => v.status === 'Masih Keluar');

  // Chart data for visitor per hour
  const hourlyData = [
    { hour: '07:00', visitor: 2 },
    { hour: '08:00', visitor: 8 },
    { hour: '09:00', visitor: 12 },
    { hour: '10:00', visitor: 15 },
    { hour: '11:00', visitor: 9 },
    { hour: '12:00', visitor: 5 },
    { hour: '13:00', visitor: 11 },
    { hour: '14:00', visitor: 7 },
    { hour: '15:00', visitor: 4 },
  ];

  const weeklyData = [
    { day: 'Sen', visitor: 28, patroli: 14, insiden: 1 },
    { day: 'Sel', visitor: 35, patroli: 16, insiden: 0 },
    { day: 'Rab', visitor: 31, patroli: 15, insiden: 2 },
    { day: 'Kam', visitor: 42, patroli: 18, insiden: 1 },
    { day: 'Jum', visitor: 38, patroli: 16, insiden: 0 },
    { day: 'Sab', visitor: 12, patroli: 12, insiden: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Pengawasan Keamanan Realtime</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Dashboard Operasional Security Lazuardi
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
              Pantau seluruh aktivitas visitor, patroli QR code, laporan harian, insiden, dan aset kendaraan sekolah dalam satu tampilan terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleSetActive('visitor-checkin')}
              className="px-3.5 py-2 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-blue-700" />
              <span>Visitor Check In</span>
            </button>
            <button
              onClick={() => handleSetActive('patrol')}
              className="px-3.5 py-2 bg-blue-700/80 hover:bg-blue-700 border border-blue-500/50 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-blue-300" />
              <span>Scan Patroli</span>
            </button>
            <button
              onClick={() => handleSetActive('incidents')}
              className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Lapor Insiden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical System Alert Banners if any */}
      {(overdueVisitors.length > 0 || criticalIncidents.length > 0) && (
        <div className="space-y-2">
          {overdueVisitors.map((v) => (
            <div
              key={v.id}
              onClick={() => handleSetActive('visitor-checkout')}
              className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200/70 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    PERINGATAN VISITOR OVERDUE ({v.name} - {v.visitorCardNumber})
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Visitor di {v.destinationUnit} masuk sejak {v.timeIn} (Durasi &gt; 4 Jam). Belum checkout!
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 underline flex items-center gap-1">
                Checkout Sekarang <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}

          {criticalIncidents.map((i) => (
            <div
              key={i.id}
              onClick={() => handleSetActive('incidents')}
              className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-100/80 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-200/70 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-800 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    INSIDEN CRITICAL: {i.category} di {i.location}
                  </p>
                  <p className="text-[11px] text-rose-800">{i.chronology}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-900 underline flex items-center gap-1">
                Lihat Detail <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 9 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {/* 1. Visitor Hari Ini */}
        <div
          onClick={() => handleSetActive('visitor-checkin')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Visitor Hari Ini</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{visitorsToday.length}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% dari kemarin
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total pengunjung tercatat di pos</p>
        </div>

        {/* 2. Visitor Masih Aktif */}
        <div
          onClick={() => handleSetActive('visitor-checkout')}
          className={`p-4 bg-white rounded-xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            overdueVisitors.length > 0 ? 'border-amber-300 ring-2 ring-amber-400/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Visitor Masih Aktif</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeVisitors.length}</span>
            {overdueVisitors.length > 0 && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {overdueVisitors.length} Overdue
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sedang berada di lingkungan sekolah</p>
        </div>

        {/* 3. Visitor Sudah Checkout */}
        <div
          onClick={() => handleSetActive('visitor-checkout')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Visitor Checkout</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{checkedOutVisitors.length}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Selesai kunjungan hari ini</p>
        </div>

        {/* 4. Patroli Hari Ini */}
        <div
          onClick={() => handleSetActive('patrol')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Patroli Hari Ini</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{patrolToday.length} Scan</span>
            <span className="text-xs text-indigo-600 font-semibold">100% On-Time</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Titik QR terpantau aman</p>
        </div>

        {/* 5. Insiden */}
        <div
          onClick={() => handleSetActive('incidents')}
          className={`p-4 bg-white rounded-xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            openIncidents.length > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Laporan Insiden</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{openIncidents.length} Open</span>
            <span className="text-xs text-slate-500">Total: {incidents.length}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Laporan perlu penanganan</p>
        </div>

        {/* 6. Daily Security Report */}
        <div
          onClick={() => handleSetActive('daily-report')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Laporan Harian</span>
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{dailyReports.length} Shift</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Lengkap
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Serah terima siaga terlaksana</p>
        </div>

        {/* 7. Lost and Found */}
        <div
          onClick={() => handleSetActive('lost-found')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lost & Found</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <PackageSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingLostFound.length} Barang</span>
            <span className="text-xs text-slate-400">Belum Diambil</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Disimpan di Pos Keamanan</p>
        </div>

        {/* 8. Penitipan Barang */}
        <div
          onClick={() => handleSetActive('barang-titipan')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Penitipan Barang</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{activeBarangTitipan.length} Barang</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tersimpan di loker security</p>
        </div>

        {/* 9. Kendaraan Sekolah */}
        <div
          onClick={() => handleSetActive('school-vehicles')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Kendaraan Sekolah</span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeVehicles.length} Keluar</span>
            <span className="text-xs text-slate-400">Sedang Tugas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Armada operasional sekolah</p>
        </div>
      </div>

      {/* DASHBOARD REALTIME CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Visitor Per Jam */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Statistik Visitor Per Jam (Hari Ini)</h3>
              <p className="text-xs text-slate-500">Kepadatan pengunjung di Pintu Utama</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              Realtime
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="visitor" name="Jumlah Visitor" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tren Mingguan Visitor & Patroli */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Operasional Mingguan</h3>
              <p className="text-xs text-slate-500">Perbandingan Aktivitas Visitor & Patroli</p>
            </div>
            <button
              onClick={() => handleSetActive('analytics')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Lihat Analytics Lengkap
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="visitor" name="Visitor" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="patroli" name="Patroli Scan" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* QUICK TABLE: Visitor Aktif Saat Ini */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Daftar Visitor Aktif Masih di Sekolah ({activeVisitors.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Visitor yang belum melakukan checkout</p>
          </div>
          <button
            onClick={() => handleSetActive('visitor-checkout')}
            className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Buka Halaman Checkout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3">No. Card</th>
                <th className="p-3">Nama Visitor</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Tujuan / Unit</th>
                <th className="p-3">Jam Masuk</th>
                <th className="p-3">Durasi</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeVisitors.length > 0 ? (
                activeVisitors.map((v) => {
                  const isOverdue = (v.durationMinutes || 0) > 240;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{v.visitorCardNumber}</td>
                      <td className="p-3 font-medium text-slate-900">{v.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium text-[10px]">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{v.destinationUnit} ({v.hostPerson})</td>
                      <td className="p-3 font-mono">{v.timeIn} WIB</td>
                      <td className="p-3 font-mono">
                        {v.durationMinutes ? `${Math.floor(v.durationMinutes / 60)}j ${v.durationMinutes % 60}m` : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] border border-amber-300">
                            Terlama (&gt;4j)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            Masih Aktif
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    Tidak ada visitor aktif saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
