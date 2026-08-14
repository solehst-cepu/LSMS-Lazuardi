import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolVehicleLog } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { Car, PlusCircle, CheckCircle2, LogIn, LogOut, Trash2 } from 'lucide-react';

export const SchoolVehiclesComponent: React.FC = () => {
  const { vehiclesLog, vehiclesList, addVehicleLog, returnVehicle, deleteVehicleLog, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'input'>('list');
  const [logToDelete, setLogToDelete] = useState<SchoolVehicleLog | null>(null);

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    vehicleName: 'Daihatsu Gran Max Box',
    plateNumber: 'B 1840 LZ',
    driverName: 'Pak Herman',
    destination: 'Dinas Pendidikan Depok',
    dateOut: defaultDate,
    timeOut: defaultTime,
    purpose: 'Pengantaran berkas dinas dan dokumen akreditasi.',
  });

  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleLog({
      vehicleName: form.vehicleName,
      plateNumber: form.plateNumber,
      driverName: form.driverName,
      destination: form.destination,
      dateOut: form.dateOut,
      timeOut: form.timeOut,
      purpose: form.purpose,
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('list');
    }, 2000);
  };

  const handleReturn = (id: string) => {
    const timeIn = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    returnVehicle(id, timeIn);
  };

  const columns: Column<SchoolVehicleLog>[] = [
    {
      header: 'Armada & Plat',
      key: 'vehicleName',
      accessor: (v) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{v.vehicleName}</span>
          <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
            {v.plateNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Driver & Tujuan',
      key: 'driverName',
      accessor: (v) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{v.driverName}</span>
          <span className="text-[11px] text-slate-500">{v.destination}</span>
        </div>
      ),
    },
    {
      header: 'Jam Keluar / Masuk',
      key: 'timeOut',
      accessor: (v) => (
        <div className="text-xs font-mono">
          <span className="text-amber-700 block">Out: {v.dateOut} {v.timeOut}</span>
          <span className="text-emerald-700 block">In: {v.timeIn || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Status Armada',
      key: 'status',
      accessor: (v) =>
        v.status === 'Masih Keluar' ? (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] border border-amber-200">
            Masih Keluar
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
            Sudah Kembali
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-700" />
            <span>Pengawasan Kendaraan & Armada Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat izin keluar masuk bus sekolah, mobil operasional, dan driver tugas luar.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Keluar Masuk
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'input' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Keberangkatan</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <p className="font-bold text-sm">Izin Keberangkatan Kendaraan Berhasil Disimpan!</p>
        </div>
      )}

      {/* TAB 1: LIST TABLE */}
      {activeTab === 'list' && (
        <DataTable
          title="Log Kendaraan Sekolah LSMS"
          data={vehiclesLog}
          columns={columns}
          searchPlaceholder="Cari armada, plat nomor, driver, atau tujuan..."
          exportFilename="Kendaraan_Sekolah_LSMS"
          actions={(row) => (
            <div className="flex items-center gap-2">
              {row.status === 'Masih Keluar' && (
                <button
                  onClick={() => handleReturn(row.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Armada Kembali</span>
                </button>
              )}

              <button
                onClick={() => setLogToDelete(row)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Log Kendaraan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={() => {
          if (logToDelete) {
            deleteVehicleLog(logToDelete.id);
            setLogToDelete(null);
          }
        }}
        title="Hapus Log Kendaraan"
        message={`Apakah Anda yakin ingin menghapus log kendaraan "${logToDelete?.vehicleName}" (${logToDelete?.plateNumber})? Data akan terhapus permanen.`}
      />

      {/* TAB 2: INPUT FORM */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Form Keberangkatan Kendaraan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Armada Kendaraan</label>
              <select
                value={form.plateNumber}
                onChange={(e) => {
                  const matched = vehiclesList.find((v) => v.plateNumber === e.target.value);
                  if (matched) {
                    setForm({ ...form, vehicleName: matched.name, plateNumber: matched.plateNumber });
                  }
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.plateNumber}>
                    {v.name} ({v.plateNumber}) - {v.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Driver Bertugas</label>
              <input
                type="text"
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Pak Herman / Pak Yudi"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Lokasi</label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maksud & Keperluan Tugas</label>
              <input
                type="text"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIMPAN KEBERANGKATAN</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
