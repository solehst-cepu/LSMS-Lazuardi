import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  SecurityStaff,
  MasterUnit,
  MasterGedung,
  PatrolLocation,
  MasterVehicle,
  IncidentCategory,
  VisitPurpose,
  Visitor,
  DailyReport,
  PatrolLog,
  IncidentReport,
  LostAndFound,
  BarangTitipan,
  SchoolVehicleLog,
  SystemNotification,
  AuditLog,
  LoginPolicy,
} from '../types';
import {
  initialUsers,
  initialStaff,
  initialUnits,
  initialGedung,
  initialPatrolLocations,
  initialVehicles,
  initialIncidentCategories,
  initialPurposes,
  initialVisitors,
  initialDailyReports,
  initialPatrolLogs,
  initialIncidents,
  initialLostAndFound,
  initialBarangTitipan,
  initialVehiclesLog,
  initialNotifications,
  initialAuditLogs,
  initialLoginPolicy,
} from '../utils/initialData';
import {
  SUPABASE_TABLES,
  testSupabaseHealth,
  SupabaseHealthStatus,
} from '../lib/supabase';
import {
  mappers,
  supabaseUpsert,
  supabaseDelete,
  supabaseClearTable,
  pushAllLocalToSupabase,
  pullAllFromSupabase,
} from '../services/supabaseService';

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (username: string, passwordOrPin: string) => { success: boolean; message: string };
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  usersList: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  loginPolicy: LoginPolicy;
  updateLoginPolicy: (policy: Partial<LoginPolicy>) => void;
  lockoutTimeLeft: number;

  visitors: Visitor[];
  checkInVisitor: (visitorData: Omit<Visitor, 'id' | 'visitorNumber' | 'status'>) => void;
  checkOutVisitor: (id: string, securityName: string) => void;
  deleteVisitor: (id: string) => void;
  dailyReports: DailyReport[];
  addDailyReport: (report: Omit<DailyReport, 'id' | 'timestamp'>) => void;
  deleteDailyReport: (id: string) => void;
  patrolLogs: PatrolLog[];
  addPatrolLog: (log: Omit<PatrolLog, 'id' | 'timestamp'>) => void;
  deletePatrolLog: (id: string) => void;
  incidents: IncidentReport[];
  addIncident: (incident: Omit<IncidentReport, 'id' | 'incidentNumber'>) => void;
  updateIncidentStatus: (id: string, status: IncidentReport['status'], actionTaken?: string) => void;
  deleteIncident: (id: string) => void;
  lostAndFound: LostAndFound[];
  addLostFound: (item: Omit<LostAndFound, 'id'>) => void;
  claimLostFound: (id: string, claimedBy: string, phone: string, notes?: string) => void;
  deleteLostFound: (id: string) => void;
  barangTitipan: BarangTitipan[];
  addBarangTitipan: (item: Omit<BarangTitipan, 'id' | 'status'>) => void;
  claimBarangTitipan: (id: string, signatureData?: string) => void;
  deleteBarangTitipan: (id: string) => void;
  vehiclesLog: SchoolVehicleLog[];
  addVehicleLog: (log: Omit<SchoolVehicleLog, 'id' | 'status'>) => void;
  returnVehicle: (id: string, timeIn: string) => void;
  deleteVehicleLog: (id: string) => void;

  // Bulk Data Management (Administrator)
  clearAllVisitors: () => void;
  clearAllDailyReports: () => void;
  clearAllPatrolLogs: () => void;
  clearAllIncidents: () => void;
  clearAllLostFound: () => void;
  clearAllBarangTitipan: () => void;
  clearAllVehiclesLog: () => void;
  clearAllTransactionData: () => void;

  // Master Data CRUD
  staffList: SecurityStaff[];
  addStaff: (staff: Omit<SecurityStaff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<SecurityStaff>) => void;
  deleteStaff: (id: string) => void;

  unitsList: MasterUnit[];
  addUnit: (unit: Omit<MasterUnit, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<MasterUnit>) => void;
  deleteUnit: (id: string) => void;

  gedungList: MasterGedung[];
  addGedung: (gedung: Omit<MasterGedung, 'id'>) => void;
  updateGedung: (id: string, gedung: Partial<MasterGedung>) => void;
  deleteGedung: (id: string) => void;

  patrolLocations: PatrolLocation[];
  addPatrolLocation: (location: Omit<PatrolLocation, 'id'>) => void;
  updatePatrolLocation: (id: string, location: Partial<PatrolLocation>) => void;
  deletePatrolLocation: (id: string) => void;

  vehiclesList: MasterVehicle[];
  addVehicle: (vehicle: Omit<MasterVehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<MasterVehicle>) => void;
  deleteVehicle: (id: string) => void;

  incidentCategories: IncidentCategory[];
  addIncidentCategory: (category: Omit<IncidentCategory, 'id'>) => void;
  updateIncidentCategory: (id: string, category: Partial<IncidentCategory>) => void;
  deleteIncidentCategory: (id: string) => void;

  purposesList: VisitPurpose[];
  addVisitPurpose: (purpose: Omit<VisitPurpose, 'id'>) => void;
  updateVisitPurpose: (id: string, purpose: Partial<VisitPurpose>) => void;
  deleteVisitPurpose: (id: string) => void;

  // Notifications & Audit
  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLog[];
  logAudit: (action: string, module: string, details: string) => void;
  deleteAuditLog: (id: string) => void;
  clearAllAuditLogs: () => void;

  // Supabase Status & Sync Management
  isSupabaseOnline: boolean;
  supabaseLatency: number | null;
  lastSupabaseSync: string;
  isSyncing: boolean;
  testConnection: () => Promise<SupabaseHealthStatus>;
  syncLocalToCloud: () => Promise<{ success: boolean; message: string; results?: any }>;
  pullCloudToLocal: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`lsms_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`lsms_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() =>
    getStorage('currentUser', initialUsers[0])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStorage('isAuthenticated', true)
  );
  const [usersList, setUsersList] = useState<User[]>(() =>
    getStorage('usersList', initialUsers)
  );
  const [loginPolicy, setLoginPolicy] = useState<LoginPolicy>(() =>
    getStorage('loginPolicy', initialLoginPolicy)
  );
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  const [visitors, setVisitors] = useState<Visitor[]>(() =>
    getStorage('visitors', initialVisitors)
  );
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() =>
    getStorage('dailyReports', initialDailyReports)
  );
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>(() =>
    getStorage('patrolLogs', initialPatrolLogs)
  );
  const [incidents, setIncidents] = useState<IncidentReport[]>(() =>
    getStorage('incidents', initialIncidents)
  );
  const [lostAndFound, setLostAndFound] = useState<LostAndFound[]>(() =>
    getStorage('lostAndFound', initialLostAndFound)
  );
  const [barangTitipan, setBarangTitipan] = useState<BarangTitipan[]>(() =>
    getStorage('barangTitipan', initialBarangTitipan)
  );
  const [vehiclesLog, setVehiclesLog] = useState<SchoolVehicleLog[]>(() =>
    getStorage('vehiclesLog', initialVehiclesLog)
  );

  // Master States
  const [staffList, setStaffList] = useState<SecurityStaff[]>(() =>
    getStorage('staffList', initialStaff)
  );
  const [unitsList, setUnitsList] = useState<MasterUnit[]>(() =>
    getStorage('unitsList', initialUnits)
  );
  const [gedungList, setGedungList] = useState<MasterGedung[]>(() =>
    getStorage('gedungList', initialGedung)
  );
  const [patrolLocations, setPatrolLocations] = useState<PatrolLocation[]>(() =>
    getStorage('patrolLocations', initialPatrolLocations)
  );
  const [vehiclesList, setVehiclesList] = useState<MasterVehicle[]>(() =>
    getStorage('vehiclesList', initialVehicles)
  );
  const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>(() =>
    getStorage('incidentCategories', initialIncidentCategories)
  );
  const [purposesList, setPurposesList] = useState<VisitPurpose[]>(() =>
    getStorage('purposesList', initialPurposes)
  );

  // Notifications & Audit
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    getStorage('notifications', initialNotifications)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStorage('auditLogs', initialAuditLogs)
  );

  // Supabase Connection & Sync State
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(true);
  const [supabaseLatency, setSupabaseLatency] = useState<number | null>(null);
  const [lastSupabaseSync, setLastSupabaseSync] = useState<string>(() =>
    getStorage('lastSupabaseSync', new Date().toLocaleTimeString('id-ID'))
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Countdown timer for lockout
  useEffect(() => {
    let timer: any = null;
    if (lockoutTimeLeft > 0) {
      timer = setInterval(() => {
        setLockoutTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutTimeLeft]);

  // Initial Supabase healthcheck & background sync on startup
  useEffect(() => {
    let isMounted = true;
    async function initSupabase() {
      try {
        const health = await testSupabaseHealth();
        if (isMounted) {
          setIsSupabaseOnline(health.connected);
          setSupabaseLatency(health.latencyMs || null);
        }

        // Try pull existing cloud data if available
        if (health.connected) {
          const pullRes = await pullAllFromSupabase();
          if (pullRes.success && pullRes.data && isMounted) {
            if (pullRes.data.visitors?.length) setVisitors(pullRes.data.visitors);
            if (pullRes.data.dailyReports?.length) setDailyReports(pullRes.data.dailyReports);
            if (pullRes.data.patrolLogs?.length) setPatrolLogs(pullRes.data.patrolLogs);
            if (pullRes.data.incidents?.length) setIncidents(pullRes.data.incidents);
            if (pullRes.data.lostAndFound?.length) setLostAndFound(pullRes.data.lostAndFound);
            if (pullRes.data.barangTitipan?.length) setBarangTitipan(pullRes.data.barangTitipan);
            if (pullRes.data.vehiclesLog?.length) setVehiclesLog(pullRes.data.vehiclesLog);
            if (pullRes.data.staffList?.length) setStaffList(pullRes.data.staffList);
            if (pullRes.data.unitsList?.length) setUnitsList(pullRes.data.unitsList);
            if (pullRes.data.gedungList?.length) setGedungList(pullRes.data.gedungList);
            if (pullRes.data.patrolLocations?.length) setPatrolLocations(pullRes.data.patrolLocations);
            if (pullRes.data.vehiclesList?.length) setVehiclesList(pullRes.data.vehiclesList);
            if (pullRes.data.incidentCategories?.length) setIncidentCategories(pullRes.data.incidentCategories);
            if (pullRes.data.purposesList?.length) setPurposesList(pullRes.data.purposesList);
            if (pullRes.data.usersList?.length) setUsersList(pullRes.data.usersList);
            if (pullRes.data.loginPolicy) setLoginPolicy(pullRes.data.loginPolicy);
            setLastSupabaseSync(new Date().toLocaleTimeString('id-ID'));
          }
        }
      } catch (e) {
        console.warn('Initial Supabase hydration note:', e);
      }
    }
    initSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state changes to localStorage cache
  useEffect(() => setStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => setStorage('isAuthenticated', isAuthenticated), [isAuthenticated]);
  useEffect(() => setStorage('usersList', usersList), [usersList]);
  useEffect(() => setStorage('loginPolicy', loginPolicy), [loginPolicy]);
  useEffect(() => setStorage('visitors', visitors), [visitors]);
  useEffect(() => setStorage('dailyReports', dailyReports), [dailyReports]);
  useEffect(() => setStorage('patrolLogs', patrolLogs), [patrolLogs]);
  useEffect(() => setStorage('incidents', incidents), [incidents]);
  useEffect(() => setStorage('lostAndFound', lostAndFound), [lostAndFound]);
  useEffect(() => setStorage('barangTitipan', barangTitipan), [barangTitipan]);
  useEffect(() => setStorage('vehiclesLog', vehiclesLog), [vehiclesLog]);
  useEffect(() => setStorage('staffList', staffList), [staffList]);
  useEffect(() => setStorage('unitsList', unitsList), [unitsList]);
  useEffect(() => setStorage('gedungList', gedungList), [gedungList]);
  useEffect(() => setStorage('patrolLocations', patrolLocations), [patrolLocations]);
  useEffect(() => setStorage('vehiclesList', vehiclesList), [vehiclesList]);
  useEffect(() => setStorage('incidentCategories', incidentCategories), [incidentCategories]);
  useEffect(() => setStorage('purposesList', purposesList), [purposesList]);
  useEffect(() => setStorage('notifications', notifications), [notifications]);
  useEffect(() => setStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => setStorage('lastSupabaseSync', lastSupabaseSync), [lastSupabaseSync]);

  // Audit Logger helper
  const logAudit = useCallback((action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      userName: currentUser.name || 'System',
      userRole: currentUser.role || 'User',
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    // Asynchronously upsert to Supabase
    supabaseUpsert(SUPABASE_TABLES.AUDIT_LOGS, mappers.auditLogToDb(newLog));
  }, [currentUser]);

  // Supabase Manual Sync Handlers
  const testConnection = async (): Promise<SupabaseHealthStatus> => {
    const res = await testSupabaseHealth();
    setIsSupabaseOnline(res.connected);
    setSupabaseLatency(res.latencyMs || null);
    return res;
  };

  const syncLocalToCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await pushAllLocalToSupabase({
        usersList,
        staffList,
        unitsList,
        gedungList,
        patrolLocations,
        vehiclesList,
        incidentCategories,
        purposesList,
        visitors,
        dailyReports,
        patrolLogs,
        incidents,
        lostAndFound,
        barangTitipan,
        vehiclesLog,
        notifications,
        auditLogs,
        loginPolicy,
      });
      const nowStr = new Date().toLocaleTimeString('id-ID');
      setLastSupabaseSync(nowStr);
      logAudit('SUPABASE_PUSH_SYNC', 'Database Supabase', 'Upload seluruh data lokal ke Supabase PostgreSQL');
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const pullCloudToLocal = async () => {
    setIsSyncing(true);
    try {
      const res = await pullAllFromSupabase();
      if (res.success && res.data) {
        if (res.data.visitors?.length) setVisitors(res.data.visitors);
        if (res.data.dailyReports?.length) setDailyReports(res.data.dailyReports);
        if (res.data.patrolLogs?.length) setPatrolLogs(res.data.patrolLogs);
        if (res.data.incidents?.length) setIncidents(res.data.incidents);
        if (res.data.lostAndFound?.length) setLostAndFound(res.data.lostAndFound);
        if (res.data.barangTitipan?.length) setBarangTitipan(res.data.barangTitipan);
        if (res.data.vehiclesLog?.length) setVehiclesLog(res.data.vehiclesLog);
        if (res.data.staffList?.length) setStaffList(res.data.staffList);
        if (res.data.unitsList?.length) setUnitsList(res.data.unitsList);
        if (res.data.gedungList?.length) setGedungList(res.data.gedungList);
        if (res.data.patrolLocations?.length) setPatrolLocations(res.data.patrolLocations);
        if (res.data.vehiclesList?.length) setVehiclesList(res.data.vehiclesList);
        if (res.data.incidentCategories?.length) setIncidentCategories(res.data.incidentCategories);
        if (res.data.purposesList?.length) setPurposesList(res.data.purposesList);
        if (res.data.usersList?.length) setUsersList(res.data.usersList);
        if (res.data.loginPolicy) setLoginPolicy(res.data.loginPolicy);
        const nowStr = new Date().toLocaleTimeString('id-ID');
        setLastSupabaseSync(nowStr);
        logAudit('SUPABASE_PULL_SYNC', 'Database Supabase', 'Tarik seluruh data dari Supabase Cloud');
      }
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Functions
  const login = (username: string, passwordOrPin: string) => {
    if (lockoutTimeLeft > 0) {
      return {
        success: false,
        message: `Akun terkunci sementara akibat percobaan gagal berulang. Coba lagi dalam ${lockoutTimeLeft} detik.`,
      };
    }

    const foundUser = usersList.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= loginPolicy.maxFailedAttempts) {
        setLockoutTimeLeft(loginPolicy.lockoutDurationSeconds);
        setFailedAttempts(0);
        logAudit('LOGIN_LOCKOUT', 'Sistem Otentikasi', `Sistem terkunci ${loginPolicy.lockoutDurationSeconds}s akibat 3x salah login: ${username}`);
        return {
          success: false,
          message: `Terlalu banyak percobaan gagal! Akses terkunci selama ${loginPolicy.lockoutDurationSeconds} detik.`,
        };
      }
      return { success: false, message: 'Username tidak ditemukan di sistem.' };
    }

    if (foundUser.status === 'Nonaktif') {
      return { success: false, message: 'Akun ini dalam status Nonaktif. Hubungi Administrator.' };
    }

    const isPasswordMatch = foundUser.password ? foundUser.password === passwordOrPin : true;
    const isPinMatch = foundUser.pin ? foundUser.pin === passwordOrPin : true;

    if (!isPasswordMatch && !isPinMatch) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= loginPolicy.maxFailedAttempts) {
        setLockoutTimeLeft(loginPolicy.lockoutDurationSeconds);
        setFailedAttempts(0);
        logAudit('LOGIN_LOCKOUT', 'Sistem Otentikasi', `Akun ${username} terkunci akibat ${loginPolicy.maxFailedAttempts}x password/PIN salah.`);
        return {
          success: false,
          message: `Password/PIN salah ${loginPolicy.maxFailedAttempts}x! Akses terkunci selama ${loginPolicy.lockoutDurationSeconds} detik.`,
        };
      }
      return {
        success: false,
        message: `Password atau PIN salah. (Sisa percobaan: ${loginPolicy.maxFailedAttempts - newAttempts})`,
      };
    }

    // Login successful
    const updatedUser: User = {
      ...foundUser,
      lastLogin: new Date().toLocaleString('id-ID'),
    };
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setFailedAttempts(0);
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    // Sync to Supabase
    supabaseUpsert(SUPABASE_TABLES.USERS, mappers.userToDb(updatedUser));
    logAudit('LOGIN_SUCCESS', 'Sistem Otentikasi', `Login berhasil untuk pengguna ${updatedUser.name} (${updatedUser.role})`);
    return { success: true, message: 'Login berhasil!' };
  };

  const logout = () => {
    logAudit('LOGOUT', 'Sistem Otentikasi', `User ${currentUser.name} melakukan Logout.`);
    setIsAuthenticated(false);
  };

  const switchUserRole = (role: UserRole) => {
    const matched = usersList.find((u) => u.role === role) || {
      id: `USR-${Date.now()}`,
      username: role.toLowerCase().replace(' ', ''),
      name: `${role} User`,
      role,
      status: 'Aktif' as const,
    };
    setCurrentUser(matched);
    logAudit('SWITCH_ROLE', 'Pengaturan User', `Mengubah mode role menjadi ${role}`);
  };

  // User Management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
    };
    setUsersList((prev) => [...prev, newUser]);
    supabaseUpsert(SUPABASE_TABLES.USERS, mappers.userToDb(newUser));
    logAudit('ADD_USER', 'Pengaturan User', `Membuat akun user baru: ${newUser.username} (${newUser.name})`);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...userData };
          supabaseUpsert(SUPABASE_TABLES.USERS, mappers.userToDb(updated));
          return updated;
        }
        return u;
      })
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...userData }));
    }
    logAudit('UPDATE_USER', 'Pengaturan User', `Memperbarui data akun user ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    const target = usersList.find((u) => u.id === id);
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    supabaseDelete(SUPABASE_TABLES.USERS, id);
    logAudit('DELETE_USER', 'Pengaturan User', `Menghapus akun user: ${target?.username || id}`);
  };

  const updateLoginPolicy = (newPolicy: Partial<LoginPolicy>) => {
    setLoginPolicy((prev) => {
      const updated = { ...prev, ...newPolicy };
      supabaseUpsert(SUPABASE_TABLES.LOGIN_POLICY, mappers.loginPolicyToDb(updated));
      logAudit('UPDATE_LOGIN_POLICY', 'Pengaturan User', `Memperbarui aturan kebijakan login sistem.`);
      return updated;
    });
  };

  // Visitor Functions
  const checkInVisitor = (visitorData: Omit<Visitor, 'id' | 'visitorNumber' | 'status'>) => {
    const count = visitors.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const visitorNumber = `VST-${dateStr}-${String(count).padStart(3, '0')}`;
    const newVisitor: Visitor = {
      ...visitorData,
      id: `VST-${Date.now()}`,
      visitorNumber,
      status: 'Masih di Sekolah',
      durationMinutes: 0,
      isOverdueAlert: false,
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.VISITORS, mappers.visitorToDb(newVisitor));
    logAudit('CHECK_IN_VISITOR', 'Visitor Management', `Check In Visitor: ${newVisitor.name} (${newVisitor.visitorNumber}) ke ${newVisitor.destinationUnit}`);
  };

  const checkOutVisitor = (id: string, securityName: string) => {
    const now = new Date();
    const timeOut = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          let durationMinutes = 60;
          try {
            const [hIn, mIn] = v.timeIn.split(':').map(Number);
            const inMinutes = hIn * 60 + mIn;
            const outMinutes = now.getHours() * 60 + now.getMinutes();
            durationMinutes = Math.max(1, outMinutes - inMinutes);
          } catch {
            durationMinutes = 60;
          }

          const updated: Visitor = {
            ...v,
            timeOut,
            checkoutSecurity: securityName,
            status: 'Sudah Keluar',
            durationMinutes,
            isOverdueAlert: false,
          };
          supabaseUpsert(SUPABASE_TABLES.VISITORS, mappers.visitorToDb(updated));
          logAudit('CHECK_OUT_VISITOR', 'Visitor Management', `Check Out Visitor: ${v.name} (${v.visitorNumber}). Petugas: ${securityName}`);
          return updated;
        }
        return v;
      })
    );
  };

  const deleteVisitor = (id: string) => {
    const target = visitors.find((v) => v.id === id);
    setVisitors((prev) => prev.filter((v) => v.id !== id));
    supabaseDelete(SUPABASE_TABLES.VISITORS, id);
    logAudit('DELETE_VISITOR_LOG', 'Visitor Management', `Administrator menghapus log visitor: ${target?.name || id} (${target?.visitorNumber || ''})`);
  };

  // Daily Report
  const addDailyReport = (reportData: Omit<DailyReport, 'id' | 'timestamp'>) => {
    const timestamp = new Date().toLocaleString('id-ID');
    const newReport: DailyReport = {
      ...reportData,
      id: `DLY-${Date.now()}`,
      timestamp,
    };
    setDailyReports((prev) => [newReport, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.DAILY_REPORTS, mappers.dailyReportToDb(newReport));
    logAudit('CREATE_DAILY_REPORT', 'Daily Security Report', `Laporan Harian Shift ${newReport.shift} Tanggal ${newReport.date}`);
  };

  const deleteDailyReport = (id: string) => {
    const target = dailyReports.find((r) => r.id === id);
    setDailyReports((prev) => prev.filter((r) => r.id !== id));
    supabaseDelete(SUPABASE_TABLES.DAILY_REPORTS, id);
    logAudit('DELETE_DAILY_REPORT', 'Daily Security Report', `Administrator menghapus laporan harian ID: ${id} Shift: ${target?.shift || ''}`);
  };

  // Patrol Log
  const addPatrolLog = (logData: Omit<PatrolLog, 'id' | 'timestamp'>) => {
    const timestamp = new Date().toLocaleString('id-ID');
    const newPatrol: PatrolLog = {
      ...logData,
      id: `PTR-${Date.now()}`,
      timestamp,
    };
    setPatrolLogs((prev) => [newPatrol, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.PATROL_LOGS, mappers.patrolLogToDb(newPatrol));
    logAudit('SCAN_PATROL_QR', 'Patroli Security', `Scan QR Patroli di ${newPatrol.locationName} (${newPatrol.status})`);
  };

  const deletePatrolLog = (id: string) => {
    const target = patrolLogs.find((p) => p.id === id);
    setPatrolLogs((prev) => prev.filter((p) => p.id !== id));
    supabaseDelete(SUPABASE_TABLES.PATROL_LOGS, id);
    logAudit('DELETE_PATROL_LOG', 'Patroli Security', `Administrator menghapus log patroli ID: ${id} Lokasi: ${target?.locationName || ''}`);
  };

  // Incident
  const addIncident = (incidentData: Omit<IncidentReport, 'id' | 'incidentNumber'>) => {
    const count = incidents.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const incidentNumber = `INC-${dateStr}-${String(count).padStart(2, '0')}`;
    const newIncident: IncidentReport = {
      ...incidentData,
      id: `INC-${Date.now()}`,
      incidentNumber,
    };
    setIncidents((prev) => [newIncident, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.INCIDENTS, mappers.incidentToDb(newIncident));
    logAudit('CREATE_INCIDENT', 'Laporan Insiden', `Laporan Insiden ${newIncident.category} (${newIncident.priority}) di ${newIncident.location}`);

    if (newIncident.priority === 'Critical') {
      const notif: SystemNotification = {
        id: `NOTIF-${Date.now()}`,
        type: 'incident_critical',
        title: 'Insiden Critical Baru!',
        message: `Insiden ${newIncident.category} di ${newIncident.location} membutuhkan tindakan langsung!`,
        timestamp: new Date().toLocaleString('id-ID'),
        read: false,
        linkModule: 'incidents',
      };
      setNotifications((prev) => [notif, ...prev]);
      supabaseUpsert(SUPABASE_TABLES.NOTIFICATIONS, mappers.notificationToDb(notif));
    }
  };

  const updateIncidentStatus = (id: string, status: IncidentReport['status'], actionTaken?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated = { ...inc, status, actionTaken: actionTaken || inc.actionTaken };
          supabaseUpsert(SUPABASE_TABLES.INCIDENTS, mappers.incidentToDb(updated));
          return updated;
        }
        return inc;
      })
    );
    logAudit('UPDATE_INCIDENT_STATUS', 'Laporan Insiden', `Update status insiden ${id} menjadi ${status}`);
  };

  const deleteIncident = (id: string) => {
    const target = incidents.find((i) => i.id === id);
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    supabaseDelete(SUPABASE_TABLES.INCIDENTS, id);
    logAudit('DELETE_INCIDENT', 'Laporan Insiden', `Administrator menghapus laporan insiden: ${target?.incidentNumber || id}`);
  };

  // Lost and Found
  const addLostFound = (itemData: Omit<LostAndFound, 'id'>) => {
    const newItem: LostAndFound = {
      ...itemData,
      id: `LNF-${Date.now()}`,
    };
    setLostAndFound((prev) => [newItem, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.LOST_AND_FOUND, mappers.lostAndFoundToDb(newItem));
    logAudit('ADD_LOST_FOUND', 'Lost and Found', `Tambah data penemuan barang: ${newItem.itemName}`);
  };

  const claimLostFound = (id: string, claimedBy: string, phone: string, notes?: string) => {
    setLostAndFound((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated: LostAndFound = {
            ...item,
            status: 'Sudah Diambil',
            claimedBy,
            claimedPhone: phone,
            claimDate: new Date().toLocaleString('id-ID'),
            notes: notes || item.notes,
          };
          supabaseUpsert(SUPABASE_TABLES.LOST_AND_FOUND, mappers.lostAndFoundToDb(updated));
          return updated;
        }
        return item;
      })
    );
    logAudit('CLAIM_LOST_FOUND', 'Lost and Found', `Penyerahan barang ${id} kepada ${claimedBy}`);
  };

  const deleteLostFound = (id: string) => {
    const target = lostAndFound.find((l) => l.id === id);
    setLostAndFound((prev) => prev.filter((l) => l.id !== id));
    supabaseDelete(SUPABASE_TABLES.LOST_AND_FOUND, id);
    logAudit('DELETE_LOST_FOUND', 'Lost and Found', `Administrator menghapus data barang temuan: ${target?.itemName || id}`);
  };

  // Barang Titipan
  const addBarangTitipan = (itemData: Omit<BarangTitipan, 'id' | 'status'>) => {
    const newItem: BarangTitipan = {
      ...itemData,
      id: `TTP-${Date.now()}`,
      status: 'Dititipkan',
    };
    setBarangTitipan((prev) => [newItem, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.BARANG_TITIPAN, mappers.barangTitipanToDb(newItem));
    logAudit('ADD_BARANG_TITIPAN', 'Penitipan Barang', `Penitipan barang baru dari ${newItem.ownerName}`);
  };

  const claimBarangTitipan = (id: string, signatureData?: string) => {
    const now = new Date();
    const timeOut = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateOut = now.toISOString().slice(0, 10);

    setBarangTitipan((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated: BarangTitipan = {
            ...item,
            status: 'Sudah Diambil',
            timeOut,
            dateOut,
            digitalSignature: signatureData || item.digitalSignature,
          };
          supabaseUpsert(SUPABASE_TABLES.BARANG_TITIPAN, mappers.barangTitipanToDb(updated));
          return updated;
        }
        return item;
      })
    );
    logAudit('CLAIM_BARANG_TITIPAN', 'Penitipan Barang', `Pengambilan barang titipan ID: ${id}`);
  };

  const deleteBarangTitipan = (id: string) => {
    const target = barangTitipan.find((b) => b.id === id);
    setBarangTitipan((prev) => prev.filter((b) => b.id !== id));
    supabaseDelete(SUPABASE_TABLES.BARANG_TITIPAN, id);
    logAudit('DELETE_BARANG_TITIPAN', 'Penitipan Barang', `Administrator menghapus log barang titipan: ${target?.itemDescription || id}`);
  };

  // Vehicles Log
  const addVehicleLog = (logData: Omit<SchoolVehicleLog, 'id' | 'status'>) => {
    const newLog: SchoolVehicleLog = {
      ...logData,
      id: `VLOG-${Date.now()}`,
      status: 'Masih Keluar',
    };
    setVehiclesLog((prev) => [newLog, ...prev]);
    supabaseUpsert(SUPABASE_TABLES.VEHICLE_LOGS, mappers.vehicleLogToDb(newLog));
    logAudit('LOG_VEHICLE_OUT', 'Kendaraan Sekolah', `Keberangkatan kendaraan ${newLog.vehicleName} driver ${newLog.driverName}`);
  };

  const returnVehicle = (id: string, timeIn: string) => {
    setVehiclesLog((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated: SchoolVehicleLog = { ...v, timeIn, status: 'Sudah Kembali' };
          supabaseUpsert(SUPABASE_TABLES.VEHICLE_LOGS, mappers.vehicleLogToDb(updated));
          return updated;
        }
        return v;
      })
    );
    logAudit('LOG_VEHICLE_IN', 'Kendaraan Sekolah', `Kepulangan kendaraan ID: ${id}`);
  };

  const deleteVehicleLog = (id: string) => {
    const target = vehiclesLog.find((v) => v.id === id);
    setVehiclesLog((prev) => prev.filter((v) => v.id !== id));
    supabaseDelete(SUPABASE_TABLES.VEHICLE_LOGS, id);
    logAudit('DELETE_VEHICLE_LOG', 'Kendaraan Sekolah', `Administrator menghapus log kendaraan: ${target?.vehicleName || id}`);
  };

  // Bulk Clear Functions (Administrator)
  const clearAllVisitors = () => {
    setVisitors([]);
    supabaseClearTable(SUPABASE_TABLES.VISITORS);
    logAudit('CLEAR_ALL_VISITORS', 'Visitor Management', 'Administrator mengosongkan seluruh data BUKU TAMU / VISITOR');
  };

  const clearAllDailyReports = () => {
    setDailyReports([]);
    supabaseClearTable(SUPABASE_TABLES.DAILY_REPORTS);
    logAudit('CLEAR_ALL_DAILY_REPORTS', 'Daily Security Report', 'Administrator mengosongkan seluruh LAPORAN HARIAN');
  };

  const clearAllPatrolLogs = () => {
    setPatrolLogs([]);
    supabaseClearTable(SUPABASE_TABLES.PATROL_LOGS);
    logAudit('CLEAR_ALL_PATROL_LOGS', 'Patroli Security', 'Administrator mengosongkan seluruh RIWAYAT PATROLI');
  };

  const clearAllIncidents = () => {
    setIncidents([]);
    supabaseClearTable(SUPABASE_TABLES.INCIDENTS);
    logAudit('CLEAR_ALL_INCIDENTS', 'Laporan Insiden', 'Administrator mengosongkan seluruh LAPORAN INSIDEN');
  };

  const clearAllLostFound = () => {
    setLostAndFound([]);
    supabaseClearTable(SUPABASE_TABLES.LOST_AND_FOUND);
    logAudit('CLEAR_ALL_LOST_FOUND', 'Lost and Found', 'Administrator mengosongkan seluruh DATA BARANG TEMUAN');
  };

  const clearAllBarangTitipan = () => {
    setBarangTitipan([]);
    supabaseClearTable(SUPABASE_TABLES.BARANG_TITIPAN);
    logAudit('CLEAR_ALL_TITIPAN', 'Penitipan Barang', 'Administrator mengosongkan seluruh LOG BARANG TITIPAN');
  };

  const clearAllVehiclesLog = () => {
    setVehiclesLog([]);
    supabaseClearTable(SUPABASE_TABLES.VEHICLE_LOGS);
    logAudit('CLEAR_ALL_VEHICLES_LOG', 'Kendaraan Sekolah', 'Administrator mengosongkan seluruh LOG KENDARAAN SEKOLAH');
  };

  const clearAllTransactionData = () => {
    setVisitors([]);
    setDailyReports([]);
    setPatrolLogs([]);
    setIncidents([]);
    setLostAndFound([]);
    setBarangTitipan([]);
    setVehiclesLog([]);
    supabaseClearTable(SUPABASE_TABLES.VISITORS);
    supabaseClearTable(SUPABASE_TABLES.DAILY_REPORTS);
    supabaseClearTable(SUPABASE_TABLES.PATROL_LOGS);
    supabaseClearTable(SUPABASE_TABLES.INCIDENTS);
    supabaseClearTable(SUPABASE_TABLES.LOST_AND_FOUND);
    supabaseClearTable(SUPABASE_TABLES.BARANG_TITIPAN);
    supabaseClearTable(SUPABASE_TABLES.VEHICLE_LOGS);
    logAudit('RESET_ALL_DATA', 'System Reset', 'ADMINISTRATOR MENGHAPUS / MENGOSONGKAN SELURUH DATA TRANSAKSI INPUTAN SISTEM');
  };

  const deleteAuditLog = (id: string) => {
    setAuditLogs((prev) => prev.filter((a) => a.id !== id));
    supabaseDelete(SUPABASE_TABLES.AUDIT_LOGS, id);
  };

  const clearAllAuditLogs = () => {
    setAuditLogs([]);
    supabaseClearTable(SUPABASE_TABLES.AUDIT_LOGS);
  };

  // MASTER DATA FULL CRUD

  // Staff
  const addStaff = (staffData: Omit<SecurityStaff, 'id'>) => {
    const newStaff: SecurityStaff = {
      ...staffData,
      id: `STF-${Date.now()}`,
    };
    setStaffList((prev) => [...prev, newStaff]);
    supabaseUpsert(SUPABASE_TABLES.STAFF, mappers.staffToDb(newStaff));
    logAudit('ADD_MASTER_STAFF', 'Master Data', `Tambah Staff Security: ${newStaff.name}`);
  };

  const updateStaff = (id: string, staffData: Partial<SecurityStaff>) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...staffData };
          supabaseUpsert(SUPABASE_TABLES.STAFF, mappers.staffToDb(updated));
          return updated;
        }
        return s;
      })
    );
    logAudit('UPDATE_MASTER_STAFF', 'Master Data', `Edit Staff Security: ${staffData.name || id}`);
  };

  const deleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    supabaseDelete(SUPABASE_TABLES.STAFF, id);
    logAudit('DELETE_MASTER_STAFF', 'Master Data', `Hapus Staff Security: ${target?.name || id}`);
  };

  // Units
  const addUnit = (unitData: Omit<MasterUnit, 'id'>) => {
    const newUnit: MasterUnit = { ...unitData, id: `UNT-${Date.now()}` };
    setUnitsList((prev) => [...prev, newUnit]);
    supabaseUpsert(SUPABASE_TABLES.UNITS, mappers.unitToDb(newUnit));
    logAudit('ADD_MASTER_UNIT', 'Master Data', `Tambah Master Unit: ${newUnit.name}`);
  };

  const updateUnit = (id: string, unitData: Partial<MasterUnit>) => {
    setUnitsList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...unitData };
          supabaseUpsert(SUPABASE_TABLES.UNITS, mappers.unitToDb(updated));
          return updated;
        }
        return u;
      })
    );
    logAudit('UPDATE_MASTER_UNIT', 'Master Data', `Edit Master Unit: ${unitData.name || id}`);
  };

  const deleteUnit = (id: string) => {
    const target = unitsList.find((u) => u.id === id);
    setUnitsList((prev) => prev.filter((u) => u.id !== id));
    supabaseDelete(SUPABASE_TABLES.UNITS, id);
    logAudit('DELETE_MASTER_UNIT', 'Master Data', `Hapus Master Unit: ${target?.name || id}`);
  };

  // Gedung
  const addGedung = (gedungData: Omit<MasterGedung, 'id'>) => {
    const newGedung: MasterGedung = { ...gedungData, id: `GDG-${Date.now()}` };
    setGedungList((prev) => [...prev, newGedung]);
    supabaseUpsert(SUPABASE_TABLES.GEDUNG, mappers.gedungToDb(newGedung));
    logAudit('ADD_MASTER_GEDUNG', 'Master Data', `Tambah Master Gedung: ${newGedung.name}`);
  };

  const updateGedung = (id: string, gedungData: Partial<MasterGedung>) => {
    setGedungList((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...gedungData };
          supabaseUpsert(SUPABASE_TABLES.GEDUNG, mappers.gedungToDb(updated));
          return updated;
        }
        return g;
      })
    );
    logAudit('UPDATE_MASTER_GEDUNG', 'Master Data', `Edit Master Gedung: ${gedungData.name || id}`);
  };

  const deleteGedung = (id: string) => {
    const target = gedungList.find((g) => g.id === id);
    setGedungList((prev) => prev.filter((g) => g.id !== id));
    supabaseDelete(SUPABASE_TABLES.GEDUNG, id);
    logAudit('DELETE_MASTER_GEDUNG', 'Master Data', `Hapus Master Gedung: ${target?.name || id}`);
  };

  // Patrol Locations
  const addPatrolLocation = (locData: Omit<PatrolLocation, 'id'>) => {
    const newLoc: PatrolLocation = { ...locData, id: `LOC-${Date.now()}` };
    setPatrolLocations((prev) => [...prev, newLoc]);
    supabaseUpsert(SUPABASE_TABLES.PATROL_LOCATIONS, mappers.patrolLocationToDb(newLoc));
    logAudit('ADD_PATROL_LOCATION', 'Master Data', `Tambah Lokasi Patroli: ${newLoc.name}`);
  };

  const updatePatrolLocation = (id: string, locData: Partial<PatrolLocation>) => {
    setPatrolLocations((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...locData };
          supabaseUpsert(SUPABASE_TABLES.PATROL_LOCATIONS, mappers.patrolLocationToDb(updated));
          return updated;
        }
        return l;
      })
    );
    logAudit('UPDATE_PATROL_LOCATION', 'Master Data', `Edit Lokasi Patroli: ${locData.name || id}`);
  };

  const deletePatrolLocation = (id: string) => {
    const target = patrolLocations.find((l) => l.id === id);
    setPatrolLocations((prev) => prev.filter((l) => l.id !== id));
    supabaseDelete(SUPABASE_TABLES.PATROL_LOCATIONS, id);
    logAudit('DELETE_PATROL_LOCATION', 'Master Data', `Hapus Lokasi Patroli: ${target?.name || id}`);
  };

  // Master Vehicles
  const addVehicle = (vehicleData: Omit<MasterVehicle, 'id'>) => {
    const newVeh: MasterVehicle = { ...vehicleData, id: `VHC-${Date.now()}` };
    setVehiclesList((prev) => [...prev, newVeh]);
    supabaseUpsert(SUPABASE_TABLES.VEHICLES, mappers.vehicleToDb(newVeh));
    logAudit('ADD_MASTER_VEHICLE', 'Master Data', `Tambah Kendaraan Armada: ${newVeh.name}`);
  };

  const updateVehicle = (id: string, vehicleData: Partial<MasterVehicle>) => {
    setVehiclesList((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, ...vehicleData };
          supabaseUpsert(SUPABASE_TABLES.VEHICLES, mappers.vehicleToDb(updated));
          return updated;
        }
        return v;
      })
    );
    logAudit('UPDATE_MASTER_VEHICLE', 'Master Data', `Edit Kendaraan Armada: ${vehicleData.name || id}`);
  };

  const deleteVehicle = (id: string) => {
    const target = vehiclesList.find((v) => v.id === id);
    setVehiclesList((prev) => prev.filter((v) => v.id !== id));
    supabaseDelete(SUPABASE_TABLES.VEHICLES, id);
    logAudit('DELETE_MASTER_VEHICLE', 'Master Data', `Hapus Kendaraan Armada: ${target?.name || id}`);
  };

  // Master Incident Categories
  const addIncidentCategory = (categoryData: Omit<IncidentCategory, 'id'>) => {
    const newCat: IncidentCategory = { ...categoryData, id: `CAT-${Date.now()}` };
    setIncidentCategories((prev) => [...prev, newCat]);
    supabaseUpsert(SUPABASE_TABLES.INCIDENT_CATEGORIES, mappers.incidentCategoryToDb(newCat));
    logAudit('ADD_INCIDENT_CATEGORY', 'Master Data', `Tambah Jenis Insiden: ${newCat.name}`);
  };

  const updateIncidentCategory = (id: string, categoryData: Partial<IncidentCategory>) => {
    setIncidentCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...categoryData };
          supabaseUpsert(SUPABASE_TABLES.INCIDENT_CATEGORIES, mappers.incidentCategoryToDb(updated));
          return updated;
        }
        return c;
      })
    );
    logAudit('UPDATE_INCIDENT_CATEGORY', 'Master Data', `Edit Jenis Insiden: ${categoryData.name || id}`);
  };

  const deleteIncidentCategory = (id: string) => {
    const target = incidentCategories.find((c) => c.id === id);
    setIncidentCategories((prev) => prev.filter((c) => c.id !== id));
    supabaseDelete(SUPABASE_TABLES.INCIDENT_CATEGORIES, id);
    logAudit('DELETE_INCIDENT_CATEGORY', 'Master Data', `Hapus Jenis Insiden: ${target?.name || id}`);
  };

  // Master Visit Purposes
  const addVisitPurpose = (purposeData: Omit<VisitPurpose, 'id'>) => {
    const newPrp: VisitPurpose = { ...purposeData, id: `PRP-${Date.now()}` };
    setPurposesList((prev) => [...prev, newPrp]);
    supabaseUpsert(SUPABASE_TABLES.VISIT_PURPOSES, mappers.visitPurposeToDb(newPrp));
    logAudit('ADD_VISIT_PURPOSE', 'Master Data', `Tambah Tujuan Kunjungan: ${newPrp.name}`);
  };

  const updateVisitPurpose = (id: string, purposeData: Partial<VisitPurpose>) => {
    setPurposesList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...purposeData };
          supabaseUpsert(SUPABASE_TABLES.VISIT_PURPOSES, mappers.visitPurposeToDb(updated));
          return updated;
        }
        return p;
      })
    );
    logAudit('UPDATE_VISIT_PURPOSE', 'Master Data', `Edit Tujuan Kunjungan: ${purposeData.name || id}`);
  };

  const deleteVisitPurpose = (id: string) => {
    const target = purposesList.find((p) => p.id === id);
    setPurposesList((prev) => prev.filter((p) => p.id !== id));
    supabaseDelete(SUPABASE_TABLES.VISIT_PURPOSES, id);
    logAudit('DELETE_VISIT_PURPOSE', 'Master Data', `Hapus Tujuan Kunjungan: ${target?.name || id}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          supabaseUpsert(SUPABASE_TABLES.NOTIFICATIONS, mappers.notificationToDb(updated));
          return updated;
        }
        return n;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchUserRole,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        loginPolicy,
        updateLoginPolicy,
        lockoutTimeLeft,
        visitors,
        checkInVisitor,
        checkOutVisitor,
        deleteVisitor,
        dailyReports,
        addDailyReport,
        deleteDailyReport,
        patrolLogs,
        addPatrolLog,
        deletePatrolLog,
        incidents,
        addIncident,
        updateIncidentStatus,
        deleteIncident,
        lostAndFound,
        addLostFound,
        claimLostFound,
        deleteLostFound,
        barangTitipan,
        addBarangTitipan,
        claimBarangTitipan,
        deleteBarangTitipan,
        vehiclesLog,
        addVehicleLog,
        returnVehicle,
        deleteVehicleLog,
        clearAllVisitors,
        clearAllDailyReports,
        clearAllPatrolLogs,
        clearAllIncidents,
        clearAllLostFound,
        clearAllBarangTitipan,
        clearAllVehiclesLog,
        clearAllTransactionData,
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
        notifications,
        markNotificationRead,
        auditLogs,
        logAudit,
        deleteAuditLog,
        clearAllAuditLogs,

        // Supabase Status & Handlers
        isSupabaseOnline,
        supabaseLatency,
        lastSupabaseSync,
        isSyncing,
        testConnection,
        syncLocalToCloud,
        pullCloudToLocal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
