import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { Visitor } from '../../types';
import {
  UserMinus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  X,
  UserCheck,
  Trash2,
} from 'lucide-react';

export const VisitorCheckOut: React.FC = () => {
  const { visitors, checkOutVisitor, deleteVisitor, currentUser, staffList } = useApp();

  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);
  const [checkoutOfficer, setCheckoutOfficer] = useState(currentUser.name || 'Ahmad Soleh');
  const [successToast, setSuccessToast] = useState(false);

  // Stats Metrics
  const activeVisitors = visitors.filter((v) => v.status === 'Masih di Sekolah');
  const checkedOutCount = visitors.filter((v) => v.status === 'Sudah Keluar').length;
  const overdueVisitors = activeVisitors.filter((v) => (v.durationMinutes || 0) > 240);

  const handleCheckout = (visitor: Visitor) => {
    checkOutVisitor(visitor.id, checkoutOfficer);
    setSelectedVisitor(null);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const columns: Column<Visitor>[] = [
    {
      header: 'Foto & Visitor',
      key: 'name',
      accessor: (v) => (
        <div className="flex items-center gap-3">
          <img
            src={
              v.photoUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
            }
            alt={v.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block leading-tight">{v.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">{v.visitorNumber}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'No. Card',
      key: 'visitorCardNumber',
      accessor: (v) => <span className="font-mono font-bold text-blue-700">{v.visitorCardNumber}</span>,
    },
    {
      header: 'Kategori & HP',
      key: 'category',
      accessor: (v) => (
        <div>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold block w-max">
            {v.category}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{v.phone}</span>
        </div>
      ),
    },
    {
      header: 'Tujuan Unit / Personel',
      key: 'destinationUnit',
      accessor: (v) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">{v.destinationUnit}</span>
          <span className="text-[11px] text-slate-500">{v.hostPerson}</span>
        </div>
      ),
    },
    {
      header: 'Jam Masuk / Keluar',
      key: 'timeIn',
      accessor: (v) => (
        <div className="text-xs font-mono">
          <span className="text-emerald-700 block">In: {v.timeIn}</span>
          <span className="text-rose-700 block">Out: {v.timeOut || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Durasi',
      key: 'durationMinutes',
      accessor: (v) => {
        if (!v.durationMinutes) return <span className="text-slate-400">-</span>;
        const hrs = Math.floor(v.durationMinutes / 60);
        const mins = v.durationMinutes % 60;
        const isOverdue = v.status === 'Masih di Sekolah' && v.durationMinutes > 240;
        return (
          <span
            className={`font-mono text-xs font-bold ${
              isOverdue ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200' : 'text-slate-700'
            }`}
          >
            {hrs}j {mins}m
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (v) =>
        v.status === 'Masih di Sekolah' ? (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] border border-amber-200">
            Masih di Sekolah
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
            Sudah Keluar
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserMinus className="w-5 h-5 text-blue-700" />
            <span>Visitor Check Out & Pemantauan Pengunjung</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Proses checkout visitor, pengembalian kartu ID, dan deteksi visitor terlama.
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <p className="font-bold text-sm">Visitor Berhasil Checkout!</p>
            <p className="text-xs text-emerald-100">Status diperbarui menjadi "Sudah Keluar" & Durasi tercatat.</p>
          </div>
        </div>
      )}

      {/* SUMMARY STATS METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Visitor Aktif</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{activeVisitors.length}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Belum melakukan checkout</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Sudah Checkout</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{checkedOutCount}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Kartu ID dikembalikan</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 uppercase block">Visitor Terlama (&gt;4 Jam)</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{overdueVisitors.length}</span>
          <p className="text-[11px] text-amber-700/80 mt-0.5">Perlu dikonfirmasi oleh security</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Total Pengunjung Hari Ini</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">{visitors.length}</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Tercatat di Pos Security</p>
        </div>
      </div>

      {/* DATATABLE WITH SEARCH, FILTER, SORT, EXPORT EXCEL/PDF, PRINT */}
      <DataTable
        title="Laporan Visitors LSMS"
        data={visitors}
        columns={columns}
        searchPlaceholder="Cari nama, nomor kartu, instansi, atau unit..."
        exportFilename="Laporan_Visitor_LSMS"
        filterConfigs={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Masih di Sekolah', value: 'Masih di Sekolah' },
              { label: 'Sudah Keluar', value: 'Sudah Keluar' },
            ],
          },
          {
            key: 'category',
            label: 'Kategori',
            options: [
              { label: 'Dinas', value: 'Dinas' },
              { label: 'Informasi Sekolah', value: 'Informasi Sekolah' },
              { label: 'Sales', value: 'Sales' },
              { label: 'Vendor', value: 'Vendor' },
              { label: 'Lainnya', value: 'Lainnya' },
            ],
          },
        ]}
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.status === 'Masih di Sekolah' ? (
              <button
                onClick={() => setSelectedVisitor(row)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>CHECK OUT</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Selesai</span>
            )}

            <button
              onClick={() => setVisitorToDelete(row)}
              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus Data Visitor"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <ConfirmModal
        isOpen={!!visitorToDelete}
        onClose={() => setVisitorToDelete(null)}
        onConfirm={() => {
          if (visitorToDelete) {
            deleteVisitor(visitorToDelete.id);
            setVisitorToDelete(null);
          }
        }}
        title="Hapus Data Visitor"
        message={`Apakah Anda yakin ingin menghapus data visitor "${visitorToDelete?.name}" (${visitorToDelete?.visitorNumber})? Data akan terhapus permanen dari sistem.`}
      />

      {/* CHECKOUT MODAL DIALOG */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-600" />
                <span>Konfirmasi Checkout Visitor</span>
              </h3>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visitor Detail Card inside Modal */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <img
                src={
                  selectedVisitor.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={selectedVisitor.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 text-sm">{selectedVisitor.name}</p>
                <p className="text-blue-700 font-mono font-bold">
                  Card ID: {selectedVisitor.visitorCardNumber} ({selectedVisitor.visitorNumber})
                </p>
                <p className="text-slate-600">
                  Tujuan: <span className="font-semibold">{selectedVisitor.destinationUnit}</span> ({selectedVisitor.hostPerson})
                </p>
                <p className="text-slate-500">Jam Masuk: {selectedVisitor.timeIn} WIB</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petugas Checkout Security
              </label>
              <select
                value={checkoutOfficer}
                onChange={(e) => setCheckoutOfficer(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedVisitor(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleCheckout(selectedVisitor)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>PROSES CHECKOUT SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
