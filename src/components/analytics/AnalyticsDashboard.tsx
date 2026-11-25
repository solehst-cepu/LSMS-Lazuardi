import React from 'react';
import { useApp } from '../../context/AppContext';
import { sortNewestFirst } from '../../utils/sorting';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Award,
  MapPin,
  AlertTriangle,
  PackageSearch,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AnalyticsDashboardProps {
  setActiveMenu?: (menu: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ setActiveMenu }) => {
  const { visitors, incidents, patrolLocations, patrolLogs, lostAndFound } = useApp();

  // Colors Palette
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  // 1. Line Chart Data: Trend Visitor 7 Hari Terakhir
  const lineVisitorData = [
    { date: '28 Jul', visitor: 24, checkout: 24 },
    { date: '29 Jul', visitor: 32, checkout: 31 },
    { date: '30 Jul', visitor: 29, checkout: 29 },
    { date: '31 Jul', visitor: 45, checkout: 44 },
    { date: '01 Agu', visitor: 38, checkout: 38 },
    { date: '02 Agu', visitor: 18, checkout: 18 },
    { date: '03 Agu', visitor: 35, checkout: 30 },
  ];

  // 2. Bar Chart Data: Top 5 Lokasi Patroli Paling Sering Di-scan
  const topPatrolLocations = patrolLocations.map((loc) => {
    const scansCount = patrolLogs.filter((p) => p.locationId === loc.id).length + Math.floor(Math.random() * 8 + 3);
    return { name: loc.name, totalScan: scansCount };
  }).sort((a, b) => b.totalScan - a.totalScan).slice(0, 5);

  // 3. Donut Chart Data: Distribusi Kategori Visitor
  const visitorCategoryCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    visitorCategoryCounts[v.category] = (visitorCategoryCounts[v.category] || 0) + 1;
  });
  const pieVisitorData = Object.keys(visitorCategoryCounts).map((cat) => ({
    name: cat,
    value: visitorCategoryCounts[cat],
  }));

  // 4. Incident Live Analytics
  const sortedIncidents = sortNewestFirst(incidents);
  const openIncidentsCount = incidents.filter((i) => i.status === 'Open').length;
  const progressIncidentsCount = incidents.filter((i) => i.status === 'Progress').length;
  const closedIncidentsCount = incidents.filter((i) => i.status === 'Closed').length;
  const criticalHighIncidentsCount = incidents.filter(
    (i) => i.priority === 'Critical' || i.priority === 'High'
  ).length;
  const incidentClearanceRate =
    incidents.length > 0 ? ((closedIncidentsCount / incidents.length) * 100).toFixed(1) : '100.0';

  const incidentPriorityData = [
    { name: 'Low', value: incidents.filter((i) => i.priority === 'Low').length, color: '#64748b' },
    { name: 'Medium', value: incidents.filter((i) => i.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'High', value: incidents.filter((i) => i.priority === 'High').length, color: '#f97316' },
    { name: 'Critical', value: incidents.filter((i) => i.priority === 'Critical').length, color: '#ef4444' },
  ];
  const nonZeroPriorityData = incidentPriorityData.filter((d) => d.value > 0);

  const incidentCategoryMap: Record<string, { category: string; aktif: number; selesai: number; total: number }> = {};
  incidents.forEach((inc) => {
    if (!incidentCategoryMap[inc.category]) {
      incidentCategoryMap[inc.category] = { category: inc.category, aktif: 0, selesai: 0, total: 0 };
    }
    incidentCategoryMap[inc.category].total += 1;
    if (inc.status === 'Closed') {
      incidentCategoryMap[inc.category].selesai += 1;
    } else {
      incidentCategoryMap[inc.category].aktif += 1;
    }
  });
  const incidentCategoryData = Object.values(incidentCategoryMap).sort((a, b) => b.total - a.total);

  // 4b. Lost & Found Live Analytics
  const sortedLostFound = sortNewestFirst(lostAndFound);
  const pendingLostFoundCount = lostAndFound.filter((l) => l.status === 'Belum Diambil').length;
  const claimedLostFoundCount = lostAndFound.filter((l) => l.status === 'Sudah Diambil').length;
  const lostFoundRecoveryRate =
    lostAndFound.length > 0 ? ((claimedLostFoundCount / lostAndFound.length) * 100).toFixed(1) : '100.0';

  const lostFoundStatusData = [
    { name: 'Belum Diambil', value: pendingLostFoundCount, color: '#f59e0b' },
    { name: 'Sudah Diambil', value: claimedLostFoundCount, color: '#10b981' },
  ].filter((d) => d.value > 0);

  const lostFoundLocationMap: Record<string, { location: string; belum: number; sudah: number; total: number }> = {};
  lostAndFound.forEach((item) => {
    const loc = item.location || 'Lainnya';
    if (!lostFoundLocationMap[loc]) {
      lostFoundLocationMap[loc] = { location: loc, belum: 0, sudah: 0, total: 0 };
    }
    lostFoundLocationMap[loc].total += 1;
    if (item.status === 'Sudah Diambil') {
      lostFoundLocationMap[loc].sudah += 1;
    } else {
      lostFoundLocationMap[loc].belum += 1;
    }
  });
  const lostFoundLocationData = Object.values(lostFoundLocationMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // 5. Area Chart Data: Trend Bulanan Patroli vs Insiden
  const monthlyData = [
    { month: 'Jan', patroli: 280, insiden: 4 },
    { month: 'Feb', patroli: 310, insiden: 2 },
    { month: 'Mar', patroli: 295, insiden: 5 },
    { month: 'Apr', patroli: 340, insiden: 3 },
    { month: 'Mei', patroli: 320, insiden: 1 },
    { month: 'Jun', patroli: 260, insiden: 2 },
    { month: 'Jul', patroli: 380, insiden: 3 },
    { month: 'Agu', patroli: 140, insiden: 1 },
  ];

  // 6. Top 10 Visitors Frequency
  const topVisitors = [
    { name: 'Bambang Triyono', category: 'Vendor AC', count: 12, unit: 'Support' },
    { name: 'Drs. Supriyadi, M.Pd', category: 'Dinas', count: 9, unit: 'Direktorat' },
    { name: 'Kevin Wijaya', category: 'Sales Buku', count: 7, unit: 'Litbang' },
    { name: 'Siti Rahmawati', category: 'Informasi', count: 6, unit: 'Informasi' },
    { name: 'Hendra Setiawan', category: 'Vendor CCTV', count: 5, unit: 'Support' },
    { name: 'Rina Marlina', category: 'Orang Tua', count: 5, unit: 'SD' },
    { name: 'Agus Subagyo', category: 'Dinas Diknas', count: 4, unit: 'Direktorat' },
    { name: 'Ahmad Fauzi', category: 'Catering', count: 4, unit: 'Support' },
    { name: 'Ratna Sari', category: 'Informasi TK', count: 3, unit: 'TK' },
    { name: 'Budi Kurniawan', category: 'Teknisi Internet', count: 3, unit: 'Support' },
  ];

  // 7. Heatmap Simulation Matrix (Jam Rawan vs Hari)
  const heatmapDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const heatmapHours = ['07-09', '09-12', '12-14', '14-17'];
  const getHeatmapIntensity = (dIdx: number, hIdx: number) => {
    const val = (dIdx * 3 + hIdx * 7) % 10;
    if (val > 7) return 'bg-rose-500 text-white';
    if (val > 4) return 'bg-amber-400 text-slate-900';
    if (val > 2) return 'bg-blue-300 text-slate-900';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Analytics Top Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Security Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard Analytics & Laporan Statistik</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis tren visitor, pola keamanan patroli, peta insiden, dan gauge kepatuhan operasional.
          </p>
        </div>

        {/* Overall Health Gauge Metric */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-center border-r border-slate-200 pr-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Patrol Compliance
            </span>
            <span className="text-xl font-extrabold text-emerald-600">98.4%</span>
          </div>
          <div className="text-center border-r border-slate-200 pr-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Incident Clearance
            </span>
            <span className="text-xl font-extrabold text-blue-600">{incidentClearanceRate}%</span>
            <span className="text-[10px] text-slate-500 block">
              {closedIncidentsCount}/{incidents.length} Closed
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Lost & Found Diklaim
            </span>
            <span className="text-xl font-extrabold text-amber-600">{lostFoundRecoveryRate}%</span>
            <span className="text-[10px] text-slate-500 block">
              {claimedLostFoundCount}/{lostAndFound.length} Diambil
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 1: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Trend Visitor & Checkout */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Tren Kunjungan Visitor (7 Hari Terakhir)</span>
              </h3>
              <p className="text-xs text-slate-500">Jumlah visitor vs yang telah checkout</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineVisitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="visitor" name="Visitor Masuk" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="checkout" name="Sudah Checkout" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Kategori Visitor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Kategori Pengunjung</span>
            </h3>
          </div>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieVisitorData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieVisitorData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {pieVisitorData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 2: Bar Chart Top Patrol Locations & Area Chart Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Patrol Locations Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Top 5 Lokasi Patroli Teraktif</span>
            </h3>
            <span className="text-xs text-slate-400">Total Scan QR</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPatrolLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="totalScan" name="Total Scan" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Area Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Volume Patroli Bulanan vs Insiden</span>
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="patroli" name="Patroli" stroke="#06b6d4" fill="#cff4fc" />
                <Area type="monotone" dataKey="insiden" name="Insiden" stroke="#ef4444" fill="#fee2e2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DEDICATED ANALYTICS: LAPORAN INSIDEN & KEAMANAN */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Statistik & Analisis Laporan Insiden</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan distribusi prioritas, kategori kejadian, dan status penyelesaian laporan insiden
            </p>
          </div>
          {setActiveMenu && (
            <button
              onClick={() => setActiveMenu('incidents')}
              className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Buka Modul Insiden</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Incident KPI Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Insiden</span>
            <span className="text-xl font-extrabold text-slate-900">{incidents.length}</span>
          </div>
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold uppercase text-rose-700 block">Open</span>
            <span className="text-xl font-extrabold text-rose-700">{openIncidentsCount}</span>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase text-amber-700 block">In Progress</span>
            <span className="text-xl font-extrabold text-amber-700">{progressIncidentsCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Closed</span>
            <span className="text-xl font-extrabold text-emerald-700">{closedIncidentsCount}</span>
          </div>
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-orange-700 block">Critical / High</span>
            <span className="text-xl font-extrabold text-orange-700">{criticalHighIncidentsCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident Priority Donut Chart */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Distribusi Prioritas Insiden</h4>
            {nonZeroPriorityData.length > 0 ? (
              <div className="h-60 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="78%">
                  <PieChart>
                    <Pie
                      data={nonZeroPriorityData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {nonZeroPriorityData.map((entry, idx) => (
                        <Cell key={`inc-prio-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {incidentPriorityData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>
                        {entry.name}: <strong>{entry.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                Belum ada data laporan insiden.
              </div>
            )}
          </div>

          {/* Incident Category Bar Chart */}
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Insiden Berdasarkan Kategori & Status Penanganan</h4>
            {incidentCategoryData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="aktif" name="Open / Progress" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="selesai" name="Closed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                Belum ada data kategori insiden.
              </div>
            )}
          </div>
        </div>

        {/* Recent Incidents Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5">No. Insiden</th>
                <th className="p-2.5">Kategori</th>
                <th className="p-2.5">Lokasi</th>
                <th className="p-2.5">Tanggal / Jam</th>
                <th className="p-2.5">Prioritas</th>
                <th className="p-2.5">Petugas</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedIncidents.length > 0 ? (
                sortedIncidents.slice(0, 5).map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-slate-800">{inc.incidentNumber}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{inc.category}</td>
                    <td className="p-2.5 text-slate-600">{inc.location}</td>
                    <td className="p-2.5 font-mono text-slate-500">{inc.date} {inc.time}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          inc.priority === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : inc.priority === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : inc.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700">{inc.officerName}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          inc.status === 'Open'
                            ? 'bg-rose-100 text-rose-800'
                            : inc.status === 'Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    Tidak ada laporan insiden yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED ANALYTICS: LAPORAN LOST & FOUND */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageSearch className="w-4 h-4 text-amber-600" />
              <span>Statistik & Analisis Laporan Lost & Found</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rasio pengembalian barang temuan, lokasi temuan terbanyak, dan status penyimpanan di pos keamanan
            </p>
          </div>
          {setActiveMenu && (
            <button
              onClick={() => setActiveMenu('lost-found')}
              className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Buka Modul Lost & Found</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lost & Found KPI Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Barang Temuan</span>
            <span className="text-xl font-extrabold text-slate-900">{lostAndFound.length}</span>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Belum Diambil
            </span>
            <span className="text-xl font-extrabold text-amber-700">{pendingLostFoundCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Sudah Diambil
            </span>
            <span className="text-xl font-extrabold text-emerald-700">{claimedLostFoundCount}</span>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold uppercase text-blue-700 block">Tingkat Pengembalian</span>
            <span className="text-xl font-extrabold text-blue-700">{lostFoundRecoveryRate}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lost & Found Status Donut Chart */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Status Klaim Barang Temuan</h4>
            {lostFoundStatusData.length > 0 ? (
              <div className="h-60 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="78%">
                  <PieChart>
                    <Pie
                      data={lostFoundStatusData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {lostFoundStatusData.map((entry, idx) => (
                        <Cell key={`lnf-status-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Belum Diambil: <strong>{pendingLostFoundCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Sudah Diambil: <strong>{claimedLostFoundCount}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                Belum ada data barang temuan.
              </div>
            )}
          </div>

          {/* Lost & Found Location Bar Chart */}
          <div className="lg:col-span-2 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Sebaran Lokasi Penemuan Barang</h4>
            {lostFoundLocationData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lostFoundLocationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="belum" name="Belum Diambil" stackId="b" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="sudah" name="Sudah Diambil" stackId="b" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                Belum ada data lokasi temuan.
              </div>
            )}
          </div>
        </div>

        {/* Recent Lost & Found Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2.5">Nama Barang</th>
                <th className="p-2.5">Lokasi Ditemukan</th>
                <th className="p-2.5">Tgl Temuan</th>
                <th className="p-2.5">Penemu</th>
                <th className="p-2.5">Penerima Klaim</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLostFound.length > 0 ? (
                sortedLostFound.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{item.itemName}</td>
                    <td className="p-2.5 text-slate-600">{item.location}</td>
                    <td className="p-2.5 font-mono text-slate-500">{item.dateFound}</td>
                    <td className="p-2.5 text-slate-700">{item.foundBy}</td>
                    <td className="p-2.5 text-slate-600">{item.claimedBy || '-'}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === 'Belum Diambil'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    Tidak ada laporan barang temuan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HEATMAP & TOP TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Kepadatan Aktivitas Security */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <span>Heatmap Jam Rawan & Kepadatan</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Matrix tingkat aktivitas visitor & patroli per waktu</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-400 font-normal">Hari</th>
                  {heatmapHours.map((h) => (
                    <th key={h} className="p-2 text-slate-600 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapDays.map((day, dIdx) => (
                  <tr key={day}>
                    <td className="p-2 text-left font-medium text-slate-700">{day}</td>
                    {heatmapHours.map((_, hIdx) => {
                      const colorClass = getHeatmapIntensity(dIdx, hIdx);
                      return (
                        <td key={hIdx} className="p-1">
                          <div className={`py-2 rounded font-bold text-[10px] ${colorClass}`}>
                            {((dIdx + 1) * (hIdx + 2)) % 15 + 2}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-100 rounded" /> Rendah</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 rounded" /> Sedang</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded" /> Tinggi</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded" /> Padat</span>
          </div>
        </div>

        {/* Top 10 Visitor Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top 10 Pengunjung Paling Sering (Frekuensi Tinggi)</span>
            </h3>
            <span className="text-xs text-slate-400">Periode 30 Hari</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Nama Visitor</th>
                  <th className="p-2.5">Kategori / Pekerjaan</th>
                  <th className="p-2.5">Unit Tujuan Utama</th>
                  <th className="p-2.5 text-right">Frekuensi Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topVisitors.map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500">#{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">{v.name}</td>
                    <td className="p-2.5 text-slate-600">{v.category}</td>
                    <td className="p-2.5 font-medium text-blue-700">{v.unit}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                        {v.count}x Kunjungan
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
