import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  UserCog,
  Users,
  ShieldCheck,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Save,
  User as UserIcon,
  Smartphone,
  Mail,
  Building,
  Shield,
  RotateCcw,
} from 'lucide-react';

export const UserSettingsComponent: React.FC = () => {
  const {
    currentUser,
    usersList,
    addUser,
    updateUser,
    deleteUser,
    loginPolicy,
    updateLoginPolicy,
    visitors,
    clearAllVisitors,
    dailyReports,
    clearAllDailyReports,
    patrolLogs,
    clearAllPatrolLogs,
    incidents,
    clearAllIncidents,
    lostAndFound,
    clearAllLostFound,
    barangTitipan,
    clearAllBarangTitipan,
    vehiclesLog,
    clearAllVehiclesLog,
    auditLogs,
    clearAllAuditLogs,
    clearAllTransactionData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'policy' | 'profile' | 'data-reset'>('accounts');

  // Account Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Add/Edit Form states
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('User');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUnit, setFormUnit] = useState('Security Pos Utama');
  const [formPassword, setFormPassword] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Login Policy Form states
  const [policyMaxAttempts, setPolicyMaxAttempts] = useState(loginPolicy.maxFailedAttempts);
  const [policyLockoutSeconds, setPolicyLockoutSeconds] = useState(loginPolicy.lockoutDurationSeconds);
  const [policySessionTimeout, setPolicySessionTimeout] = useState(loginPolicy.sessionTimeoutMinutes);
  const [policyMinPassLen, setPolicyMinPassLen] = useState(loginPolicy.passwordMinLength);
  const [policyRequirePin, setPolicyRequirePin] = useState(loginPolicy.requirePinForSecurity);
  const [policySavedAlert, setPolicySavedAlert] = useState(false);

  // Profile Form states
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileNewPin, setProfileNewPin] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Handlers for Add / Edit User
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormRole('User');
    setFormEmail('');
    setFormPhone('');
    setFormUnit('Security Pos Utama');
    setFormPassword('user123');
    setFormPin('123456');
    setFormStatus('Aktif');
    setShowAddUserModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormRole(user.role);
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormUnit(user.unit || 'Security');
    setFormPassword(user.password || '');
    setFormPin(user.pin || '');
    setFormStatus(user.status);
    setShowAddUserModal(true);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formName.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        username: formUsername,
        name: formName,
        role: formRole,
        email: formEmail,
        phone: formPhone,
        unit: formUnit,
        password: formPassword || editingUser.password,
        pin: formPin || editingUser.pin,
        status: formStatus,
      });
    } else {
      addUser({
        username: formUsername,
        name: formName,
        role: formRole,
        email: formEmail,
        phone: formPhone,
        unit: formUnit,
        password: formPassword || 'user123',
        pin: formPin || '123456',
        status: formStatus,
      });
    }

    setShowAddUserModal(false);
  };

  const handleDeleteUserClick = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    setUserToDelete(user);
  };

  const handleSavePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoginPolicy({
      maxFailedAttempts: Number(policyMaxAttempts),
      lockoutDurationSeconds: Number(policyLockoutSeconds),
      sessionTimeoutMinutes: Number(policySessionTimeout),
      passwordMinLength: Number(policyMinPassLen),
      requirePinForSecurity: policyRequirePin,
    });
    setPolicySavedAlert(true);
    setTimeout(() => setPolicySavedAlert(false), 3000);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      ...(profileNewPassword ? { password: profileNewPassword } : {}),
      ...(profileNewPin ? { pin: profileNewPin } : {}),
    });
    setProfileSuccessMsg('Profil berhasil diperbarui!');
    setProfileNewPassword('');
    setProfileNewPin('');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  // User Table Columns
  const userColumns: Column<User>[] = [
    {
      header: 'Username',
      key: 'username',
      accessor: (u) => <span className="font-mono font-bold text-blue-700">{u.username}</span>,
    },
    {
      header: 'Nama Pengguna',
      key: 'name',
      accessor: (u) => (
        <div>
          <div className="font-bold text-slate-900">{u.name}</div>
          <div className="text-[11px] text-slate-500">{u.unit || 'Pos Security'}</div>
        </div>
      ),
    },
    {
      header: 'Role / Hak Akses',
      key: 'role',
      accessor: (u) => {
        const color =
          u.role === 'Administrator'
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : u.role === 'Supervisor Security'
            ? 'bg-blue-100 text-blue-800 border-blue-200'
            : 'bg-slate-100 text-slate-800 border-slate-200';
        return (
          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${color}`}>
            {u.role}
          </span>
        );
      },
    },
    {
      header: 'Kontak',
      key: 'phone',
      accessor: (u) => (
        <div className="text-xs">
          <div className="text-slate-800 font-mono">{u.phone || '-'}</div>
          <div className="text-[10px] text-slate-500">{u.email || '-'}</div>
        </div>
      ),
    },
    {
      header: 'PIN Pos',
      key: 'pin',
      accessor: (u) => <span className="font-mono text-slate-600 text-xs">{u.pin || '******'}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (u) => (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
            u.status === 'Aktif'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {u.status}
        </span>
      ),
    },
    {
      header: 'Terakhir Login',
      key: 'lastLogin',
      accessor: (u) => <span className="text-xs text-slate-500 font-mono">{u.lastLogin || 'Belum pernah'}</span>,
    },
    {
      header: 'Aksi',
      key: 'actions',
      accessor: (u) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(u)}
            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit User"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteUserClick(u)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Hapus User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-700" />
            <span>Pengaturan User & Kebijakan Login</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen akun pengguna sistem LSMS, konfigurasi keamanan login, dan hak akses role.
          </p>
        </div>

        {activeTab === 'accounts' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah User Baru</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Akun User ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'policy'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Aturan & Kebijakan Login</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profil Saya</span>
        </button>

        {currentUser.role === 'Administrator' && (
          <button
            onClick={() => setActiveTab('data-reset')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'data-reset'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Hapus & Reset Data Input</span>
          </button>
        )}
      </div>

      {/* TAB 1: USER ACCOUNTS TABLE */}
      {activeTab === 'accounts' && (
        <DataTable
          title="Daftar Pengguna Sistem LSMS"
          data={usersList}
          columns={userColumns}
          searchPlaceholder="Cari username, nama, atau role..."
          exportFilename="Daftar_Pengguna_LSMS"
        />
      )}

      {/* TAB 2: LOGIN POLICY SETTINGS & ROLE MATRIX */}
      {activeTab === 'policy' && (
        <div className="space-y-6">
          <form onSubmit={handleSavePolicySubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-700" />
                  <span>Konfigurasi Keamanan Login & Password</span>
                </h3>
                <p className="text-xs text-slate-500">Aturan pencegahan salah login berulang, masa aktif sesi, dan PIN security pos.</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kebijakan Login</span>
              </button>
            </div>

            {policySavedAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kebijakan login berhasil diperbarui dan diterapkan ke seluruh sesi!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Policy 1: Max Failed Attempts */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <span>Maksimal Percobaan Gagal</span>
                </label>
                <select
                  value={policyMaxAttempts}
                  onChange={(e) => setPolicyMaxAttempts(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={3}>3 Kali Percobaan (Disarankan)</option>
                  <option value={5}>5 Kali Percobaan</option>
                  <option value={10}>10 Kali Percobaan</option>
                </select>
                <p className="text-[11px] text-slate-500">Jika salah password/PIN melebihi batas ini, akun akan dibekukan sementara.</p>
              </div>

              {/* Policy 2: Lockout Duration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Durasi Pembekuan (Lockout)</span>
                </label>
                <select
                  value={policyLockoutSeconds}
                  onChange={(e) => setPolicyLockoutSeconds(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={30}>30 Detik (Standar)</option>
                  <option value={60}>60 Detik (1 Menit)</option>
                  <option value={300}>300 Detik (5 Menit)</option>
                </select>
                <p className="text-[11px] text-slate-500">Lama waktu pengguna harus menunggu setelah akun terkunci.</p>
              </div>

              {/* Policy 3: Session Inactivity Timeout */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Timeout Inaktivitas Sesi</span>
                </label>
                <select
                  value={policySessionTimeout}
                  onChange={(e) => setPolicySessionTimeout(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={15}>15 Menit</option>
                  <option value={30}>30 Menit (Standar)</option>
                  <option value={60}>60 Menit (1 Jam)</option>
                </select>
                <p className="text-[11px] text-slate-500">Sistem otomatis logout jika tidak ada aktivitas pengguna.</p>
              </div>

              {/* Policy 4: Min Password Length */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>Minimal Panjang Password</span>
                </label>
                <select
                  value={policyMinPassLen}
                  onChange={(e) => setPolicyMinPassLen(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value={6}>6 Karakter</option>
                  <option value={8}>8 Karakter</option>
                  <option value={10}>10 Karakter</option>
                </select>
                <p className="text-[11px] text-slate-500">Standar minimal panjang karakter pembuatan password baru.</p>
              </div>

              {/* Policy 5: Require PIN Security */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>PIN Pos Security Quick-Access</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="requirePin"
                    checked={policyRequirePin}
                    onChange={(e) => setPolicyRequirePin(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="requirePin" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Izinkan login cepat menggunakan PIN 6-Digit khusus petugas di Pos Security Sekolah.
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Memudahkan pergantian shift antar petugas di komputer pos jaga tanpa harus mengetik password panjang.</p>
              </div>
            </div>
          </form>

          {/* ROLE PERMISSIONS MATRIX */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Matriks Hak Akses Modul Berdasarkan Role</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Modul Operasional LSMS</th>
                    <th className="p-3 text-center">Administrator</th>
                    <th className="p-3 text-center">Supervisor Security</th>
                    <th className="p-3 text-center">Petugas / User Pos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { module: 'Visitor Check-In & Out', admin: 'Full Control', spv: 'Full Control', user: 'Input & Checkout' },
                    { module: 'Daily Security Report', admin: 'Full Control & Approval', spv: 'Review & Sign Handover', user: 'Isi Laporan Shift' },
                    { module: 'Patroli QR Code Scanner', admin: 'Full Control & Setup QR', spv: 'Monitoring Patroli', user: 'Scan Titik Patroli' },
                    { module: 'Laporan Insiden Sekolah', admin: 'Full Control & Close Report', spv: 'Full Control & Assign', user: 'Buat Laporan Insiden' },
                    { module: 'Lost & Found & Goods Titipan', admin: 'Full Control', spv: 'Full Control', user: 'Catat & Serah Terima' },
                    { module: 'Log Kendaraan Sekolah', admin: 'Full Control', spv: 'Full Control', user: 'Catat Keluar-Masuk' },
                    { module: 'Master Data Referensi', admin: 'Tambah, Edit & Hapus', spv: 'Lihat Data Master', user: 'Tolak (No Access)' },
                    { module: 'Pengaturan User & Login Rules', admin: 'Full Control', spv: 'Lihat Kebijakan', user: 'Tolak (No Access)' },
                    { module: 'Audit Log System', admin: 'Full Access & Export', spv: 'Lihat Log Audit', user: 'Tolak (No Access)' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{row.module}</td>
                      <td className="p-3 text-center font-bold text-purple-700 bg-purple-50/50">{row.admin}</td>
                      <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/50">{row.spv}</td>
                      <td className="p-3 text-center font-semibold text-slate-700">{row.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Username: <span className="font-mono text-blue-700 font-bold">{currentUser.username}</span> | Role: <span className="font-bold text-slate-700">{currentUser.role}</span>
              </p>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Lengkap Pengguna</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>No. HP / WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Resmi</span>
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ganti Password Baru (Opsional)</span>
                </label>
                <input
                  type="password"
                  value={profileNewPassword}
                  onChange={(e) => setProfileNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                  placeholder="Kosongkan jika tidak diubah"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ganti PIN Security Pos (6 Digit)</span>
                </label>
                <input
                  type="password"
                  value={profileNewPin}
                  onChange={(e) => setProfileNewPin(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                  placeholder="Kosongkan jika tidak diubah"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ADMINISTRATOR DATA RESET PANEL */}
      {activeTab === 'data-reset' && (
        <div className="space-y-6">
          <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">Hak Pengosongan & Penghapusan Data (Administrator)</h3>
                <p className="text-xs text-rose-800 mt-1">
                  Sebagai Administrator, Anda berhak menghapus data per modul maupun melakukan <strong>Reset Total</strong> untuk seluruh data transaksi inputan security yang tersimpan di sistem.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('PERINGATAN DANGER ZONE!\n\nApakah Anda YAKIN INGIN MENGHAPUS SEMUA DATA INPUTAN SEKOLAH (Buku Tamu, Laporan Harian, Patroli, Insiden, Titipan, Lost & Found, dan Kendaraan)?\n\nTindakan ini TIDAK DAPAT DIBATALKAN!')) {
                  if (window.confirm('KONFIRMASI TERAKHIR: Tekan OK untuk mengosongkan seluruh basis data transaksi.')) {
                    clearAllTransactionData();
                    alert('Seluruh data transaksi inputan berhasil dikosongkan!');
                  }
                }
              }}
              className="px-5 py-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 border border-rose-800 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>RESET / HAPUS SEMUA DATA TRANSAKSI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Module 1: Visitors */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Buku Tamu (Visitor)</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {visitors.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Log pengunjung, check-in, checkout, dan foto identitas.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh riwayat data Buku Tamu / Visitor?')) {
                    clearAllVisitors();
                  }
                }}
                disabled={visitors.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Visitor</span>
              </button>
            </div>

            {/* Module 2: Daily Reports */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Laporan Harian</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {dailyReports.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Checklist shift pos security, kondisi cuaca, dan serah terima.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh data Laporan Harian Security?')) {
                    clearAllDailyReports();
                  }
                }}
                disabled={dailyReports.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Laporan Harian</span>
              </button>
            </div>

            {/* Module 3: Patrol Logs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Log Patroli QR</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {patrolLogs.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Riwayat scan QR lokasi patroli, GPS tag, dan foto inspeksi.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh riwayat scan Patroli Security?')) {
                    clearAllPatrolLogs();
                  }
                }}
                disabled={patrolLogs.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Patroli</span>
              </button>
            </div>

            {/* Module 4: Incidents */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Laporan Insiden</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {incidents.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Kejadian darurat, temuan kerusakan, dan tindakan penanganan.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh data Laporan Insiden Kejadian?')) {
                    clearAllIncidents();
                  }
                }}
                disabled={incidents.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Insiden</span>
              </button>
            </div>

            {/* Module 5: Lost & Found */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Barang Temuan</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {lostAndFound.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Daftar barang tercecer/ditemukan dan log klaim pemilik.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh data Barang Temuan (Lost & Found)?')) {
                    clearAllLostFound();
                  }
                }}
                disabled={lostAndFound.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Lost & Found</span>
              </button>
            </div>

            {/* Module 6: Barang Titipan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Penitipan Barang</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {barangTitipan.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Titipan paket/barang siswa & guru beserta TTD digital pengambilan.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh log Penitipan Barang?')) {
                    clearAllBarangTitipan();
                  }
                }}
                disabled={barangTitipan.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Titipan</span>
              </button>
            </div>

            {/* Module 7: Vehicles Log */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kendaraan Sekolah</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {vehiclesLog.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Log operasional keluar masuk mobil bus & dinas sekolah.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh log Kendaraan Sekolah?')) {
                    clearAllVehiclesLog();
                  }
                }}
                disabled={vehiclesLog.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Kendaraan</span>
              </button>
            </div>

            {/* Module 8: Audit Logs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Jejak Rekam Audit</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-full">
                    {auditLogs.length} Data
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">Riwayat transaksi aksi sistem, pembuatan, dan pengubahan data.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh catatan Audit Trail System?')) {
                    clearAllAuditLogs();
                  }
                }}
                disabled={auditLogs.length === 0}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Audit Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveUserSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8"
          >
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-4 h-4 text-blue-700" />
                <span>{editingUser ? 'Edit Data Account User' : 'Tambah Akun User Sistem Baru'}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  placeholder="e.g. ismail"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Hak Akses</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Supervisor Security">Supervisor Security</option>
                  <option value="User">User / Petugas Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                placeholder="e.g. Ismail (Petugas Pos 1)"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  placeholder="user@lazuardi.sch.id"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Lokasi Tugas</label>
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  placeholder="Pos Utama / Sarpras"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Pengguna</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Security 6-Digit</label>
                <input
                  type="password"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  placeholder="e.g. 123456"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {editingUser ? 'Simpan Perubahan' : 'Buat Akun User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun user "${userToDelete?.name}" (${userToDelete?.username})? Pengguna tidak akan dapat login lagi.`}
      />
    </div>
  );
};
