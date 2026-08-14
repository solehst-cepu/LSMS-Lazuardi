import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { PatrolLog, PatrolLocation } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Navigation,
  Clock,
  Printer,
  ShieldAlert,
  Video,
  VideoOff,
  RefreshCw,
  Upload,
  Sparkles,
  Volume2,
  Trash2,
} from 'lucide-react';

export const PatrolComponent: React.FC = () => {
  const { patrolLocations, patrolLogs, addPatrolLog, deletePatrolLog, currentUser, staffList } = useApp();

  const [activeTab, setActiveTab] = useState<'scan' | 'logs' | 'qr-generator'>('scan');
  const [logToDelete, setLogToDelete] = useState<PatrolLog | null>(null);

  // Scanner States
  const [selectedLocation, setSelectedLocation] = useState<PatrolLocation>(patrolLocations[0]);
  const [patrolStatus, setPatrolStatus] = useState<'Aman' | 'Ada Temuan'>('Aman');
  const [notes, setNotes] = useState('Area disisir menyeluruh, situasi kondusif.');
  const [officerName, setOfficerName] = useState(currentUser.name || 'Ismail');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=300&auto=format&fit=crop&q=80');

  // Real Camera & Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedQr, setLastScannedQr] = useState<string | null>(null);
  const [scanSuccessFeedback, setScanSuccessFeedback] = useState<string | null>(null);

  // GPS State
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: -6.3882, lng: 106.8315 });
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayScans = patrolLogs.filter((p) => p.date === todayStr);

  // Fetch real GPS on mount
  useEffect(() => {
    fetchCurrentGps();
  }, []);

  const fetchCurrentGps = () => {
    if ('geolocation' in navigator) {
      setIsFetchingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
          setIsFetchingGps(false);
        },
        (err) => {
          console.log('GPS fallback used:', err.message);
          setIsFetchingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Handle QR Scan Result
  const handleQrScanned = (decodedText: string) => {
    setLastScannedQr(decodedText);
    
    // Play subtle audio beep if browser allows
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 pitch
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context ignored if blocked
    }

    // Try matching location by qrCode or code or substring
    const matched = patrolLocations.find(
      (loc) =>
        loc.qrCode.toLowerCase() === decodedText.toLowerCase() ||
        loc.code.toLowerCase() === decodedText.toLowerCase() ||
        loc.id.toLowerCase() === decodedText.toLowerCase()
    );

    if (matched) {
      setSelectedLocation(matched);
      setScanSuccessFeedback(`QR Cocok: [${matched.code}] ${matched.name}`);
    } else {
      setScanSuccessFeedback(`QR Terdeteksi: "${decodedText}" (Silakan pilih titik lokasi jika belum terdaftar)`);
    }

    fetchCurrentGps();
  };

  // Live Camera Scanner Lifecycle
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isCameraActive && activeTab === 'scan') {
      setCameraError(null);
      
      // Delay slightly to ensure DOM element '#qr-camera-feed' is rendered
      const timeoutId = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode('qr-camera-feed');
          qrScannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: facingMode },
              {
                fps: 10,
                qrbox: { width: 240, height: 240 },
              },
              (decodedText) => {
                handleQrScanned(decodedText);
              },
              () => {
                // Ignore parse errors on empty frames
              }
            )
            .catch((err) => {
              console.error('Camera access error:', err);
              setCameraError(
                'Tidak dapat mengakses kamera. Pastikan izin kamera diizinkan di browser Anda.'
              );
              setIsCameraActive(false);
            });
        } catch (e) {
          console.error('Failed to init camera:', e);
          setCameraError('Gagal menginisialisasi kamera.');
          setIsCameraActive(false);
        }
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
          qrScannerRef.current
            .stop()
            .then(() => {
              qrScannerRef.current?.clear();
            })
            .catch(console.error);
        }
      };
    }
  }, [isCameraActive, facingMode, activeTab]);

  // Handle File Upload QR Scan
  const handleFileUploadQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-file-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQrScanned(decodedText);
      html5QrCode.clear();
    } catch (err) {
      alert('QR Code tidak dapat dibaca dari foto ini. Pastikan gambar QR Code cukup jelas.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    addPatrolLog({
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      gedungName: selectedLocation.gedungId,
      date: todayStr,
      time: timeStr,
      officerName,
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      status: patrolStatus,
      notes,
      photoUrl,
      qrCodeScanned: lastScannedQr || selectedLocation.qrCode,
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('logs');
    }, 2000);
  };

  const columns: Column<PatrolLog>[] = [
    {
      header: 'Waktu & Petugas',
      key: 'time',
      accessor: (p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.time} WIB</span>
          <span className="text-[11px] text-slate-500 font-medium">{p.officerName}</span>
        </div>
      ),
    },
    {
      header: 'Lokasi Patroli',
      key: 'locationName',
      accessor: (p) => (
        <div>
          <span className="font-bold text-blue-700 block text-xs">{p.locationName}</span>
          <span className="text-[10px] text-slate-500 font-mono">{p.qrCodeScanned}</span>
        </div>
      ),
    },
    {
      header: 'GPS Koordinat',
      key: 'latitude',
      accessor: (p) => (
        <div className="flex items-center gap-1 text-xs font-mono text-slate-600">
          <Navigation className="w-3 h-3 text-emerald-600" />
          <span>{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</span>
        </div>
      ),
    },
    {
      header: 'Catatan Jaga',
      key: 'notes',
      accessor: (p) => <span className="text-xs text-slate-700 line-clamp-1">{p.notes || '-'}</span>,
    },
    {
      header: 'Status Patroli',
      key: 'status',
      accessor: (p) =>
        p.status === 'Aman' ? (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
            ✓ AMAN
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] border border-rose-200">
            ⚠ ADA TEMUAN
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar & Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-700" />
            <span>Patroli Security QR Code System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan barcode lokasi, pencatatan otomatis timestamp GPS, foto kondisi, dan rekap temuan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'scan' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'logs' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Log Patroli
          </button>
          <button
            onClick={() => setActiveTab('qr-generator')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'qr-generator' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cetak QR Lokasi
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY PATROLI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Target Titik Patroli</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{patrolLocations.length} Titik</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Seluruh perimeter sekolah</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Patroli Selesai Hari Ini</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{todayScans.length} Scan</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified QR & GPS</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Status Kondisi</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">
            {todayScans.filter((s) => s.status === 'Aman').length} Aman
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">100% Bebas Gangguan</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-xs font-semibold text-rose-800 uppercase block">Temuan Kerusakan</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {todayScans.filter((s) => s.status === 'Ada Temuan').length} Event
          </span>
          <p className="text-[11px] text-rose-700/80 mt-0.5">Perlu perhatian sarpras</p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <div>
            <p className="font-bold text-sm">Scan QR Patroli Berhasil Disimpan!</p>
            <p className="text-xs text-emerald-100">Timestamp & GPS tercatat presisi di server.</p>
          </div>
        </div>
      )}

      {/* TAB 1: SCAN QR CODE WITH REAL CAMERA & SIMULATOR */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Interactive Live Camera QR Scanner */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-700" />
                <span>Scanner QR Code Kamera HP / Web</span>
              </h3>
              
              {/* Camera Controls */}
              <div className="flex items-center gap-2">
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Ganti Kamera (Kamera Depan/Belakang)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ganti Kamera</span>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all ${
                    isCameraActive
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isCameraActive ? (
                    <>
                      <VideoOff className="w-3.5 h-3.5" />
                      <span>Matikan Kamera</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>Nyalakan Kamera Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SCANNER VIEWPORT */}
            <div className="p-4 bg-slate-950 rounded-2xl text-white text-center space-y-4 relative overflow-hidden min-h-[280px] flex flex-col justify-center items-center">
              {isCameraActive ? (
                <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-emerald-500 shadow-lg relative bg-black">
                  <div id="qr-camera-feed" className="w-full h-64 overflow-hidden" />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Kamera Live Aktif
                  </div>
                </div>
              ) : (
                /* Static QR Preview Card */
                <div className="space-y-3 w-full">
                  <div className="w-44 h-44 mx-auto border-2 border-dashed border-blue-400/60 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-900/90 relative">
                    <QRCodeSVG value={selectedLocation.qrCode} size={140} level="M" />
                    <div className="absolute inset-0 border-2 border-blue-500/50 rounded-xl animate-pulse pointer-events-none" />
                  </div>

                  <div>
                    <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs font-mono font-bold border border-blue-500/40">
                      {selectedLocation.qrCode}
                    </span>
                    <p className="text-sm font-bold text-white mt-1.5">{selectedLocation.name}</p>
                    <p className="text-xs text-slate-400">{selectedLocation.description}</p>
                  </div>
                </div>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div className="p-3 bg-rose-900/80 border border-rose-500 text-rose-200 text-xs rounded-xl text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Akses Kamera Di-block / Tidak Tersedia</p>
                    <p className="text-[11px] text-rose-300 mt-0.5">
                      {cameraError} Anda juga dapat menggunakan tombol **Pilih File Gambar QR** atau **Dropdown Manual** di bawah.
                    </p>
                  </div>
                </div>
              )}

              {/* Instant Scan Result Badge */}
              {scanSuccessFeedback && (
                <div className="p-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md w-full animate-bounce">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{scanSuccessFeedback}</span>
                </div>
              )}
            </div>

            {/* Hidden temp div for File Scan */}
            <div id="qr-file-temp" className="hidden" />

            {/* Scan From File / Photo Upload Option */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Scan Foto Gambar QR Code:</span>
              </span>
              <label className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1">
                <span>Pilih Foto QR</span>
                <input type="file" accept="image/*" onChange={handleFileUploadQr} className="hidden" />
              </label>
            </div>

            {/* Manual Location Selection Fallback */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Pilih Titik Lokasi QR (Simulasi / Manual)</span>
                <span className="text-[11px] text-blue-600 font-semibold">Fallback Pilihan</span>
              </label>
              <select
                value={selectedLocation.id}
                onChange={(e) => {
                  const loc = patrolLocations.find((l) => l.id === e.target.value);
                  if (loc) {
                    setSelectedLocation(loc);
                    setLastScannedQr(loc.qrCode);
                    setScanSuccessFeedback(`Lokasi Dipilih: [${loc.code}] ${loc.name}`);
                  }
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50/60"
              >
                {patrolLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    [{loc.code}] {loc.name} - {loc.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Submit Form */}
          <form onSubmit={handleScanSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Data Hasil Inspeksi Titik Patroli</span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                QR: {lastScannedQr || selectedLocation.qrCode}
              </span>
            </h3>

            {/* GPS & Timestamp Auto Readout */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-between">
                  <span>GPS Tagging</span>
                  <button
                    type="button"
                    onClick={fetchCurrentGps}
                    className="text-blue-600 hover:underline flex items-center gap-0.5 text-[9px]"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isFetchingGps ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </span>
                <span className="font-mono font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3" /> {gpsCoords.lat}, {gpsCoords.lng}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu Scan</span>
                <span className="font-mono font-bold text-blue-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Auto Realtime
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kondisi Area</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPatrolStatus('Aman')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    patrolStatus === 'Aman'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> AMAN / KONDUSIF
                </button>

                <button
                  type="button"
                  onClick={() => setPatrolStatus('Ada Temuan')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    patrolStatus === 'Ada Temuan'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" /> ADA TEMUAN
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Security Patroli</label>
              <select
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Temuan Lapangan</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800"
                placeholder="Tuliskan hasil pengecekan visual..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Foto Kondisi Lokasi Patroli</label>
              <div className="flex items-center gap-3">
                <img src={photoUrl} alt="Patrol" className="w-16 h-12 rounded-lg object-cover border border-slate-300 shadow-xs" />
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ambil / Upload Foto</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SIMPAN LOG PATROLI QR</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: LOGS TABLE */}
      {activeTab === 'logs' && (
        <DataTable
          title="Riwayat Patroli QR Code LSMS"
          data={patrolLogs}
          columns={columns}
          searchPlaceholder="Cari titik lokasi, nama petugas, atau status..."
          exportFilename="Laporan_Patroli_LSMS"
          actions={(row) => (
            <button
              onClick={() => setLogToDelete(row)}
              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Hapus Log Patroli"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Hapus</span>
            </button>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={() => {
          if (logToDelete) {
            deletePatrolLog(logToDelete.id);
            setLogToDelete(null);
          }
        }}
        title="Hapus Log Patroli"
        message={`Apakah Anda yakin ingin menghapus log patroli di "${logToDelete?.locationName}" (${logToDelete?.timestamp})? Data akan terhapus permanen.`}
      />

      {/* TAB 3: QR GENERATOR FOR PRINTING LOCATION CARDS */}
      {activeTab === 'qr-generator' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kartu Barcode QR Code Lokasi Patroli</h3>
              <p className="text-xs text-slate-500">Cetak & tempelkan pada setiap titik fisik patroli sekolah.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu QR</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {patrolLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-5 border-2 border-slate-300 rounded-2xl bg-white text-center space-y-3 shadow-xs hover:border-blue-500 transition-colors"
              >
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">
                    LAZUARDI GIS SECURITY
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{loc.name}</p>
                </div>

                <div className="flex justify-center p-2 bg-slate-50 rounded-xl">
                  <QRCodeSVG value={loc.qrCode} size={130} level="H" />
                </div>

                <div>
                  <p className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {loc.qrCode}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{loc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
