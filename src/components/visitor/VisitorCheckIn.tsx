import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Camera, Upload, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

interface VisitorCheckInProps {
  onSuccessCheckIn?: () => void;
}

export const VisitorCheckIn: React.FC<VisitorCheckInProps> = ({ onSuccessCheckIn }) => {
  const { checkInVisitor, staffList, unitsList, currentUser } = useApp();

  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    date: defaultDate,
    timeIn: defaultTime,
    name: '',
    category: 'Vendor' as 'Dinas' | 'Informasi Sekolah' | 'Sales' | 'Vendor' | 'Lainnya',
    phone: '',
    email: '',
    destinationUnit: 'Informasi',
    hostPerson: '',
    purpose: '',
    photoUrl: '',
    ktpPhotoUrl: '',
    visitorCardNumber: `CARD-${Math.floor(Math.random() * 90 + 10)}`,
    receiverSecurity: currentUser.name || 'Ismail',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 400, 400, 0.65);
      setPhotoPreview(compressed);
      setForm((prev) => ({ ...prev, photoUrl: compressed }));
    }
  };

  const handleSelectSamplePhoto = (url: string) => {
    setPhotoPreview(url);
    setForm((prev) => ({ ...prev, photoUrl: url }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nama Visitor wajib diisi';
    if (!form.phone.trim()) errs.phone = 'Nomor HP wajib diisi';
    if (!form.hostPerson.trim()) errs.hostPerson = 'Bertemu dengan Siapa wajib diisi';
    if (!form.purpose.trim()) errs.purpose = 'Keperluan Kunjungan wajib diisi';
    if (!form.visitorCardNumber.trim()) errs.visitorCardNumber = 'Nomor Visitor Card wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    checkInVisitor({
      date: form.date,
      timeIn: form.timeIn,
      name: form.name,
      category: form.category,
      phone: form.phone,
      email: form.email,
      destinationUnit: form.destinationUnit,
      hostPerson: form.hostPerson,
      purpose: form.purpose,
      photoUrl: form.photoUrl || photoPreview || sampleAvatars[0],
      ktpPhotoUrl: form.ktpPhotoUrl || sampleAvatars[1],
      visitorCardNumber: form.visitorCardNumber,
      receiverSecurity: form.receiverSecurity,
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      if (onSuccessCheckIn) onSuccessCheckIn();
    }, 2000);

    // Reset Form
    setForm({
      date: defaultDate,
      timeIn: defaultTime,
      name: '',
      category: 'Vendor',
      phone: '',
      email: '',
      destinationUnit: 'Informasi',
      hostPerson: '',
      purpose: '',
      photoUrl: '',
      ktpPhotoUrl: '',
      visitorCardNumber: `CARD-${Math.floor(Math.random() * 90 + 10)}`,
      receiverSecurity: currentUser.name || 'Ismail',
    });
    setPhotoPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-700" />
            <span>Form Registrasi Visitor Check In</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat data pengunjung resmi di lingkungan Perguruan Lazuardi GIS.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Pos Security Digital
        </span>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <p className="font-bold text-sm">Visitor Berhasil Dicatat (Check In)!</p>
            <p className="text-xs text-emerald-100">
              Kartu visitor telah aktif. Data langsung tersimpan di Dashboard & Audit Log.
            </p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Tanggal & Kartu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 bg-slate-50/50 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Check In</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jam Masuk</label>
            <input
              type="time"
              value={form.timeIn}
              onChange={(e) => setForm({ ...form, timeIn: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Card Visitor ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CARD-015"
              value={form.visitorCardNumber}
              onChange={(e) => setForm({ ...form, visitorCardNumber: e.target.value })}
              className={`w-full bg-white border ${
                errors.visitorCardNumber ? 'border-rose-500' : 'border-slate-300'
              } rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-700`}
            />
            {errors.visitorCardNumber && (
              <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.visitorCardNumber}</span>
            )}
          </div>
        </div>

        {/* Section 2: Data Diri Visitor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Visitor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama sesuai KTP / Identitas"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border ${
                errors.name ? 'border-rose-500 ring-1 ring-rose-200' : 'border-slate-300'
              } rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instansi / Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
            >
              <option value="Dinas">Dinas / Instansi Govt</option>
              <option value="Informasi Sekolah">Informasi Sekolah / Calon Orang Tua</option>
              <option value="Sales">Sales / Marketing B2B</option>
              <option value="Vendor">Vendor / Perbaikan Facilities</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor HP / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 081234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full border ${
                errors.phone ? 'border-rose-500' : 'border-slate-300'
              } rounded-lg px-3 py-2 text-xs text-slate-800`}
            />
            {errors.phone && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.phone}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email (Opsional)</label>
            <input
              type="email"
              placeholder="visitor@domain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Section 3: Tujuan & Keperluan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bertemu / Tujuan Unit</label>
            <select
              value={form.destinationUnit}
              onChange={(e) => setForm({ ...form, destinationUnit: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
            >
              {unitsList.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bertemu Dengan (Nama Personel) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. H. Ir. Ahmad (Direktur) / Pak Budi"
              value={form.hostPerson}
              onChange={(e) => setForm({ ...form, hostPerson: e.target.value })}
              className={`w-full border ${
                errors.hostPerson ? 'border-rose-500' : 'border-slate-300'
              } rounded-lg px-3 py-2 text-xs text-slate-800`}
            />
            {errors.hostPerson && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.hostPerson}</span>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keperluan Kunjungan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan maksud dan tujuan kunjungan di Lazuardi..."
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={`w-full border ${
                errors.purpose ? 'border-rose-500' : 'border-slate-300'
              } rounded-lg px-3 py-2 text-xs text-slate-800`}
            />
            {errors.purpose && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.purpose}</span>}
          </div>
        </div>

        {/* Section 4: Foto Visitor / Foto KTP */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-blue-700" />
            <span>Foto Visitor / Identitas KTP</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto Visitor / KTP</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-500">Atau pilih contoh foto cepat:</p>

              <div className="flex items-center gap-2">
                {sampleAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Sample ${i}`}
                    onClick={() => handleSelectSamplePhoto(url)}
                    className={`w-10 h-10 rounded-lg object-cover cursor-pointer border-2 ${
                      photoPreview === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Petugas Penerima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Security Penerima</label>
            <select
              value={form.receiverSecurity}
              onChange={(e) => setForm({ ...form, receiverSecurity: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SIMPAN & CHECK IN VISITOR</span>
          </button>
        </div>
      </form>
    </div>
  );
};
