import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BarangTitipan } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Package,
  PlusCircle,
  CheckCircle2,
  PenTool,
  RotateCcw,
  X,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Trash2,
} from 'lucide-react';

export const BarangTitipanComponent: React.FC = () => {
  const { barangTitipan, addBarangTitipan, claimBarangTitipan, deleteBarangTitipan, currentUser, staffList } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'input'>('list');
  const [selectedItem, setSelectedItem] = useState<BarangTitipan | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BarangTitipan | null>(null);

  // Photo Lightbox state
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Digital Signature Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    itemDescription: '',
    dateIn: defaultDate,
    timeIn: defaultTime,
    receiverSecurity: currentUser.name || 'Ismail',
    photoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
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
    { label: 'Paket Kardus Kurir', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80' },
    { label: 'Tas / Ransel', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80' },
    { label: 'Kotak Bekal', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80' },
    { label: 'Helm Motor', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80' },
    { label: 'Dokumen Amplop', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80' },
  ];

  // Canvas Drawing Handlers for Digital Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName.trim() || !form.itemDescription.trim()) return;

    addBarangTitipan({
      ownerName: form.ownerName,
      phone: form.phone,
      itemDescription: form.itemDescription,
      dateIn: form.dateIn,
      timeIn: form.timeIn,
      receiverSecurity: form.receiverSecurity,
      photoUrl: form.photoUrl,
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('list');
    }, 2000);

    setForm({
      ownerName: '',
      phone: '',
      itemDescription: '',
      dateIn: defaultDate,
      timeIn: defaultTime,
      receiverSecurity: currentUser.name || 'Ismail',
      photoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
    });
  };

  const handleClaimSubmit = () => {
    let signatureData = undefined;
    if (canvasRef.current) {
      signatureData = canvasRef.current.toDataURL();
    }
    if (selectedItem) {
      claimBarangTitipan(selectedItem.id, signatureData);
      setSelectedItem(null);
    }
  };

  const columns: Column<BarangTitipan>[] = [
    {
      header: 'Foto & Pemilik',
      key: 'ownerName',
      accessor: (t) => {
        const photo =
          t.photoUrl ||
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=80';
        return (
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src={photo}
                alt={t.ownerName}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 transition-all"
                onClick={() => setPreviewPhoto({ url: photo, title: `Paket/Titipan ${t.ownerName}` })}
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto({ url: photo, title: `Paket/Titipan ${t.ownerName}` })}
                className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                title="Perbesar Foto"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{t.ownerName}</span>
              <span className="text-[11px] text-slate-500 font-mono">{t.phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Deskripsi Barang / Paket',
      key: 'itemDescription',
      accessor: (t) => <span className="text-xs font-semibold text-blue-800">{t.itemDescription}</span>,
    },
    {
      header: 'Jam Titip / Ambil',
      key: 'timeIn',
      accessor: (t) => (
        <div className="text-xs font-mono">
          <span className="text-emerald-700 block">Titip: {t.dateIn} {t.timeIn}</span>
          <span className="text-rose-700 block">Ambil: {t.timeOut ? `${t.dateOut} ${t.timeOut}` : '-'}</span>
        </div>
      ),
    },
    {
      header: 'Petugas Penerima',
      key: 'receiverSecurity',
      accessor: (t) => <span className="text-xs text-slate-700">{t.receiverSecurity}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (t) =>
        t.status === 'Dititipkan' ? (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] border border-amber-200">
            Dititipkan
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
            <Package className="w-5 h-5 text-blue-700" />
            <span>Penitipan Barang & Paket (Barang Titipan)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Layanan penitipan barang siswa/guru/paket kurir dengan bukti foto dan verifikasi Tanda Tangan Digital.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Barang Titipan
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'input' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Titip Barang Baru</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <p className="font-bold text-sm">Barang Titipan Berhasil Dicatat!</p>
        </div>
      )}

      {/* TAB 1: LIST TABLE */}
      {activeTab === 'list' && (
        <DataTable
          title="Daftar Barang Titipan LSMS"
          data={barangTitipan}
          columns={columns}
          searchPlaceholder="Cari pemilik, nomor HP, deskripsi barang, atau petugas..."
          exportFilename="Barang_Titipan_LSMS"
          actions={(row) => (
            <div className="flex items-center gap-2">
              {row.status === 'Dititipkan' && (
                <button
                  onClick={() => setSelectedItem(row)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Pengambilan (TTD)</span>
                </button>
              )}

              <button
                onClick={() => setItemToDelete(row)}
                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Hapus Data Barang Titipan"
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
            deleteBarangTitipan(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        title="Hapus Data Barang Titipan"
        message={`Apakah Anda yakin ingin menghapus data barang titipan milik "${itemToDelete?.ownerName}" (${itemToDelete?.itemDescription})? Data akan terhapus permanen.`}
      />

      {/* TAB 2: INPUT FORM */}
      {activeTab === 'input' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-700" />
            <span>Form Penitipan Barang Baru & Dokumentasi Foto</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Barang / Penerima Paket</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Ibu Hendriati / Ananda Sarah 5 SD"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor HP / WA</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. 081298877665"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Isi Barang Titipan</label>
              <textarea
                rows={2}
                value={form.itemDescription}
                onChange={(e) => setForm({ ...form, itemDescription: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800"
                placeholder="Jelaskan jenis barang / paket secara detail..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Security Penerima</label>
              <select
                value={form.receiverSecurity}
                onChange={(e) => setForm({ ...form, receiverSecurity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* DOKUMENTASI FOTO SECTION */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-700" />
              <span>Dokumentasi Foto Fisik Barang Titipan / Paket</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Photo Preview Box */}
              <div className="relative group border-2 border-dashed border-slate-300 rounded-xl bg-white p-2 flex flex-col items-center justify-center min-h-[140px]">
                {form.photoUrl ? (
                  <>
                    <img
                      src={form.photoUrl}
                      alt="Preview Barang Titipan"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto({ url: form.photoUrl, title: form.itemDescription || 'Foto Barang Titipan' })}
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
              <span>SIMPAN BARANG TITIPAN</span>
            </button>
          </div>
        </form>
      )}

      {/* CLAIM MODAL WITH DIGITAL SIGNATURE CANVAS & PHOTO */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-700" />
                <span>Pengambilan Barang & Tanda Tangan Digital</span>
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              {selectedItem.photoUrl && (
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.itemDescription}
                  className="w-14 h-14 rounded-lg object-cover border border-blue-200 cursor-pointer"
                  onClick={() => setPreviewPhoto({ url: selectedItem.photoUrl!, title: `Titipan: ${selectedItem.ownerName}` })}
                />
              )}
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-blue-900">Pemilik: {selectedItem.ownerName}</p>
                <p className="text-slate-700">Barang: {selectedItem.itemDescription}</p>
              </div>
            </div>

            {/* DIGITAL SIGNATURE CANVAS AREA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-blue-700" /> Tanda Tangan Digital Penerima
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Hapus TTD
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white cursor-crosshair w-full h-36 touch-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center">Gunakan jari atau mouse untuk membuat tanda tangan di atas.</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleClaimSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>KONFIRMASI SERAH TERIMA</span>
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

