import {
  supabase,
  SUPABASE_TABLES,
  SUPABASE_PROJECT_ID,
  SUPABASE_PROJECT_NAME,
  SUPABASE_URL,
} from '../lib/supabase';
import {
  User,
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

// ==========================================
// MAPPERS: TypeScript CamelCase <-> DB SnakeCase
// ==========================================

export const mappers = {
  userToDb: (u: User) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    avatar: u.avatar || null,
    email: u.email || null,
    phone: u.phone || null,
    unit: u.unit || null,
    password: u.password || null,
    pin: u.pin || null,
    status: u.status,
    last_login: u.lastLogin || null,
  }),
  userFromDb: (r: any): User => ({
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role,
    avatar: r.avatar,
    email: r.email,
    phone: r.phone,
    unit: r.unit,
    password: r.password,
    pin: r.pin,
    status: r.status || 'Aktif',
    lastLogin: r.last_login || r.lastLogin,
  }),

  staffToDb: (s: SecurityStaff) => ({
    id: s.id,
    nip: s.nip,
    name: s.name,
    phone: s.phone,
    role: s.role,
    shift_default: s.shiftDefault,
    status: s.status,
  }),
  staffFromDb: (r: any): SecurityStaff => ({
    id: r.id,
    nip: r.nip,
    name: r.name,
    phone: r.phone,
    role: r.role,
    shiftDefault: r.shift_default || r.shiftDefault || 'Pagi',
    status: r.status || 'Aktif',
  }),

  unitToDb: (u: MasterUnit) => ({
    id: u.id,
    code: u.code,
    name: u.name,
    head_name: u.headName || null,
    location: u.location || null,
  }),
  unitFromDb: (r: any): MasterUnit => ({
    id: r.id,
    code: r.code,
    name: r.name,
    headName: r.head_name || r.headName,
    location: r.location,
  }),

  gedungToDb: (g: MasterGedung) => ({
    id: g.id,
    code: g.code,
    name: g.name,
    floors: g.floors,
    description: g.description || null,
  }),
  gedungFromDb: (r: any): MasterGedung => ({
    id: r.id,
    code: r.code,
    name: r.name,
    floors: Number(r.floors) || 1,
    description: r.description,
  }),

  patrolLocationToDb: (p: PatrolLocation) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    gedung_id: p.gedungId || null,
    floor: p.floor,
    qr_code: p.qrCode,
    description: p.description || null,
    target_times_per_shift: p.targetTimesPerShift || 3,
  }),
  patrolLocationFromDb: (r: any): PatrolLocation => ({
    id: r.id,
    code: r.code,
    name: r.name,
    gedungId: r.gedung_id || r.gedungId || '',
    floor: r.floor || 'Lantai 1',
    qrCode: r.qr_code || r.qrCode || '',
    description: r.description || '',
    targetTimesPerShift: Number(r.target_times_per_shift || r.targetTimesPerShift) || 3,
  }),

  vehicleToDb: (v: MasterVehicle) => ({
    id: v.id,
    plate_number: v.plateNumber,
    name: v.name,
    type: v.type,
    capacity: v.capacity,
    status: v.status,
  }),
  vehicleFromDb: (r: any): MasterVehicle => ({
    id: r.id,
    plateNumber: r.plate_number || r.plateNumber,
    name: r.name,
    type: r.type,
    capacity: Number(r.capacity) || 4,
    status: r.status,
  }),

  incidentCategoryToDb: (c: IncidentCategory) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    default_priority: c.defaultPriority,
  }),
  incidentCategoryFromDb: (r: any): IncidentCategory => ({
    id: r.id,
    code: r.code,
    name: r.name,
    defaultPriority: r.default_priority || r.defaultPriority || 'Medium',
  }),

  visitPurposeToDb: (p: VisitPurpose) => ({
    id: p.id,
    name: p.name,
    description: p.description || null,
  }),
  visitPurposeFromDb: (r: any): VisitPurpose => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }),

  visitorToDb: (v: Visitor) => ({
    id: v.id,
    visitor_number: v.visitorNumber,
    date: v.date,
    time_in: v.timeIn,
    time_out: v.timeOut || null,
    name: v.name,
    category: v.category,
    phone: v.phone,
    email: v.email || null,
    destination_unit: v.destinationUnit,
    host_person: v.hostPerson,
    purpose: v.purpose,
    photo_url: v.photoUrl || null,
    ktp_photo_url: v.ktpPhotoUrl || null,
    visitor_card_number: v.visitorCardNumber,
    receiver_security: v.receiverSecurity,
    checkout_security: v.checkoutSecurity || null,
    status: v.status,
    duration_minutes: v.durationMinutes || 0,
    is_overdue_alert: Boolean(v.isOverdueAlert),
  }),
  visitorFromDb: (r: any): Visitor => ({
    id: r.id,
    visitorNumber: r.visitor_number || r.visitorNumber,
    date: r.date,
    timeIn: r.time_in || r.timeIn,
    timeOut: r.time_out || r.timeOut,
    name: r.name,
    category: r.category,
    phone: r.phone,
    email: r.email,
    destinationUnit: r.destination_unit || r.destinationUnit,
    hostPerson: r.host_person || r.hostPerson,
    purpose: r.purpose,
    photoUrl: r.photo_url || r.photoUrl,
    ktpPhotoUrl: r.ktp_photo_url || r.ktpPhotoUrl,
    visitorCardNumber: r.visitor_card_number || r.visitorCardNumber,
    receiverSecurity: r.receiver_security || r.receiverSecurity,
    checkoutSecurity: r.checkout_security || r.checkoutSecurity,
    status: r.status,
    durationMinutes: Number(r.duration_minutes || r.durationMinutes) || 0,
    isOverdueAlert: Boolean(r.is_overdue_alert || r.isOverdueAlert),
  }),

  dailyReportToDb: (d: DailyReport) => ({
    id: d.id,
    timestamp: d.timestamp,
    date: d.date,
    shift: d.shift,
    officers: d.officers || [],
    weather: d.weather,
    general_situation: d.generalSituation,
    checklist: d.checklist || {},
    notes: d.notes,
    photos: d.photos || [],
    handover_status: d.handoverStatus || {},
  }),
  dailyReportFromDb: (r: any): DailyReport => ({
    id: r.id,
    timestamp: r.timestamp,
    date: r.date,
    shift: r.shift,
    officers: Array.isArray(r.officers) ? r.officers : [],
    weather: r.weather || 'Cerah',
    generalSituation: r.general_situation || r.generalSituation || '',
    checklist: r.checklist || {
      gerbang: true,
      gedung: true,
      cctv: true,
      pagar: true,
      lampu: true,
      apar: true,
      parkir: true,
      posSecurity: true,
    },
    notes: r.notes || '',
    photos: Array.isArray(r.photos) ? r.photos : [],
    handoverStatus: r.handover_status || r.handoverStatus || {
      dayCommander: '',
      nightChief: '',
      isSigned: false,
    },
  }),

  patrolLogToDb: (p: PatrolLog) => ({
    id: p.id,
    location_id: p.locationId,
    location_name: p.locationName,
    gedung_name: p.gedungName,
    timestamp: p.timestamp,
    date: p.date,
    time: p.time,
    officer_name: p.officerName,
    latitude: p.latitude,
    longitude: p.longitude,
    photo_url: p.photoUrl || null,
    notes: p.notes || null,
    status: p.status,
    qr_code_scanned: p.qrCodeScanned,
  }),
  patrolLogFromDb: (r: any): PatrolLog => ({
    id: r.id,
    locationId: r.location_id || r.locationId,
    locationName: r.location_name || r.locationName,
    gedungName: r.gedung_name || r.gedungName,
    timestamp: r.timestamp,
    date: r.date,
    time: r.time,
    officerName: r.officer_name || r.officerName,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    photoUrl: r.photo_url || r.photoUrl,
    notes: r.notes,
    status: r.status,
    qrCodeScanned: r.qr_code_scanned || r.qrCodeScanned,
  }),

  incidentToDb: (i: IncidentReport) => ({
    id: i.id,
    incident_number: i.incidentNumber,
    category: i.category,
    location: i.location,
    date: i.date,
    time: i.time,
    officer_name: i.officerName,
    chronology: i.chronology,
    photo_url: i.photoUrl || null,
    video_url: i.videoUrl || null,
    status: i.status,
    priority: i.priority,
    action_taken: i.actionTaken || null,
  }),
  incidentFromDb: (r: any): IncidentReport => ({
    id: r.id,
    incidentNumber: r.incident_number || r.incidentNumber,
    category: r.category,
    location: r.location,
    date: r.date,
    time: r.time,
    officerName: r.officer_name || r.officerName,
    chronology: r.chronology,
    photoUrl: r.photo_url || r.photoUrl,
    videoUrl: r.video_url || r.videoUrl,
    status: r.status,
    priority: r.priority,
    actionTaken: r.action_taken || r.actionTaken,
  }),

  lostAndFoundToDb: (l: LostAndFound) => ({
    id: l.id,
    item_name: l.itemName,
    date_found: l.dateFound,
    location: l.location,
    photo_url: l.photoUrl || null,
    found_by: l.foundBy,
    status: l.status,
    claimed_by: l.claimedBy || null,
    claimed_phone: l.claimedPhone || null,
    claim_date: l.claimDate || null,
    notes: l.notes || null,
  }),
  lostAndFoundFromDb: (r: any): LostAndFound => ({
    id: r.id,
    itemName: r.item_name || r.itemName,
    dateFound: r.date_found || r.dateFound,
    location: r.location,
    photoUrl: r.photo_url || r.photoUrl,
    foundBy: r.found_by || r.foundBy,
    status: r.status,
    claimedBy: r.claimed_by || r.claimedBy,
    claimedPhone: r.claimed_phone || r.claimedPhone,
    claimDate: r.claim_date || r.claimDate,
    notes: r.notes,
  }),

  barangTitipanToDb: (b: BarangTitipan) => ({
    id: b.id,
    owner_name: b.ownerName,
    phone: b.phone,
    item_description: b.itemDescription,
    photo_url: b.photoUrl || null,
    time_in: b.timeIn,
    date_in: b.dateIn,
    time_out: b.timeOut || null,
    date_out: b.dateOut || null,
    digital_signature: b.digitalSignature || null,
    receiver_security: b.receiverSecurity,
    status: b.status,
  }),
  barangTitipanFromDb: (r: any): BarangTitipan => ({
    id: r.id,
    ownerName: r.owner_name || r.ownerName,
    phone: r.phone,
    itemDescription: r.item_description || r.itemDescription,
    photoUrl: r.photo_url || r.photoUrl,
    timeIn: r.time_in || r.timeIn,
    dateIn: r.date_in || r.dateIn,
    timeOut: r.time_out || r.timeOut,
    dateOut: r.date_out || r.dateOut,
    digitalSignature: r.digital_signature || r.digitalSignature,
    receiverSecurity: r.receiver_security || r.receiverSecurity,
    status: r.status,
  }),

  vehicleLogToDb: (v: SchoolVehicleLog) => ({
    id: v.id,
    vehicle_name: v.vehicleName,
    plate_number: v.plateNumber,
    driver_name: v.driverName,
    destination: v.destination,
    date_out: v.dateOut,
    time_out: v.timeOut,
    time_in: v.timeIn || null,
    status: v.status,
    purpose: v.purpose,
    notes: v.notes || null,
  }),
  vehicleLogFromDb: (r: any): SchoolVehicleLog => ({
    id: r.id,
    vehicleName: r.vehicle_name || r.vehicleName,
    plateNumber: r.plate_number || r.plateNumber,
    driverName: r.driver_name || r.driverName,
    destination: r.destination,
    dateOut: r.date_out || r.dateOut,
    timeOut: r.time_out || r.timeOut,
    timeIn: r.time_in || r.timeIn,
    status: r.status,
    purpose: r.purpose,
    notes: r.notes,
  }),

  notificationToDb: (n: SystemNotification) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.timestamp,
    read: n.read,
    link_module: n.linkModule || null,
  }),
  notificationFromDb: (r: any): SystemNotification => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    timestamp: r.timestamp,
    read: Boolean(r.read),
    linkModule: r.link_module || r.linkModule,
  }),

  auditLogToDb: (a: AuditLog) => ({
    id: a.id,
    timestamp: a.timestamp,
    user_name: a.userName,
    user_role: a.userRole,
    action: a.action,
    module: a.module,
    details: a.details,
  }),
  auditLogFromDb: (r: any): AuditLog => ({
    id: r.id,
    timestamp: r.timestamp,
    userName: r.user_name || r.userName,
    userRole: r.user_role || r.userRole,
    action: r.action,
    module: r.module,
    details: r.details,
  }),

  loginPolicyToDb: (p: LoginPolicy) => ({
    id: 'default',
    max_failed_attempts: p.maxFailedAttempts,
    lockout_duration_seconds: p.lockoutDurationSeconds,
    session_timeout_minutes: p.sessionTimeoutMinutes,
    require_pin_for_security: p.requirePinForSecurity,
    password_min_length: p.passwordMinLength,
  }),
  loginPolicyFromDb: (r: any): LoginPolicy => ({
    maxFailedAttempts: Number(r.max_failed_attempts) || 3,
    lockoutDurationSeconds: Number(r.lockout_duration_seconds) || 30,
    sessionTimeoutMinutes: Number(r.session_timeout_minutes) || 60,
    requirePinForSecurity: r.require_pin_for_security !== false,
    passwordMinLength: Number(r.password_min_length) || 6,
  }),
};

// Generic Supabase CRUD operations with safe non-blocking error returns
export async function supabaseUpsert(table: string, data: any): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.from(table).upsert(data);
    if (error) {
      console.warn(`[Supabase upsert ${table}] Error:`, error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase upsert ${table}] Exception:`, err?.message);
    return { success: false, error: err };
  }
}

export async function supabaseDelete(table: string, id: string): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase delete ${table}] Error:`, error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase delete ${table}] Exception:`, err?.message);
    return { success: false, error: err };
  }
}

export async function supabaseClearTable(table: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Delete all records where id is not empty
    const { error } = await supabase.from(table).delete().neq('id', '___NEVER_MATCH___');
    if (error) {
      console.warn(`[Supabase clear ${table}] Error:`, error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`[Supabase clear ${table}] Exception:`, err?.message);
    return { success: false, error: err };
  }
}

// Fetch all records from a Supabase table with mapping
export async function supabaseFetchAll<T>(table: string, mapper: (row: any) => T): Promise<{ success: boolean; data?: T[]; error?: any }> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      return { success: false, error };
    }
    if (data) {
      return { success: true, data: data.map(mapper) };
    }
    return { success: true, data: [] };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

// Bulk Sync: Push all current local application state into Supabase
export async function pushAllLocalToSupabase(state: {
  usersList: User[];
  staffList: SecurityStaff[];
  unitsList: MasterUnit[];
  gedungList: MasterGedung[];
  patrolLocations: PatrolLocation[];
  vehiclesList: MasterVehicle[];
  incidentCategories: IncidentCategory[];
  purposesList: VisitPurpose[];
  visitors: Visitor[];
  dailyReports: DailyReport[];
  patrolLogs: PatrolLog[];
  incidents: IncidentReport[];
  lostAndFound: LostAndFound[];
  barangTitipan: BarangTitipan[];
  vehiclesLog: SchoolVehicleLog[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  loginPolicy: LoginPolicy;
}): Promise<{ success: boolean; message: string; results: Record<string, { count: number; success: boolean; error?: string }> }> {
  const results: Record<string, { count: number; success: boolean; error?: string }> = {};

  const pushTask = async (name: string, table: string, data: any[]) => {
    if (!data || data.length === 0) {
      results[name] = { count: 0, success: true };
      return;
    }
    try {
      const { error } = await supabase.from(table).upsert(data);
      if (error) {
        results[name] = { count: data.length, success: false, error: error.message };
      } else {
        results[name] = { count: data.length, success: true };
      }
    } catch (e: any) {
      results[name] = { count: data.length, success: false, error: e?.message };
    }
  };

  await pushTask('Users', SUPABASE_TABLES.USERS, state.usersList.map(mappers.userToDb));
  await pushTask('Staff Security', SUPABASE_TABLES.STAFF, state.staffList.map(mappers.staffToDb));
  await pushTask('Master Unit', SUPABASE_TABLES.UNITS, state.unitsList.map(mappers.unitToDb));
  await pushTask('Master Gedung', SUPABASE_TABLES.GEDUNG, state.gedungList.map(mappers.gedungToDb));
  await pushTask('Lokasi Patroli', SUPABASE_TABLES.PATROL_LOCATIONS, state.patrolLocations.map(mappers.patrolLocationToDb));
  await pushTask('Armada Kendaraan', SUPABASE_TABLES.VEHICLES, state.vehiclesList.map(mappers.vehicleToDb));
  await pushTask('Kategori Insiden', SUPABASE_TABLES.INCIDENT_CATEGORIES, state.incidentCategories.map(mappers.incidentCategoryToDb));
  await pushTask('Tujuan Kunjungan', SUPABASE_TABLES.VISIT_PURPOSES, state.purposesList.map(mappers.visitPurposeToDb));
  await pushTask('Buku Tamu / Visitors', SUPABASE_TABLES.VISITORS, state.visitors.map(mappers.visitorToDb));
  await pushTask('Daily Reports', SUPABASE_TABLES.DAILY_REPORTS, state.dailyReports.map(mappers.dailyReportToDb));
  await pushTask('Patrol Logs', SUPABASE_TABLES.PATROL_LOGS, state.patrolLogs.map(mappers.patrolLogToDb));
  await pushTask('Incident Reports', SUPABASE_TABLES.INCIDENTS, state.incidents.map(mappers.incidentToDb));
  await pushTask('Lost and Found', SUPABASE_TABLES.LOST_AND_FOUND, state.lostAndFound.map(mappers.lostAndFoundToDb));
  await pushTask('Barang Titipan', SUPABASE_TABLES.BARANG_TITIPAN, state.barangTitipan.map(mappers.barangTitipanToDb));
  await pushTask('Log Kendaraan', SUPABASE_TABLES.VEHICLE_LOGS, state.vehiclesLog.map(mappers.vehicleLogToDb));
  await pushTask('Notifications', SUPABASE_TABLES.NOTIFICATIONS, state.notifications.map(mappers.notificationToDb));
  await pushTask('Audit Logs', SUPABASE_TABLES.AUDIT_LOGS, state.auditLogs.map(mappers.auditLogToDb));
  await pushTask('Login Policy', SUPABASE_TABLES.LOGIN_POLICY, [mappers.loginPolicyToDb(state.loginPolicy)]);

  const failed = Object.entries(results).filter(([_, r]) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      message: `Sinkronisasi sebagian selesai. ${failed.length} tabel mengalami kendala (Pastikan tabel sudah dibuat di Supabase SQL Editor).`,
      results,
    };
  }

  return {
    success: true,
    message: 'Seluruh data berhasil disinkronkan ke Supabase Cloud!',
    results,
  };
}

// Bulk Sync: Pull all data from Supabase into local application state
export async function pullAllFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: Partial<{
    usersList: User[];
    staffList: SecurityStaff[];
    unitsList: MasterUnit[];
    gedungList: MasterGedung[];
    patrolLocations: PatrolLocation[];
    vehiclesList: MasterVehicle[];
    incidentCategories: IncidentCategory[];
    purposesList: VisitPurpose[];
    visitors: Visitor[];
    dailyReports: DailyReport[];
    patrolLogs: PatrolLog[];
    incidents: IncidentReport[];
    lostAndFound: LostAndFound[];
    barangTitipan: BarangTitipan[];
    vehiclesLog: SchoolVehicleLog[];
    notifications: SystemNotification[];
    auditLogs: AuditLog[];
    loginPolicy: LoginPolicy;
  }>;
  errors?: Record<string, string>;
}> {
  const resultData: any = {};
  const errors: Record<string, string> = {};

  const pullTask = async (key: string, table: string, mapper: (row: any) => any) => {
    const res = await supabaseFetchAll(table, mapper);
    if (res.success && res.data && res.data.length > 0) {
      resultData[key] = res.data;
    } else if (!res.success && res.error) {
      errors[key] = res.error.message;
    }
  };

  await Promise.all([
    pullTask('usersList', SUPABASE_TABLES.USERS, mappers.userFromDb),
    pullTask('staffList', SUPABASE_TABLES.STAFF, mappers.staffFromDb),
    pullTask('unitsList', SUPABASE_TABLES.UNITS, mappers.unitFromDb),
    pullTask('gedungList', SUPABASE_TABLES.GEDUNG, mappers.gedungFromDb),
    pullTask('patrolLocations', SUPABASE_TABLES.PATROL_LOCATIONS, mappers.patrolLocationFromDb),
    pullTask('vehiclesList', SUPABASE_TABLES.VEHICLES, mappers.vehicleFromDb),
    pullTask('incidentCategories', SUPABASE_TABLES.INCIDENT_CATEGORIES, mappers.incidentCategoryFromDb),
    pullTask('purposesList', SUPABASE_TABLES.VISIT_PURPOSES, mappers.visitPurposeFromDb),
    pullTask('visitors', SUPABASE_TABLES.VISITORS, mappers.visitorFromDb),
    pullTask('dailyReports', SUPABASE_TABLES.DAILY_REPORTS, mappers.dailyReportFromDb),
    pullTask('patrolLogs', SUPABASE_TABLES.PATROL_LOGS, mappers.patrolLogFromDb),
    pullTask('incidents', SUPABASE_TABLES.INCIDENTS, mappers.incidentFromDb),
    pullTask('lostAndFound', SUPABASE_TABLES.LOST_AND_FOUND, mappers.lostAndFoundFromDb),
    pullTask('barangTitipan', SUPABASE_TABLES.BARANG_TITIPAN, mappers.barangTitipanFromDb),
    pullTask('vehiclesLog', SUPABASE_TABLES.VEHICLE_LOGS, mappers.vehicleLogFromDb),
    pullTask('notifications', SUPABASE_TABLES.NOTIFICATIONS, mappers.notificationFromDb),
    pullTask('auditLogs', SUPABASE_TABLES.AUDIT_LOGS, mappers.auditLogFromDb),
  ]);

  // Handle Login Policy specifically
  try {
    const { data: policyRows } = await supabase.from(SUPABASE_TABLES.LOGIN_POLICY).select('*').limit(1);
    if (policyRows && policyRows.length > 0) {
      resultData.loginPolicy = mappers.loginPolicyFromDb(policyRows[0]);
    }
  } catch (e) {
    // Ignore if not present
  }

  const loadedKeys = Object.keys(resultData);
  if (loadedKeys.length === 0) {
    return {
      success: false,
      message: 'Tidak ada data ditemukan di Supabase cloud atau tabel belum dibuat.',
      errors,
    };
  }

  return {
    success: true,
    message: `Berhasil mengunduh data (${loadedKeys.length} modul) dari Supabase!`,
    data: resultData,
    errors,
  };
}
