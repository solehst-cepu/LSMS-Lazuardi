import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Award,
  MapPin,
  AlertTriangle,
  Users,
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

export const AnalyticsDashboard: React.FC = () => {
  const { visitors, incidents, patrolLocations, patrolLogs } = useApp();

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

  // 4. Pie Chart Data: Priority Insiden
  const incidentPriorityCounts = [
    { name: 'Low', value: incidents.filter((i) => i.priority === 'Low').length || 3 },
    { name: 'Medium', value: incidents.filter((i) => i.priority === 'Medium').length || 5 },
    { name: 'High', value: incidents.filter((i) => i.priority === 'High').length || 2 },
    { name: 'Critical', value: incidents.filter((i) => i.priority === 'Critical').length || 1 },
  ];

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
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-center border-r border-slate-200 pr-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Patrol Compliance
            </span>
            <span className="text-xl font-extrabold text-emerald-600">98.4%</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Incident Clearance
            </span>
            <span className="text-xl font-extrabold text-blue-600">92.0%</span>
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
