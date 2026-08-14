import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LostAndFound } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  PackageSearch,
  PlusCircle,
  CheckCircle2,
  X,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Trash2,
} from 'lucide-react';

export const LostFoundComponent: React.FC = () => {
  const { lostAndFound, addLostFound, claimLostFound, deleteLostFound, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'input'>('list');
  const [selectedItem, setSelectedItem] = useState<LostAndFound | null>(null);
  const [itemToDelete, setItemToDelete] = useState<LostAndFound | null>(null);
  const [claimedBy, setClaimedBy] = useState('');
  const [claimedPhone, setClaimedPhone] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  // Photo Lightbox state
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    itemName: '',
    location: 'Area Kantin Sekolah',
    dateFound: defaultDate,
    foundBy: currentUser.name || 'Ismail',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    notes: 'Disimpan aman di lemari Pos Security Utama.',
  });

  const [successToast, setSuccessToast] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const samplePhotos = [
    { label: 'Botol Minum', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80' },
    { label: 'Tas Punggung', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80' },
    { label: 'Kacamata', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop&q=80' },
    { label: 'Jaket / Sweater', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=80' },
    { label: 'Jam Tangan', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim()) return;

    addLostFound({
      itemName: form.itemName,
      location: form.location,
      dateFound: form.dateFound,
      foundBy: form.foundBy,
      photoUrl: form.photoUrl,
      notes: form.notes,
      status: 'Belum Diambil',
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('list');
    }, 2000);

    setForm({
      itemName: '',
      location: 'Area Kantin Sekolah',
      dateFound: defaultDate,
      foundBy: currentUser.name || 'Ismail',
      photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
      notes: 'Disimpan aman di lemari Pos Security Utama.',
    });
  };

  const handleClaim = () => {
    if (selectedItem && claimedBy.trim()) {
      claimLostFound(selectedItem.id, claimedBy, claimedPhone, claimNotes);
      setSelectedItem(null);
      setClaimedBy('');
      setClaimedPhone('');
      setClaimNotes('');
    }
  };

  const columns: Column<LostAndFound>[] = [
    {
      header: 'Foto & Barang',
      key: 'itemName',
      accessor: (item) => {
        const photo =
          item.photoUrl ||
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&auto=format&fit=crop&q=80';
        return (
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src={photo}
                alt={item.itemName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 transition-all"
                onClick={() => setPreviewPhoto({ url: photo, title: item.itemName })}
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto({ url: photo, title: item.itemName })}
                className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                title="Perbesar Foto"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{item.itemName}</span>
              <span className="text-[11px] text-slate-500">Ditemukan di: {item.location}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Tanggal & Penemu',
      key: 'dateFound',
      accessor: (item) => (
        <div>
          <span className="font-mono text-xs text-slate-800 block">{item.dateFound}</span>
          <span className="text-[11px] text-slate-500">Oleh: {item.foundBy}</span>
        </div>
      ),
    },
    {
      header: 'Pengambil / Pemilik',
      key: 'claimedBy',
      accessor: (item) =>
        item.status === 'Sudah Diambil' ? (
          <div className="text-xs">
            <span className="font-bold text-emerald-800 block">{item.claimedBy}</span>
            <span className="text-[10px] text-slate-500">{item.claimDate} ({item.claimedPhone})</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Belum Diklaim</span>
        ),
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (item) =>
        item.status === 'Belum Diambil' ? (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] border border-amber-200">
            Belum Diambil
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
            Sudah Diambil
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
            <PackageSearch className="w-5 h-5 text-blue-700" />
            <span>Manajemen Lost and Found (Barang Temuan)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendataan barang tercecer di lingkungan sekolah beserta dokumentasi foto dan proses serah terima.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Barang Temuan
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'input' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Barang Ditemukan</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <p className="font-bold text-sm">Data Penemuan Barang Berhasil Disimpan!</p>
        </div>
      )}

      {/* TAB 1: LIST TABLE */}
      {activeTab === 'list' && (
        <DataTable
          title="Daftar Lost and Found LSMS"
          data={lostAndFound}
          columns={columns}
          searchPlaceholder="Cari nama barang, penemu, pengambil, atau lokasi..."
          exportFilename="Lost_And_Found_LSMS"
          actions={(row) => (
            <div className="flex items-center gap-2">
              {row.status === 'Belum Diambil' && (
                <button
                  onClick={() => setSelectedItem(row)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Serahkan Barang</span>
                </button>
              )}

              <button
                onClick={() => setItemToDelete(row)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Data Barang"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteLostFound(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        title="Hapus Data Barang Temuan"
        message={`Apakah Anda yakin ingin menghapus data barang temuan "${itemToDelete?.itemName}"? Data akan terhapus permanen.`}
      />

      {/* TAB 2: INPUT FORM */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-700" />
            <span>Form Input Penemuan Barang & Dokumentasi Foto</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Deskripsi Barang</label>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Botol Minum Tupperware Hijau / Kunci Motor Honda"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Ditemukan</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Ditemukan</label>
              <input
                type="date"
                value={form.dateFound}
                onChange={(e) => setForm({ ...form, dateFound: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ditemukan Oleh</label>
              <input
                type="text"
                value={form.foundBy}
                onChange={(e) => setForm({ ...form, foundBy: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* DOKUMENTASI FOTO SECTION */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-700" />
              <span>Dokumentasi Foto Fisik Barang Temuan</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Photo Preview Box */}
              <div className="relative group border-2 border-dashed border-slate-300 rounded-xl bg-white p-2 flex flex-col items-center justify-center min-h-[140px]">
                {form.photoUrl ? (
                  <>
                    <img
                      src={form.photoUrl}
                      alt="Preview Barang"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto({ url: form.photoUrl, title: form.itemName || 'Foto Barang' })}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-400 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                    <span className="text-[11px] block">Belum ada foto dipilih</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & Presets */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ambil Foto Kamera</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Preset Samples */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Atau pilih contoh sampel foto barang:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePhotos.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, photoUrl: s.url })}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 text-[10px] font-bold rounded-lg transition-all"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIMPAN DATA BARANG</span>
            </button>
          </div>
        </form>
      )}

      {/* CLAIM MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Serah Terima Barang ke Pemilik</span>
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
              {selectedItem.photoUrl && (
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.itemName}
                  className="w-14 h-14 rounded-lg object-cover border border-blue-200 cursor-pointer"
                  onClick={() => setPreviewPhoto({ url: selectedItem.photoUrl!, title: selectedItem.itemName })}
                />
              )}
              <div>
                <p className="text-xs font-bold text-blue-900">{selectedItem.itemName}</p>
                <p className="text-[11px] text-blue-700">Ditemukan di: {selectedItem.location} ({selectedItem.dateFound})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pengambil</label>
              <input
                type="text"
                value={claimedBy}
                onChange={(e) => setClaimedBy(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                placeholder="Nama Pengambil / Orang Tua / Siswa"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor HP Pengambil</label>
              <input
                type="text"
                value={claimedPhone}
                onChange={(e) => setClaimedPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                placeholder="e.g. 081234567890"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleClaim}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Konfirmasi Penyerahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX PREVIEW MODAL */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl max-w-2xl w-full p-4 border border-slate-800 shadow-2xl relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Foto Fisik Barang: {previewPhoto.title}</span>
              </h4>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center bg-black/40 rounded-xl p-2">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

