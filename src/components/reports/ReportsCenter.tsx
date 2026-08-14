import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToExcel, exportToPDF, printData, ExportColumn } from '../../utils/export';
import { FileSpreadsheet, Download, Printer, Filter, ShieldCheck } from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const { visitors, patrolLogs, dailyReports, incidents, lostAndFound, barangTitipan, vehiclesLog, unitsList, staffList } = useApp();

  const [selectedModule, setSelectedModule] = useState<'visitors' | 'patrol' | 'daily' | 'incidents' | 'lostfound' | 'titipan' | 'vehicles'>('visitors');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterOfficer, setFilterOfficer] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');

  // Filter Data Logic based on selected module
  const getFilteredData = () => {
    let sourceData: any[] = [];
    if (selectedModule === 'visitors') sourceData = visitors;
    if (selectedModule === 'patrol') sourceData = patrolLogs;
    if (selectedModule === 'daily') sourceData = dailyReports;
    if (selectedModule === 'incidents') sourceData = incidents;
    if (selectedModule === 'lostfound') sourceData = lostAndFound;
    if (selectedModule === 'titipan') sourceData = barangTitipan;
    if (selectedModule === 'vehicles') sourceData = vehiclesLog;

    return sourceData.filter((item) => {
      if (filterUnit !== 'ALL') {
        const uStr = String(item.destinationUnit || item.unit || item.location || '');
        if (!uStr.toLowerCase().includes(filterUnit.toLowerCase())) return false;
      }
      if (filterOfficer !== 'ALL') {
        const oStr = String(item.receiverSecurity || item.officerName || item.foundBy || '');
        if (!oStr.toLowerCase().includes(filterOfficer.toLowerCase())) return false;
      }
      return true;
    });
  };

  const currentData = getFilteredData();

  const getExportColumns = (): ExportColumn[] => {
    if (selectedModule === 'visitors') {
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
        { header: 'Status', key: 'status' },
      ];
    }
    if (selectedModule === 'patrol') {
      return [
        { header: 'Tanggal', key: 'date' },
        { header: 'Jam', key: 'time' },
        { header: 'Lokasi Patroli', key: 'locationName' },
        { header: 'Petugas', key: 'officerName' },
        { header: 'QR Scanned', key: 'qrCodeScanned' },
        { header: 'Status', key: 'status' },
        { header: 'Catatan', key: 'notes' },
      ];
    }
    return [
      { header: 'ID / No', key: 'id' },
      { header: 'Tanggal', key: 'date' },
      { header: 'Detail', key: 'generalSituation' },
      { header: 'Status', key: 'status' },
    ];
  };

  const cols = getExportColumns();

  const handleExcel = () => exportToExcel(currentData, cols, `Laporan_${selectedModule}_LSMS`);
  const handlePDF = () => exportToPDF(`Laporan Center - ${selectedModule}`, currentData, cols, `Laporan_${selectedModule}_LSMS`);
  const handlePrint = () => printData(`Laporan Center - ${selectedModule}`, currentData, cols);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Pusat Rekapitulasi Laporan LSMS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor rekapitulasi data keamanan berdasarkan modul, unit sekolah, dan petugas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={handlePDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Modul Laporan</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value as any)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50/50"
          >
            <option value="visitors">1. Visitor Management</option>
            <option value="patrol">2. Patroli Security (QR Code)</option>
            <option value="daily">3. Daily Security Report</option>
            <option value="incidents">4. Laporan Insiden</option>
            <option value="lostfound">5. Lost and Found</option>
            <option value="titipan">6. Barang Titipan</option>
            <option value="vehicles">7. Kendaraan Sekolah</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Filter Unit Sekolah</label>
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">Semua Unit</option>
            {unitsList.map((u) => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Filter Petugas Security</label>
          <select
            value={filterOfficer}
            onChange={(e) => setFilterOfficer(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">Semua Petugas</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Periode Bulan</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">Agustus 2026 (Bulan Ini)</option>
            <option value="07">Juli 2026</option>
            <option value="06">Juni 2026</option>
          </select>
        </div>
      </div>

      {/* REKAP TABLE DISPLAY */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Pratinjau Data Laporan ({currentData.length} Record)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                {cols.map((c) => (
                  <th key={c.key} className="p-3">{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length > 0 ? (
                currentData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 text-slate-700">
                    {cols.map((c) => (
                      <td key={c.key} className="p-3 font-medium">
                        {String(row[c.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={cols.length} className="p-6 text-center text-slate-400">
                    Tidak ada data yang sesuai filter.
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
