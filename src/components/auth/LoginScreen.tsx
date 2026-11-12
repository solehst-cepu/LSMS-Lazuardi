import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, User as UserIcon, KeyRound, AlertTriangle, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, lockoutTimeLeft, loginPolicy, usersList } = useApp();

  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  const [username, setUsername] = useState('');
  const [passwordOrPin, setPasswordOrPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Username tidak boleh kosong.');
      return;
    }

    if (!passwordOrPin) {
      setErrorMessage(loginMethod === 'pin' ? 'PIN Security harus diisi.' : 'Password tidak boleh kosong.');
      return;
    }

    const res = login(username, passwordOrPin);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage('Login berhasil! Mengalihkan ke Dashboard LSMS...');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-center text-white relative">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-2xl border border-blue-400/30 mb-3 shadow-inner">
            <Shield className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">LSMS SECURITY</h1>
          <p className="text-xs text-blue-200/80 font-medium mt-1">Lazuardi Security Management System</p>
          <div className="inline-block mt-2 px-3 py-0.5 bg-blue-900/60 border border-blue-700/50 rounded-full text-[10px] text-blue-300 font-mono">
            Portal Otentikasi & Keamanan Terpadu
          </div>
        </div>

        {/* Lockout Warning Alert */}
        {lockoutTimeLeft > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-rose-800 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>AKUN DIBEKUKAN SEMENTARA</span>
            </div>
            <p className="text-xs text-rose-700">
              Terlalu banyak percoba salah. Silakan tunggu <span className="font-mono font-bold text-rose-900 text-sm">{lockoutTimeLeft}s</span> untuk dapat mencoba kembali.
            </p>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Login Method Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setPasswordOrPin('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password User</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('pin');
                setPasswordOrPin('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'pin'
                  ? 'bg-white text-blue-800 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>PIN Security Pos</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username Akun</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={lockoutTimeLeft > 0}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50"
                  placeholder="Masukkan username (contoh: admin, ismail)"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {loginMethod === 'password' ? 'Password' : 'PIN Security 6-Digit'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordOrPin}
                  onChange={(e) => setPasswordOrPin(e.target.value)}
                  disabled={lockoutTimeLeft > 0}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50 font-mono"
                  placeholder={loginMethod === 'password' ? 'Masukkan password' : '6 digit PIN pos security'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Presensi Cepat Petugas Security (Hanya akun "security") */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  <span>Presensi Cepat Petugas Security:</span>
                </span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Login PIN Pos
                </span>
              </div>

              {(() => {
                const securityAccount =
                  usersList.find((u) => u.username.toLowerCase() === 'security') ||
                  usersList.find((u) => u.role === 'User') || {
                    username: 'security',
                    name: 'Petugas Security',
                    role: 'User' as const,
                    unit: 'Security Pos Utama',
                    pin: '123456',
                  };
                const pin = securityAccount.pin || '123456';
                const isSelected =
                  username.toLowerCase() === 'security' && loginMethod === 'pin';

                return (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('pin');
                      setUsername('security');
                      setPasswordOrPin(pin);
                      setErrorMessage('');
                    }}
                    className={`w-full p-2.5 text-left rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/90 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                          <span>Petugas Security</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                            Pos Security
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Username:{' '}
                          <span className="font-mono text-slate-800 font-bold">security</span>{' '}
                          | Security Pos Utama
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-1 bg-white border border-blue-200 text-blue-700 font-mono font-bold text-xs rounded-lg shadow-2xs">
                        PIN: {pin}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Klik untuk isi
                      </span>
                    </div>
                  </button>
                );
              })()}
            </div>

            <button
              type="submit"
              disabled={lockoutTimeLeft > 0}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Masuk ke Sistem LSMS</span>
            </button>
          </form>

          {/* System Rules Footer Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Aturan & Kebijakan Keamanan Login LSMS</span>
            </div>
            <ul className="list-disc list-inside text-slate-500 space-y-0.5 text-[10px] pl-1">
              <li>Batasan gagal login: <span className="font-semibold text-slate-700">{loginPolicy.maxFailedAttempts}x percobaan</span> (terkunci {loginPolicy.lockoutDurationSeconds}s).</li>
              <li>Minimal password: <span className="font-semibold text-slate-700">{loginPolicy.passwordMinLength} karakter</span>.</li>
              <li>PIN Pos Security mendukung presensi cepat saat ganti shift.</li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-[11px] text-slate-400 font-medium">
          Lazuardi Security Management System &copy; 2026. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
