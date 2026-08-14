import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { SupabaseManagerComponent } from './SupabaseManagerComponent';
import {
  Database,
  Plus,
  Users,
  Shield,
  Building2,
  MapPin,
  Car,
  AlertCircle,
  Bookmark,
  Edit2,
  Trash2,
  Cloud,
} from 'lucide-react';

export const MasterDataComponent: React.FC = () => {
  const {
    staffList,
    addStaff,
    updateStaff,
    deleteStaff,
    unitsList,
    addUnit,
    updateUnit,
    deleteUnit,
    gedungList,
    addGedung,
    updateGedung,
    deleteGedung,
    patrolLocations,
    addPatrolLocation,
    updatePatrolLocation,
    deletePatrolLocation,
    vehiclesList,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    incidentCategories,
    addIncidentCategory,
    updateIncidentCategory,
    deleteIncidentCategory,
    purposesList,
    addVisitPurpose,
    updateVisitPurpose,
    deleteVisitPurpose,
  } = useApp();

  const [activeMasterTab, setActiveMasterTab] = useState<
    'database' | 'staff' | 'units' | 'gedung' | 'patrol-locations' | 'vehicles' | 'incidents' | 'purposes'
  >('database');

  const [itemToDelete, setItemToDelete] = useState<{
    type: 'staff' | 'unit' | 'gedung' | 'patrol' | 'vehicle' | 'incident' | 'purpose';
    id: string;
    name: string;
  } | null>(null);

  // Generic Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    'staff' | 'unit' | 'gedung' | 'patrol' | 'vehicle' | 'incident' | 'purpose'
  >('staff');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [fieldName1, setFieldName1] = useState('');
  const [fieldName2, setFieldName2] = useState('');
  const [fieldName3, setFieldName3] = useState('');
  const [fieldName4, setFieldName4] = useState('');

  // STAFF MODAL OPEN
  const openStaffModal = (item?: any) => {
    setModalType('staff');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.name);
      setFieldName2(item.role);
      setFieldName3(item.phone);
      setFieldName4(item.status);
    } else {
      setEditingId(null);
      setFieldName1('');
      setFieldName2('Anggota');
      setFieldName3('081234567890');
      setFieldName4('Aktif');
    }
    setShowModal(true);
  };

  // UNIT MODAL OPEN
  const openUnitModal = (item?: any) => {
    setModalType('unit');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.code);
      setFieldName2(item.name);
      setFieldName3(item.headName || '');
      setFieldName4(item.location || '');
    } else {
      setEditingId(null);
      setFieldName1(`UNT-${Math.floor(Math.random() * 80 + 10)}`);
      setFieldName2('');
      setFieldName3('');
      setFieldName4('');
    }
    setShowModal(true);
  };

  // GEDUNG MODAL OPEN
  const openGedungModal = (item?: any) => {
    setModalType('gedung');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.code);
      setFieldName2(item.name);
      setFieldName3(String(item.floors));
      setFieldName4(item.description || '');
    } else {
      setEditingId(null);
      setFieldName1(`GDG-${Math.floor(Math.random() * 80 + 10)}`);
      setFieldName2('');
      setFieldName3('2');
      setFieldName4('');
    }
    setShowModal(true);
  };

  // PATROL LOC MODAL OPEN
  const openPatrolLocModal = (item?: any) => {
    setModalType('patrol');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.qrCode);
      setFieldName2(item.name);
      setFieldName3(item.floor);
      setFieldName4(item.description || '');
    } else {
      setEditingId(null);
      setFieldName1(`QR-LOC-${Math.floor(Math.random() * 800 + 100)}`);
      setFieldName2('');
      setFieldName3('Lantai 1');
      setFieldName4('');
    }
    setShowModal(true);
  };

  // VEHICLE MODAL OPEN
  const openVehicleModal = (item?: any) => {
    setModalType('vehicle');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.plateNumber);
      setFieldName2(item.name);
      setFieldName3(item.type);
      setFieldName4(String(item.capacity));
    } else {
      setEditingId(null);
      setFieldName1('B 1234 SKL');
      setFieldName2('Bus Sekolah 01');
      setFieldName3('Bus');
      setFieldName4('25');
    }
    setShowModal(true);
  };

  // INCIDENT CAT MODAL OPEN
  const openIncidentCatModal = (item?: any) => {
    setModalType('incident');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.code);
      setFieldName2(item.name);
      setFieldName3(item.defaultPriority);
      setFieldName4('');
    } else {
      setEditingId(null);
      setFieldName1(`INC-${Math.floor(Math.random() * 80 + 10)}`);
      setFieldName2('');
      setFieldName3('Medium');
      setFieldName4('');
    }
    setShowModal(true);
  };

  // PURPOSE MODAL OPEN
  const openPurposeModal = (item?: any) => {
    setModalType('purpose');
    if (item) {
      setEditingId(item.id);
      setFieldName1(item.name);
      setFieldName2(item.description || '');
      setFieldName3('');
      setFieldName4('');
    } else {
      setEditingId(null);
      setFieldName1('');
      setFieldName2('');
      setFieldName3('');
      setFieldName4('');
    }
    setShowModal(true);
  };

  // SUBMIT FORM HANDLER
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'staff') {
      if (editingId) {
        updateStaff(editingId, { name: fieldName1, role: fieldName2 as any, phone: fieldName3, status: fieldName4 as any });
      } else {
        addStaff({
          nip: `SEC-${Math.floor(Math.random() * 800 + 100)}`,
          name: fieldName1,
          phone: fieldName3,
          role: fieldName2 as any,
          shiftDefault: 'Pagi',
          status: fieldName4 as any,
        });
      }
    } else if (modalType === 'unit') {
      if (editingId) {
        updateUnit(editingId, { code: fieldName1, name: fieldName2, headName: fieldName3, location: fieldName4 });
      } else {
        addUnit({ code: fieldName1, name: fieldName2, headName: fieldName3, location: fieldName4 });
      }
    } else if (modalType === 'gedung') {
      if (editingId) {
        updateGedung(editingId, { code: fieldName1, name: fieldName2, floors: Number(fieldName3), description: fieldName4 });
      } else {
        addGedung({ code: fieldName1, name: fieldName2, floors: Number(fieldName3) || 1, description: fieldName4 });
      }
    } else if (modalType === 'patrol') {
      if (editingId) {
        updatePatrolLocation(editingId, { qrCode: fieldName1, name: fieldName2, floor: fieldName3, description: fieldName4 });
      } else {
        addPatrolLocation({ qrCode: fieldName1, name: fieldName2, floor: fieldName3, description: fieldName4 });
      }
    } else if (modalType === 'vehicle') {
      if (editingId) {
        updateVehicle(editingId, { plateNumber: fieldName1, name: fieldName2, type: fieldName3 as any, capacity: Number(fieldName4) });
      } else {
        addVehicle({ plateNumber: fieldName1, name: fieldName2, type: fieldName3 as any, capacity: Number(fieldName4) || 10, status: 'Tersedia' });
      }
    } else if (modalType === 'incident') {
      if (editingId) {
        updateIncidentCategory(editingId, { code: fieldName1, name: fieldName2, defaultPriority: fieldName3 as any });
      } else {
        addIncidentCategory({ code: fieldName1, name: fieldName2, defaultPriority: fieldName3 as any });
      }
    } else if (modalType === 'purpose') {
      if (editingId) {
        updateVisitPurpose(editingId, { name: fieldName1, description: fieldName2 });
      } else {
        addVisitPurpose({ name: fieldName1, description: fieldName2 });
      }
    }

    setShowModal(false);
  };

  // TABLE COLUMNS BUILDER
  const staffColumns: Column<any>[] = [
    { header: 'NIP / ID', key: 'nip', accessor: (s) => <span className="font-mono font-bold text-blue-700">{s.nip}</span> },
    { header: 'Nama Staff Security', key: 'name', accessor: (s) => <span className="font-bold text-slate-900">{s.name}</span> },
    { header: 'Jabatan / Role', key: 'role', accessor: (s) => <span className="font-medium text-slate-700">{s.role}</span> },
    { header: 'No. HP / WA', key: 'phone', accessor: (s) => <span className="font-mono text-slate-600">{s.phone}</span> },
    { header: 'Status', key: 'status', accessor: (s) => <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">{s.status}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openStaffModal(s)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'staff', id: s.id, name: s.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const unitColumns: Column<any>[] = [
    { header: 'Kode Unit', key: 'code', accessor: (u) => <span className="font-mono font-bold text-blue-700">{u.code}</span> },
    { header: 'Nama Unit Sekolah', key: 'name', accessor: (u) => <span className="font-bold text-slate-900">{u.name}</span> },
    { header: 'Kepala Unit / Contact', key: 'headName', accessor: (u) => <span className="text-slate-700">{u.headName || '-'}</span> },
    { header: 'Lokasi Area', key: 'location', accessor: (u) => <span className="text-slate-600">{u.location || '-'}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (u) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openUnitModal(u)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'unit', id: u.id, name: u.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const gedungColumns: Column<any>[] = [
    { header: 'Kode Gedung', key: 'code', accessor: (g) => <span className="font-mono font-bold text-blue-700">{g.code}</span> },
    { header: 'Nama Gedung', key: 'name', accessor: (g) => <span className="font-bold text-slate-900">{g.name}</span> },
    { header: 'Jumlah Lantai', key: 'floors', accessor: (g) => <span className="font-bold text-slate-700">{g.floors} Lantai</span> },
    { header: 'Keterangan', key: 'description', accessor: (g) => <span className="text-slate-600">{g.description}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (g) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openGedungModal(g)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'gedung', id: g.id, name: g.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const patrolLocColumns: Column<any>[] = [
    { header: 'Kode QR Patroli', key: 'qrCode', accessor: (l) => <span className="font-mono font-bold text-blue-700 text-xs">{l.qrCode}</span> },
    { header: 'Nama Titik Lokasi', key: 'name', accessor: (l) => <span className="font-bold text-slate-900">{l.name}</span> },
    { header: 'Area Gedung / Lantai', key: 'floor', accessor: (l) => <span className="text-slate-700">{l.floor}</span> },
    { header: 'Deskripsi Patroli', key: 'description', accessor: (l) => <span className="text-slate-600">{l.description}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (l) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openPatrolLocModal(l)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'patrol', id: l.id, name: l.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const vehicleColumns: Column<any>[] = [
    { header: 'Plat Nomor', key: 'plateNumber', accessor: (v) => <span className="font-mono font-bold text-blue-700">{v.plateNumber}</span> },
    { header: 'Nama Armada', key: 'name', accessor: (v) => <span className="font-bold text-slate-900">{v.name}</span> },
    { header: 'Jenis Kendaraan', key: 'type', accessor: (v) => <span className="text-slate-700">{v.type}</span> },
    { header: 'Kapasitas', key: 'capacity', accessor: (v) => <span className="font-bold text-slate-700">{v.capacity} Orang</span> },
    { header: 'Status', key: 'status', accessor: (v) => <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">{v.status}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (v) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openVehicleModal(v)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'vehicle', id: v.id, name: v.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const incidentColumns: Column<any>[] = [
    { header: 'Kode', key: 'code', accessor: (i) => <span className="font-mono font-bold text-blue-700">{i.code}</span> },
    { header: 'Nama Kategori Insiden', key: 'name', accessor: (i) => <span className="font-bold text-slate-900">{i.name}</span> },
    { header: 'Default Priority', key: 'defaultPriority', accessor: (i) => <span className="font-bold text-rose-700">{i.defaultPriority}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (i) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openIncidentCatModal(i)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'incident', id: i.id, name: i.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const purposeColumns: Column<any>[] = [
    { header: 'Tujuan Kunjungan', key: 'name', accessor: (p) => <span className="font-bold text-slate-900">{p.name}</span> },
    { header: 'Keterangan', key: 'description', accessor: (p) => <span className="text-slate-600">{p.description}</span> },
    {
      header: 'Aksi Master',
      key: 'actions',
      accessor: (p) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openPurposeModal(p)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setItemToDelete({ type: 'purpose', id: p.id, name: p.name })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreateNewClick = () => {
    if (activeMasterTab === 'staff') openStaffModal();
    else if (activeMasterTab === 'units') openUnitModal();
    else if (activeMasterTab === 'gedung') openGedungModal();
    else if (activeMasterTab === 'patrol-locations') openPatrolLocModal();
    else if (activeMasterTab === 'vehicles') openVehicleModal();
    else if (activeMasterTab === 'incidents') openIncidentCatModal();
    else if (activeMasterTab === 'purposes') openPurposeModal();
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-700" />
            <span>Master Data Referensi LSMS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan data master staff security, unit sekolah, gedung, lokasi patroli QR, dan armada.
          </p>
        </div>

        <button
          onClick={handleCreateNewClick}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Data Master</span>
        </button>
      </div>

      {/* SUB MENU TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        {[
          { id: 'database', label: 'Database Supabase Cloud', icon: Cloud },
          { id: 'staff', label: 'Master Staff Security', icon: Shield },
          { id: 'units', label: 'Master Unit', icon: Users },
          { id: 'gedung', label: 'Master Gedung', icon: Building2 },
          { id: 'patrol-locations', label: 'Master Lokasi Patroli', icon: MapPin },
          { id: 'vehicles', label: 'Master Kendaraan', icon: Car },
          { id: 'incidents', label: 'Master Jenis Insiden', icon: AlertCircle },
          { id: 'purposes', label: 'Master Tujuan Kunjungan', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMasterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMasterTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {activeMasterTab === 'database' && <SupabaseManagerComponent />}
      {activeMasterTab === 'staff' && (
        <DataTable
          title="Master Data Staff Security LSMS"
          data={staffList}
          columns={staffColumns}
          searchPlaceholder="Cari nama staff, NIP, atau jabatan..."
          exportFilename="Master_Staff_Security_LSMS"
        />
      )}

      {activeMasterTab === 'units' && (
        <DataTable
          title="Master Data Unit Sekolah LSMS"
          data={unitsList}
          columns={unitColumns}
          searchPlaceholder="Cari nama unit atau kode..."
          exportFilename="Master_Unit_LSMS"
        />
      )}

      {activeMasterTab === 'gedung' && (
        <DataTable
          title="Master Data Gedung LSMS"
          data={gedungList}
          columns={gedungColumns}
          searchPlaceholder="Cari nama gedung..."
          exportFilename="Master_Gedung_LSMS"
        />
      )}

      {activeMasterTab === 'patrol-locations' && (
        <DataTable
          title="Master Data Lokasi Patroli QR Code LSMS"
          data={patrolLocations}
          columns={patrolLocColumns}
          searchPlaceholder="Cari lokasi atau kode QR..."
          exportFilename="Master_Lokasi_Patroli_LSMS"
        />
      )}

      {activeMasterTab === 'vehicles' && (
        <DataTable
          title="Master Data Kendaraan Sekolah LSMS"
          data={vehiclesList}
          columns={vehicleColumns}
          searchPlaceholder="Cari armada atau plat nomor..."
          exportFilename="Master_Kendaraan_LSMS"
        />
      )}

      {activeMasterTab === 'incidents' && (
        <DataTable
          title="Master Data Jenis Insiden LSMS"
          data={incidentCategories}
          columns={incidentColumns}
          searchPlaceholder="Cari jenis insiden..."
          exportFilename="Master_Jenis_Insiden_LSMS"
        />
      )}

      {activeMasterTab === 'purposes' && (
        <DataTable
          title="Master Data Tujuan Kunjungan LSMS"
          data={purposesList}
          columns={purposeColumns}
          searchPlaceholder="Cari tujuan kunjungan..."
          exportFilename="Master_Tujuan_LSMS"
        />
      )}

      {/* DYNAMIC MASTER EDIT/CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleModalSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              {editingId ? 'Edit Data Master' : 'Tambah Data Master Baru'} ({modalType})
            </h3>

            {modalType === 'staff' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Staff</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Role</label>
                  <select value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold">
                    <option value="Anggota">Anggota Patroli</option>
                    <option value="Komandan Regu">Komandan Regu (Danru)</option>
                    <option value="Supervisor">Supervisor Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WA</label>
                  <input type="text" value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select value={fieldName4} onChange={(e) => setFieldName4(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold">
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </>
            )}

            {modalType === 'unit' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Unit</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Unit Sekolah</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kepala Unit / Penanggung Jawab</label>
                  <input type="text" value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Area</label>
                  <input type="text" value={fieldName4} onChange={(e) => setFieldName4(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
              </>
            )}

            {modalType === 'gedung' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Gedung</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Gedung</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Lantai</label>
                  <input type="number" value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold" min={1} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Keterangan</label>
                  <input type="text" value={fieldName4} onChange={(e) => setFieldName4(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
              </>
            )}

            {modalType === 'patrol' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode QR Patroli</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Titik Patroli</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lantai / Gedung</label>
                  <input type="text" value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Instruksi Patroli</label>
                  <input type="text" value={fieldName4} onChange={(e) => setFieldName4(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
              </>
            )}

            {modalType === 'vehicle' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plat Nomor</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Armada</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kendaraan</label>
                  <select value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold">
                    <option value="Mobil Operasional">Mobil Operasional</option>
                    <option value="Bus">Bus Sekolah</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Motor Patroli">Motor Patroli</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Penumpang</label>
                  <input type="number" value={fieldName4} onChange={(e) => setFieldName4(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold" min={1} required />
                </div>
              </>
            )}

            {modalType === 'incident' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Jenis</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kategori Insiden</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Priority</label>
                  <select value={fieldName3} onChange={(e) => setFieldName3(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </>
            )}

            {modalType === 'purpose' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Kunjungan</label>
                  <input type="text" value={fieldName1} onChange={(e) => setFieldName1(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                  <input type="text" value={fieldName2} onChange={(e) => setFieldName2(e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Simpan Master Data
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (!itemToDelete) return;
          const { type, id } = itemToDelete;
          if (type === 'staff') deleteStaff(id);
          else if (type === 'unit') deleteUnit(id);
          else if (type === 'gedung') deleteGedung(id);
          else if (type === 'patrol') deletePatrolLocation(id);
          else if (type === 'vehicle') deleteVehicle(id);
          else if (type === 'incident') deleteIncidentCategory(id);
          else if (type === 'purpose') deleteVisitPurpose(id);
          setItemToDelete(null);
        }}
        title="Hapus Master Data"
        message={`Apakah Anda yakin ingin menghapus master data "${itemToDelete?.name}"? Data ini akan terhapus dari sistem.`}
      />
    </div>
  );
};
