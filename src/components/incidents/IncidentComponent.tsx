import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentReport, IncidentPriority, IncidentStatus } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Camera,
  ShieldAlert,
  X,
  Trash2,
} from 'lucide-react';

export const IncidentComponent: React.FC = () => {
  const { incidents, addIncident, updateIncidentStatus, deleteIncident, staffList, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'input'>('list');
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [incidentToDelete, setIncidentToDelete] = useState<IncidentReport | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('Open');
  const [actionNotes, setActionNotes] = useState('');

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    category: 'Kecelakaan' as IncidentReport['category'],
    location: 'Area Parkir Utama',
    date: defaultDate,
    time: defaultTime,
    officerName: currentUser.name || 'Ismail',
    priority: 'Medium' as IncidentPriority,
    chronology: '',
    photoUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop&q=80',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chronology.trim()) {
      setErrors({ chronology: 'Kronologi insiden wajib diisi' });
      return;
    }

    addIncident({
      category: form.category,
      location: form.location,
      date: form.date,
      time: form.time,
      officerName: form.officerName,
      priority: form.priority,
      chronology: form.chronology,
      photoUrl: form.photoUrl,
      status: 'Open',
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('list');
    }, 2000);

    setForm({
      category: 'Kecelakaan',
      location: 'Area Parkir Utama',
      date: defaultDate,
      time: defaultTime,
      officerName: currentUser.name || 'Ismail',
      priority: 'Medium',
      chronology: '',
      photoUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop&q=80',
    });
    setErrors({});
  };

  const handleUpdateStatus = () => {
    if (selectedIncident) {
      updateIncidentStatus(selectedIncident.id, newStatus, actionNotes);
      setSelectedIncident(null);
      setActionNotes('');
    }
  };

  const columns: Column<IncidentReport>[] = [
    {
      header: 'No. & Tanggal',
      key: 'incidentNumber',
      accessor: (i) => (
        <div>
          <span className="font-mono font-bold text-rose-700 block">{i.incidentNumber}</span>
          <span className="text-[11px] text-slate-500">{i.date} {i.time}</span>
        </div>
      ),
    },
    {
      header: 'Kategori & Priority',
      key: 'category',
      accessor: (i) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{i.category}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mt-0.5 ${
              i.priority === 'Critical'
                ? 'bg-rose-600 text-white animate-pulse'
                : i.priority === 'High'
                ? 'bg-rose-100 text-rose-800'
                : i.priority === 'Medium'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {i.priority}
          </span>
        </div>
      ),
    },
    {
      header: 'Lokasi & Officer',
      key: 'location',
      accessor: (i) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{i.location}</span>
          <span className="text-[11px] text-slate-500">Petugas: {i.officerName}</span>
        </div>
      ),
    },
    {
      header: 'Kronologi Singkat',
      key: 'chronology',
      accessor: (i) => <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{i.chronology}</p>,
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (i) => (
        <span
          className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
            i.status === 'Open'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : i.status === 'Progress'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {i.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title & Navigation Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Sistem Laporan Insiden & Keamanan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan insiden perkelahian, kecelakaan, trespassing, dan tindakan penanganan cepat.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Insiden
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'input' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Buat Laporan Baru</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <p className="font-bold text-sm">Laporan Insiden Berhasil Dibuat!</p>
            <p className="text-xs text-emerald-100">
              Notifikasi prioritas dikirim ke seluruh Supervisor & Admin LSMS.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: LIST DATATABLE */}
      {activeTab === 'list' && (
        <DataTable
          title="Daftar Insiden LSMS"
          data={incidents}
          columns={columns}
          searchPlaceholder="Cari lokasi, kronologi, nomor insiden, atau petugas..."
          exportFilename="Laporan_Insiden_LSMS"
          filterConfigs={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Open', value: 'Open' },
                { label: 'Progress', value: 'Progress' },
                { label: 'Closed', value: 'Closed' },
              ],
            },
            {
              key: 'priority',
              label: 'Priority',
              options: [
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
              ],
            },
          ]}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedIncident(row);
                  setNewStatus(row.status);
                  setActionNotes(row.actionTaken || '');
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg border border-blue-200 transition-colors"
              >
                Update Status
              </button>

              <button
                onClick={() => setIncidentToDelete(row)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Laporan Insiden"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!incidentToDelete}
        onClose={() => setIncidentToDelete(null)}
        onConfirm={() => {
          if (incidentToDelete) {
            deleteIncident(incidentToDelete.id);
            setIncidentToDelete(null);
          }
        }}
        title="Hapus Laporan Insiden"
        message={`Apakah Anda yakin ingin menghapus Laporan Insiden "${incidentToDelete?.incidentNumber}" (${incidentToDelete?.category})? Data akan terhapus permanen.`}
      />

      {/* TAB 2: INPUT FORM */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Form Laporan Kejadina Insiden Baru</h3>
            <p className="text-xs text-slate-500">Isikan data kronologi kejadian secara objektif.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Insiden</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                <option value="Kecelakaan">Kecelakaan</option>
                <option value="Tabrakan">Tabrakan / Parkir</option>
                <option value="Pertengkaran">Pertengkaran / Perkelahian</option>
                <option value="Tanpa Izin">Masuk Tanpa Izin (Trespassing)</option>
                <option value="Kehilangan">Kehilangan Barang</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Prioritas (Priority)</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value="Low">Low (Ringan)</option>
                <option value="Medium">Medium (Sedang)</option>
                <option value="High">High (Tinggi)</option>
                <option value="Critical">Critical (Sangat Darurat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Kejadian</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                placeholder="Detail tempat kejadian..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Pelapor</label>
              <select
                value={form.officerName}
                onChange={(e) => setForm({ ...form, officerName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kejadian</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jam Kejadian</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kronologi Kejadian <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.chronology}
                onChange={(e) => setForm({ ...form, chronology: e.target.value })}
                className={`w-full border ${
                  errors.chronology ? 'border-rose-500' : 'border-slate-300'
                } rounded-lg p-3 text-xs text-slate-800`}
                placeholder="Ceritakan alur kejadian mulai dari awal hingga kondisi terkini..."
              />
              {errors.chronology && <span className="text-[10px] text-rose-500 block mt-0.5">{errors.chronology}</span>}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIMPAN LAPORAN INSIDEN</span>
            </button>
          </div>
        </form>
      )}

      {/* UPDATE INCIDENT MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Update Status Insiden ({selectedIncident.incidentNumber})</span>
              </h3>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{selectedIncident.category} di {selectedIncident.location}</p>
              <p className="text-slate-600">{selectedIncident.chronology}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Baru</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value="Open">Open (Belum Ditangani)</option>
                <option value="Progress">Progress (Dalam Penanganan)</option>
                <option value="Closed">Closed (Selesai Penanganan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tindakan Penanganan yang Diambil</label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                placeholder="Tuliskan tindakan pengamanan yang sudah dilakukan..."
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
