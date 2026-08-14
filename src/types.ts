export type UserRole = 'Administrator' | 'Supervisor Security' | 'User';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  unit?: string;
  password?: string;
  pin?: string;
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
}

export interface LoginPolicy {
  maxFailedAttempts: number;
  lockoutDurationSeconds: number;
  sessionTimeoutMinutes: number;
  requirePinForSecurity: boolean;
  passwordMinLength: number;
}

export interface SecurityStaff {
  id: string;
  nip: string;
  name: string;
  phone: string;
  role: 'Komandan Regu' | 'Anggota' | 'Supervisor';
  shiftDefault: 'Pagi' | 'Siang' | 'Malam';
  status: 'Aktif' | 'Nonaktif';
}

export interface MasterUnit {
  id: string;
  code: string;
  name: string;
  headName?: string;
  location?: string;
}

export interface MasterGedung {
  id: string;
  code: string;
  name: string;
  floors: number;
  description?: string;
}

export interface PatrolLocation {
  id: string;
  code: string;
  name: string;
  gedungId: string;
  floor: string;
  qrCode: string;
  description: string;
  targetTimesPerShift: number;
}

export interface MasterVehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: 'Mobil Operasional' | 'Bus Sekolah' | 'Motor Patroli';
  capacity: number;
  status: 'Tersedia' | 'Digunakan' | 'Perbaikan';
}

export interface IncidentCategory {
  id: string;
  code: string;
  name: string;
  defaultPriority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface VisitPurpose {
  id: string;
  name: string;
  description?: string;
}

export type VisitorStatus = 'Masih di Sekolah' | 'Sudah Keluar';

export interface Visitor {
  id: string;
  visitorNumber: string; // Auto format: VST-20260803-001
  date: string;
  timeIn: string;
  timeOut?: string;
  name: string;
  category: 'Dinas' | 'Informasi Sekolah' | 'Sales' | 'Vendor' | 'Lainnya';
  phone: string;
  email?: string;
  destinationUnit: string; // Informasi, Unit TK, SD, SMP, Support, HRD, Litbang, Direktorat, dll
  hostPerson: string;
  purpose: string;
  photoUrl?: string;
  ktpPhotoUrl?: string;
  visitorCardNumber: string;
  receiverSecurity: string;
  checkoutSecurity?: string;
  status: VisitorStatus;
  durationMinutes?: number;
  isOverdueAlert?: boolean; // > 4 hours
}

export interface DailyReportChecklist {
  gerbang: boolean;
  gedung: boolean;
  cctv: boolean;
  pagar: boolean;
  lampu: boolean;
  apar: boolean;
  parkir: boolean;
  posSecurity: boolean;
}

export interface DailyReport {
  id: string;
  timestamp: string;
  date: string;
  shift: 'Siang' | 'Malam';
  officers: string[]; // List of security staff present
  weather: 'Cerah' | 'Hujan' | 'Berawan' | 'Mendung';
  generalSituation: string;
  checklist: DailyReportChecklist;
  notes: string;
  photos: string[];
  handoverStatus: {
    dayCommander: string;
    nightChief: string;
    isSigned: boolean;
    handoverNotes?: string;
  };
}

export interface PatrolLog {
  id: string;
  locationId: string;
  locationName: string;
  gedungName: string;
  timestamp: string;
  date: string;
  time: string;
  officerName: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  notes?: string;
  status: 'Aman' | 'Ada Temuan';
  qrCodeScanned: string;
}

export type IncidentStatus = 'Open' | 'Progress' | 'Closed';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IncidentReport {
  id: string;
  incidentNumber: string;
  category: 'Kecelakaan' | 'Tabrakan' | 'Pertengkaran' | 'Tanpa Izin' | 'Kehilangan' | 'Lainnya';
  location: string;
  date: string;
  time: string;
  officerName: string;
  chronology: string;
  photoUrl?: string;
  videoUrl?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  actionTaken?: string;
}

export interface LostAndFound {
  id: string;
  itemName: string;
  dateFound: string;
  location: string;
  photoUrl?: string;
  foundBy: string;
  status: 'Belum Diambil' | 'Sudah Diambil';
  claimedBy?: string;
  claimedPhone?: string;
  claimDate?: string;
  notes?: string;
}

export interface BarangTitipan {
  id: string;
  ownerName: string;
  phone: string;
  itemDescription: string;
  photoUrl?: string;
  timeIn: string;
  dateIn: string;
  timeOut?: string;
  dateOut?: string;
  digitalSignature?: string; // base64 data URI
  receiverSecurity: string;
  status: 'Dititipkan' | 'Sudah Diambil';
}

export interface SchoolVehicleLog {
  id: string;
  vehicleName: string; // e.g., Toyota HiAce (B 1234 LZ)
  plateNumber: string;
  driverName: string;
  destination: string;
  dateOut: string;
  timeOut: string;
  timeIn?: string;
  status: 'Masih Keluar' | 'Sudah Kembali';
  purpose: string;
  notes?: string;
}

export interface SystemNotification {
  id: string;
  type: 'visitor_overdue' | 'patrol_late' | 'incident_critical' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkModule?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
}
