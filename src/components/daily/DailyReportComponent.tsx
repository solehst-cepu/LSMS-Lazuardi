import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyReportChecklist, DailyReport } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { FileText, CheckSquare, Camera, ShieldCheck, CheckCircle2, UserCheck, PlusCircle, Trash2 } from 'lucide-react';

export const DailyReportComponent: React.FC = () => {
  const { dailyReports, addDailyReport, deleteDailyReport, staffList, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'input'>('list');
  const [reportToDelete, setReportToDelete] = useState<DailyReport | null>(null);

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);

  const defaultStaffNames = [
    'Ismail',
    'Sarmdi',
    'Ahmad Soleh',
    'Andreas Maulana',
    'Moch Saepurrohman',
    'Rizki Maulana',
    'Coirul Fikri',
    'Andyka Jessy Saputra',
    'Aditya Nugraha',
    'Rizki Ramadhan',
  ];

  const [form, setForm] = useState({
    date: defaultDate,
    shift: 'Siang' as 'Siang' | 'Malam',
    officers: ['Ismail', 'Ahmad Soleh', 'Andreas Maulana'],
    weather: 'Cerah' as 'Cerah' | 'Hujan' | 'Berawan' | 'Mendung',
    generalSituation: 'Situasi sekolah terpantau aman, tertib, dan terkendali. Tidak ada kejanggalan.',
    checklist: {
      gerbang: true,
      gedung: true,
      cctv: true,
      pagar: true,
      lampu: true,
      apar: true,
      parkir: true,
      posSecurity: true,
    } as DailyReportChecklist,
    notes: 'Seluruh sistem pengamanan fisik dan CCTV berfungsi optimal.',
    photos: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=80'],
    dayCommander: 'Ismail',
    nightChief: 'Coirul Fikri',
    handoverNotes: 'Perlengkapan HT, kunci pintu utama, dan logbook diserahkan lengkap.',
  });

  const [successToast, setSuccessToast] = useState(false);

  const handleOfficerToggle = (name: string) => {
    setForm((prev) => {
      const exists = prev.officers.includes(name);
      return {
        ...prev,
        officers: exists ? prev.officers.filter((o) => o !== name) : [...prev.officers, name],
      };
    });
  };

  const handleChecklistToggle = (key: keyof DailyReportChecklist) => {
    setForm((prev) => ({
      ...prev,
      checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDailyReport({
      date: form.date,
      shift: form.shift,
      officers: form.officers,
      weather: form.weather,
      generalSituation: form.generalSituation,
      checklist: form.checklist,
      notes: form.notes,
      photos: form.photos,
      handoverStatus: {
        dayCommander: form.dayCommander,
        nightChief: form.nightChief,
        isSigned: true,
        handoverNotes: form.handoverNotes,
      },
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('list');
    }, 2000);
  };

  const columns: Column<any>[] = [
    { header: 'Tanggal & Shift', key: 'date', accessor: (r) => (
      <div>
        <span className="font-bold text-slate-900 block">{r.date}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.shift === 'Siang' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
          Shift {r.shift}
        </span>
      </div>
    )},
    { header: 'Cuaca', key: 'weather', accessor: (r) => <span className="font-medium text-slate-700">{r.weather}</span> },
    { header: 'Petugas Jaga', key: 'officers', accessor: (r) => (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {r.officers.map((o: string) => (
          <span key={o} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded border border-slate-200">
            {o}
          </span>
        ))}
      </div>
    )},
    { header: 'Situasi Umum', key: 'generalSituation', accessor: (r) => (
      <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{r.generalSituation}</p>
    )},
    { header: 'Serah Terima', key: 'handoverStatus', accessor: (r) => (
      <div className="text-[11px] text-slate-600">
        <p><span className="font-semibold text-slate-800">Siang:</span> {r.handoverStatus?.dayCommander}</p>
        <p><span className="font-semibold text-slate-800">Malam:</span> {r.handoverStatus?.nightChief}</p>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Top Title & Navigation Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>Daily Security Report (Laporan Harian)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan rekapitulasi tugas jaga, checklist fasilitas, dan serah terima komandan regu.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Laporan Harian
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'input' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Input Laporan Baru</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <p className="font-bold text-sm">Laporan Harian Berhasil Disimpan!</p>
            <p className="text-xs text-emerald-100">Data serah terima jaga tersimpan di database LSMS.</p>
          </div>
        </div>
      )}

      {/* TAB 1: LIST TABLE */}
      {activeTab === 'list' && (
        <DataTable
          title="Daily Security Reports LSMS"
          data={dailyReports}
          columns={columns}
          searchPlaceholder="Cari tanggal, situasi, atau nama petugas..."
          exportFilename="Daily_Security_Report_LSMS"
          actions={(row) => (
            <button
              onClick={() => setReportToDelete(row)}
              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Hapus Laporan Harian"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Hapus</span>
            </button>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={() => {
          if (reportToDelete) {
            deleteDailyReport(reportToDelete.id);
            setReportToDelete(null);
          }
        }}
        title="Hapus Laporan Harian"
        message={`Apakah Anda yakin ingin menghapus Laporan Harian tanggal ${reportToDelete?.date} Shift ${reportToDelete?.shift}? Data akan terhapus permanen.`}
      />

      {/* TAB 2: INPUT FORM */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Form Input Daily Security Report</h3>
            <p className="text-xs text-slate-500">Lengkapi data laporan tugas jaga harian secara teliti.</p>
          </div>

          {/* Tanggal, Shift, Cuaca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Laporan</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shift Jaga</label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, shift: 'Siang' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    form.shift === 'Siang'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Shift Siang
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, shift: 'Malam' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    form.shift === 'Malam'
                      ? 'bg-indigo-900 text-white border-indigo-950 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Shift Malam
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Cuaca</label>
              <select
                value={form.weather}
                onChange={(e) => setForm({ ...form, weather: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
              >
                <option value="Cerah">Cerah</option>
                <option value="Berawan">Berawan</option>
                <option value="Hujan">Hujan</option>
                <option value="Mendung">Mendung</option>
              </select>
            </div>
          </div>

          {/* Select Petugas Jaga */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Pilih Petugas Security yang Bertugas ({form.officers.length} Terpilih)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {defaultStaffNames.map((name) => {
                const isSelected = form.officers.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleOfficerToggle(name)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist Area Security */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-700" />
              <span>Checklist Kelayakan Fasilitas Keamanan</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'gerbang', label: 'Gerbang Utama' },
                { key: 'gedung', label: 'Area Gedung' },
                { key: 'cctv', label: 'Kamera CCTV' },
                { key: 'pagar', label: 'Pagar Keliling' },
                { key: 'lampu', label: 'Penerangan Lampu' },
                { key: 'apar', label: 'Tabung APAR' },
                { key: 'parkir', label: 'Area Parkir' },
                { key: 'posSecurity', label: 'Pos Security' },
              ].map((chk) => {
                const isChecked = form.checklist[chk.key as keyof DailyReportChecklist];
                return (
                  <label
                    key={chk.key}
                    onClick={() => handleChecklistToggle(chk.key as keyof DailyReportChecklist)}
                    className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer select-none flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    <span>{chk.label}</span>
                    <input type="checkbox" checked={isChecked} readOnly className="hidden" />
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] text-white ${
                        isChecked ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      ✓
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Situasi Umum & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Situasi Umum Jaga</label>
              <textarea
                rows={3}
                value={form.generalSituation}
                onChange={(e) => setForm({ ...form, generalSituation: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Serah Terima Jaga */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Status Serah Terima Jaga (Handover)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Komandan Regu Siang</label>
                <select
                  value={form.dayCommander}
                  onChange={(e) => setForm({ ...form, dayCommander: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {defaultStaffNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Regu Malam</label>
                <select
                  value={form.nightChief}
                  onChange={(e) => setForm({ ...form, nightChief: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {defaultStaffNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Serah Terima Barang / Inventaris</label>
              <input
                type="text"
                value={form.handoverNotes}
                onChange={(e) => setForm({ ...form, handoverNotes: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIMPAN LAPORAN HARIAN</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
