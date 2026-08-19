import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToPDF, printData, ExportColumn } from '../../utils/export';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  Calendar,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
} from 'lucide-react';

type ModuleType = 'visitors' | 'patrol' | 'daily' | 'incidents' | 'lostfound' | 'titipan' | 'vehicles';
type PeriodPreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'singleDate' | 'custom';

export const ReportsCenter: React.FC = () => {
  const {
    visitors,
    patrolLogs,
    dailyReports,
    incidents,
    lostAndFound,
    barangTitipan,
    vehiclesLog,
    unitsList,
    staffList,
  } = useApp();

  const [selectedModule, setSelectedModule] = useState<ModuleType>('visitors');
  
  // Date / Period Filters
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('thisMonth');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [specificDate, setSpecificDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Entity Filters
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterOfficer, setFilterOfficer] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Calculate Dates for Presets
  const dateCalculations = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const yesterdayObj = new Date(now);
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().slice(0, 10);

    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 6);
    const last7Str = d7.toISOString().slice(0, 10);

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 29);
    const last30Str = d30.toISOString().slice(0, 10);

    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthObj = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonthObj.getFullYear()}-${String(prevMonthObj.getMonth() + 1).padStart(2, '0')}`;

    return {
      todayStr,
      yesterdayStr,
      last7Str,
      last30Str,
      thisMonthPrefix,
      prevMonthPrefix,
    };
  }, []);

  // Reset Filters
  const handleResetFilters = () => {
    setPeriodPreset('all');
    setStartDate('');
    setEndDate('');
    setSpecificDate(new Date().toISOString().slice(0, 10));
    setFilterUnit('ALL');
    setFilterOfficer('ALL');
    setFilterStatus('ALL');
    setSearchKeyword('');
  };

  // Get raw data for selected module
  const rawModuleData = useMemo(() => {
    switch (selectedModule) {
      case 'visitors': return visitors;
      case 'patrol': return patrolLogs;
      case 'daily': return dailyReports;
      case 'incidents': return incidents;
      case 'lostfound': return lostAndFound;
      case 'titipan': return barangTitipan;
      case 'vehicles': return vehiclesLog;
      default: return [];
    }
  }, [selectedModule, visitors, patrolLogs, dailyReports, incidents, lostAndFound, barangTitipan, vehiclesLog]);

  // Extract Item Date Helper
  const getItemDate = (item: any): string => {
    if (item.date) return String(item.date).slice(0, 10);
    if (item.createdAt) return String(item.createdAt).slice(0, 10);
    if (item.timestamp) return String(item.timestamp).slice(0, 10);
    return '';
  };

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return rawModuleData.filter((item: any) => {
      const itemDate = getItemDate(item);

      // 1. Period / Date Filtering
      if (itemDate) {
        if (periodPreset === 'today') {
          if (itemDate !== dateCalculations.todayStr) return false;
        } else if (periodPreset === 'yesterday') {
          if (itemDate !== dateCalculations.yesterdayStr) return false;
        } else if (periodPreset === 'last7') {
          if (itemDate < dateCalculations.last7Str || itemDate > dateCalculations.todayStr) return false;
        } else if (periodPreset === 'last30') {
          if (itemDate < dateCalculations.last30Str || itemDate > dateCalculations.todayStr) return false;
        } else if (periodPreset === 'thisMonth') {
          if (!itemDate.startsWith(dateCalculations.thisMonthPrefix)) return false;
        } else if (periodPreset === 'lastMonth') {
          if (!itemDate.startsWith(dateCalculations.prevMonthPrefix)) return false;
        } else if (periodPreset === 'singleDate') {
          if (specificDate && itemDate !== specificDate) return false;
        } else if (periodPreset === 'custom') {
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
        }
      }

      // 2. Unit Filter
      if (filterUnit !== 'ALL') {
        const uStr = String(item.destinationUnit || item.unit || item.location || item.gedungName || '').toLowerCase();
        if (!uStr.includes(filterUnit.toLowerCase())) return false;
      }

      // 3. Officer Filter
      if (filterOfficer !== 'ALL') {
        const oStr = String(
          item.receiverSecurity ||
          item.officerName ||
          item.foundBy ||
          item.checkoutSecurity ||
          (Array.isArray(item.officers) ? item.officers.join(' ') : '') ||
          ''
        ).toLowerCase();
        if (!oStr.includes(filterOfficer.toLowerCase())) return false;
      }

      // 4. Status Filter
      if (filterStatus !== 'ALL') {
        const statusStr = String(item.status || item.priority || '').toLowerCase();
        if (statusStr !== filterStatus.toLowerCase()) return false;
      }

      // 5. Search Keyword Filter
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const fullContent = JSON.stringify(item).toLowerCase();
        if (!fullContent.includes(q)) return false;
      }

      return true;
    });
  }, [rawModuleData, periodPreset, specificDate, startDate, endDate, dateCalculations, filterUnit, filterOfficer, filterStatus, searchKeyword]);

  // Column definitions per module
  const columns: ExportColumn[] = useMemo(() => {
    switch (selectedModule) {
      case 'visitors':
        return [
          { header: 'No. Visitor', key: 'visitorNumber' },
          { header: 'Tanggal', key: 'date' },
          { header: 'Jam Masuk', key: 'timeIn' },
          { header: 'Jam Keluar', key: 'timeOut' },
          { header: 'Nama Visitor', key: 'name' },
          { header: 'Kategori', key: 'category' },
          { header: 'No. Card', key: 'visitorCardNumber' },
          { header: 'Unit Tujuan', key: 'destinationUnit' },
          { header: 'Bertemu', key: 'hostPerson' },
          { header: 'Petugas', key: 'receiverSecurity' },
          { header: 'Status', key: 'status' },
        ];
      case 'patrol':
        return [
          { header: 'Tanggal', key: 'date' },
          { header: 'Jam', key: 'time' },
          { header: 'Lokasi Patroli', key: 'locationName' },
          { header: 'Gedung', key: 'gedungName' },
          { header: 'Petugas', key: 'officerName' },
          { header: 'QR Scanned', key: 'qrCodeScanned' },
          { header: 'Status', key: 'status' },
          { header: 'Catatan', key: 'notes' },
        ];
      case 'daily':
        return [
          { header: 'Tanggal', key: 'date' },
          { header: 'Shift', key: 'shift' },
          { header: 'Petugas Bertugas', key: 'officersFormatted' },
          { header: 'Cuaca', key: 'weather' },
          { header: 'Situasi Umum', key: 'generalSituation' },
          { header: 'Catatan Khusus', key: 'notes' },
        ];
      case 'incidents':
        return [
          { header: 'No. Insiden', key: 'incidentNumber' },
          { header: 'Tanggal', key: 'date' },
          { header: 'Jam', key: 'time' },
          { header: 'Kategori', key: 'category' },
          { header: 'Lokasi Kejadian', key: 'location' },
          { header: 'Tingkat Prioritas', key: 'priority' },
          { header: 'Pelapor/Petugas', key: 'officerName' },
          { header: 'Status Penanganan', key: 'status' },
          { header: 'Kronologi', key: 'chronology' },
        ];
      case 'lostfound':
        return [
          { header: 'No. Barang', key: 'itemNumber' },
          { header: 'Tanggal Ditemukan', key: 'date' },
          { header: 'Nama Barang', key: 'itemName' },
          { header: 'Kategori', key: 'category' },
          { header: 'Lokasi Ditemukan', key: 'locationFound' },
          { header: 'Ditemukan Oleh', key: 'foundBy' },
          { header: 'Penerima Pengambilan', key: 'takerName' },
          { header: 'Status', key: 'status' },
        ];
      case 'titipan':
        return [
          { header: 'No. Tanda Terima', key: 'receiptNumber' },
          { header: 'Tanggal', key: 'date' },
          { header: 'Jam Titip', key: 'timeIn' },
          { header: 'Pengirim (Kurir/Ortu)', key: 'senderName' },
          { header: 'Penerima Dituju', key: 'recipientName' },
          { header: 'Unit Tujuan', key: 'recipientUnit' },
          { header: 'Nama Barang', key: 'itemName' },
          { header: 'Petugas Penerima', key: 'receiverSecurity' },
          { header: 'Status', key: 'status' },
        ];
      case 'vehicles':
        return [
          { header: 'No. Log', key: 'logNumber' },
          { header: 'Tanggal', key: 'date' },
          { header: 'Plat Nomor', key: 'vehiclePlate' },
          { header: 'Pengemudi', key: 'driverName' },
          { header: 'Tujuan Perjalanan', key: 'destination' },
          { header: 'Jam Berangkat', key: 'timeDeparture' },
          { header: 'Jam Kembali', key: 'timeArrival' },
          { header: 'KM Awal', key: 'odometerStart' },
          { header: 'KM Akhir', key: 'odometerEnd' },
          { header: 'Status', key: 'status' },
        ];
    }
  }, [selectedModule]);

  // Formatted data for export/table
  const displayData = useMemo(() => {
    return filteredData.map((item: any) => {
      const copy = { ...item };
      if (Array.isArray(item.officers)) {
        copy.officersFormatted = item.officers.join(', ');
      }
      return copy;
    });
  }, [filteredData]);

  // Module Name in Indonesian
  const moduleLabels: Record<ModuleType, string> = {
    visitors: 'Buku Tamu / Visitor Management',
    patrol: 'Patroli Keamanan & QR Code',
    daily: 'Daily Security Report & Handover',
    incidents: 'Laporan Kejadian & Insiden',
    lostfound: 'Lost and Found (Barang Temuan)',
    titipan: 'Log Barang Titipan & Kurir',
    vehicles: 'Logbook Kendaraan Operasional Sekolah',
  };

  // Human readable period description
  const periodLabel = useMemo(() => {
    if (periodPreset === 'all') return 'Semua Periode Waktu';
    if (periodPreset === 'today') return `Hari Ini (${dateCalculations.todayStr})`;
    if (periodPreset === 'yesterday') return `Kemarin (${dateCalculations.yesterdayStr})`;
    if (periodPreset === 'last7') return `7 Hari Terakhir (${dateCalculations.last7Str} s/d ${dateCalculations.todayStr})`;
    if (periodPreset === 'last30') return `30 Hari Terakhir (${dateCalculations.last30Str} s/d ${dateCalculations.todayStr})`;
    if (periodPreset === 'thisMonth') return `Bulan Ini (${dateCalculations.thisMonthPrefix})`;
    if (periodPreset === 'lastMonth') return `Bulan Lalu (${dateCalculations.prevMonthPrefix})`;
    if (periodPreset === 'singleDate') return `Tanggal Spesifik: ${specificDate || 'Belum dipilih'}`;
    if (periodPreset === 'custom') return `Rentang: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`;
    return 'Periode Kustom';
  }, [periodPreset, dateCalculations, specificDate, startDate, endDate]);

  const handleExcel = () => {
    const filename = `LSMS_Laporan_${selectedModule}_${periodPreset}`;
    exportToExcel(displayData, columns, filename);
  };

  const handlePDF = () => {
    const title = `${moduleLabels[selectedModule]} (${periodLabel})`;
    const filename = `LSMS_Laporan_${selectedModule}_${periodPreset}`;
    exportToPDF(title, displayData, columns, filename, 'l');
  };

  const handlePrint = () => {
    const title = `${moduleLabels[selectedModule]} - Periode: ${periodLabel}`;
    printData(title, displayData, columns);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Pusat Rekapitulasi & Ekspor Laporan LSMS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter fleksibel berdasarkan periode hari/tanggal, rentang waktu kustom, unit sekolah, dan petugas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={handlePDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak / Print
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS CARD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parameter Filter Laporan</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* Row 1: Module & Period Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Module Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Modul Laporan</label>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value as ModuleType);
                setFilterStatus('ALL');
              }}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50/50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="visitors">1. Buku Tamu (Visitor)</option>
              <option value="patrol">2. Patroli Security (QR Code)</option>
              <option value="daily">3. Daily Security Report</option>
              <option value="incidents">4. Laporan Insiden</option>
              <option value="lostfound">5. Lost & Found (Temuan)</option>
              <option value="titipan">6. Barang Titipan & Kurir</option>
              <option value="vehicles">7. Kendaraan Operasional</option>
            </select>
          </div>

          {/* Period Preset Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Periode Hari / Waktu</span>
            </label>
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Waktu (All Time)</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="last7">7 Hari Terakhir</option>
              <option value="last30">30 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini (Agustus 2026)</option>
              <option value="lastMonth">Bulan Lalu (Juli 2026)</option>
              <option value="singleDate">Pilih 1 Tanggal Spesifik</option>
              <option value="custom">Kustom Rentang Tanggal (Mulai - Selesai)</option>
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Unit Sekolah / Lokasi</span>
            </label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Unit & Gedung</option>
              {unitsList.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Officer Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Petugas Security</span>
            </label>
            <select
              value={filterOfficer}
              onChange={(e) => setFilterOfficer(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Petugas</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Conditional Date Range Inputs if Single Date or Custom is selected */}
        {(periodPreset === 'singleDate' || periodPreset === 'custom') && (
          <div className="p-3 bg-slate-50 border border-blue-200 rounded-lg flex flex-wrap items-center gap-4">
            {periodPreset === 'singleDate' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Pilih Tanggal:</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {periodPreset === 'custom' && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Dari Tanggal:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Sampai Tanggal:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    Bersihkan Rentang
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Row 3: Quick Search & Status Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kata kunci (nama, no. identitas, lokasi, kronologi)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              {selectedModule === 'visitors' && (
                <>
                  <option value="Masih di Sekolah">Masih di Sekolah</option>
                  <option value="Sudah Keluar">Sudah Keluar</option>
                </>
              )}
              {selectedModule === 'patrol' && (
                <>
                  <option value="Aman">Aman</option>
                  <option value="Temuan">Temuan</option>
                  <option value="Perlu Perhatian">Perlu Perhatian</option>
                </>
              )}
              {selectedModule === 'incidents' && (
                <>
                  <option value="Open">Status: Open</option>
                  <option value="In Progress">Status: In Progress</option>
                  <option value="Resolved">Status: Resolved</option>
                  <option value="Critical">Prioritas: Critical</option>
                </>
              )}
              {selectedModule === 'lostfound' && (
                <>
                  <option value="Belum Diambil">Belum Diambil</option>
                  <option value="Sudah Diambil">Sudah Diambil</option>
                </>
              )}
              {selectedModule === 'titipan' && (
                <>
                  <option value="Belum Diambil">Belum Diambil</option>
                  <option value="Sudah Diambil">Sudah Diambil</option>
                </>
              )}
              {selectedModule === 'vehicles' && (
                <>
                  <option value="Sedang Keluar">Sedang Keluar</option>
                  <option value="Selesai">Selesai</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Filter Summary Pill Bar */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Periode Aktif:</span>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold border border-blue-200">
              {periodLabel}
            </span>
            {filterUnit !== 'ALL' && (
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md font-medium border border-slate-200">
                Unit: {filterUnit}
              </span>
            )}
            {filterOfficer !== 'ALL' && (
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md font-medium border border-slate-200">
                Petugas: {filterOfficer}
              </span>
            )}
            {filterStatus !== 'ALL' && (
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md font-medium border border-slate-200">
                Status: {filterStatus}
              </span>
            )}
          </div>

          <div className="font-bold text-slate-700">
            Ditemukan: <span className="text-blue-700 font-extrabold">{displayData.length}</span> dari {rawModuleData.length} total data
          </div>
        </div>
      </div>

      {/* REKAP TABLE DISPLAY */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Pratinjau Data {moduleLabels[selectedModule]}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Menampilkan {displayData.length > 25 ? '25 data pertama' : `${displayData.length} data`}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 w-10 text-center">No</th>
                {columns.map((c) => (
                  <th key={c.key} className="p-3 whitespace-nowrap">{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.length > 0 ? (
                displayData.slice(0, 25).map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 text-slate-700 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    {columns.map((c) => {
                      const val = row[c.key];
                      const valStr = val !== undefined && val !== null ? String(val) : '-';

                      // Highlight status
                      if (c.key === 'status' || c.key === 'priority') {
                        let badgeClass = 'bg-slate-100 text-slate-700';
                        if (val === 'Aman' || val === 'Selesai' || val === 'Sudah Diambil' || val === 'Sudah Keluar' || val === 'Resolved') {
                          badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        } else if (val === 'Masih di Sekolah' || val === 'Belum Diambil' || val === 'Sedang Keluar' || val === 'Open' || val === 'Critical') {
                          badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                        }
                        return (
                          <td key={c.key} className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}`}>
                              {valStr}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={c.key} className="p-3 font-medium whitespace-nowrap max-w-xs truncate">
                          {valStr}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Calendar className="w-7 h-7 text-slate-300" />
                      <span className="font-semibold text-slate-600">Tidak ada data untuk periode dan filter yang dipilih</span>
                      <span className="text-[11px] text-slate-400">Coba ubah filter periode hari atau tekan 'Reset Filter'.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
