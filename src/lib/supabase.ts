import { createClient } from '@supabase/supabase-js';

// Default provided Supabase credentials for LSMS
export const DEFAULT_SUPABASE_URL = 'https://idqwdkazshpftiiutjmq.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcXdka2F6c2hwZnRpaXV0am1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDI0NjcsImV4cCI6MjEwMjE3ODQ2N30.tl6rMbZYVlB69fhET_TX0BF8y3QfPs_Ck6q6GZNPALE';
export const SUPABASE_PROJECT_ID = 'idqwdkazshpftiiutjmq';
export const SUPABASE_PROJECT_NAME = 'Lazuardi Security Management System (LSMS)';

// Normalize URL in case user inputs with trailing slash or /rest/v1
export function normalizeSupabaseUrl(url: string): string {
  if (!url) return DEFAULT_SUPABASE_URL;
  let clean = url.trim();
  clean = clean.replace(/\/rest\/v1\/?$/, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

export const SUPABASE_URL = normalizeSupabaseUrl(
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL
);

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealthStatus {
  connected: boolean;
  message: string;
  projectId: string;
  url: string;
  latencyMs?: number;
  tablesFound?: string[];
  missingTables?: string[];
}

export const SUPABASE_TABLES = {
  USERS: 'lsms_users',
  STAFF: 'lsms_security_staff',
  UNITS: 'lsms_master_units',
  GEDUNG: 'lsms_master_gedung',
  PATROL_LOCATIONS: 'lsms_patrol_locations',
  VEHICLES: 'lsms_master_vehicles',
  INCIDENT_CATEGORIES: 'lsms_incident_categories',
  VISIT_PURPOSES: 'lsms_visit_purposes',
  VISITORS: 'lsms_visitors',
  DAILY_REPORTS: 'lsms_daily_reports',
  PATROL_LOGS: 'lsms_patrol_logs',
  INCIDENTS: 'lsms_incident_reports',
  LOST_AND_FOUND: 'lsms_lost_and_found',
  BARANG_TITIPAN: 'lsms_barang_titipan',
  VEHICLE_LOGS: 'lsms_school_vehicle_logs',
  NOTIFICATIONS: 'lsms_system_notifications',
  AUDIT_LOGS: 'lsms_audit_logs',
  LOGIN_POLICY: 'lsms_login_policy',
};

// SQL DDL Schema generator that the user can execute in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =====================================================================
-- LAZUARDI SECURITY MANAGEMENT SYSTEM (LSMS)
-- Database Schema for Supabase PostgreSQL
-- Project: Lazuardi Security Management System (LSMS)
-- Project ID: idqwdkazshpftiiutjmq
-- =====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS lsms_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'Supervisor Security', 'User')),
  avatar TEXT,
  email TEXT,
  phone TEXT,
  unit TEXT,
  password TEXT,
  pin TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
  last_login TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Staff Table
CREATE TABLE IF NOT EXISTS lsms_security_staff (
  id TEXT PRIMARY KEY,
  nip TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Komandan Regu', 'Anggota', 'Supervisor')),
  shift_default TEXT NOT NULL DEFAULT 'Pagi' CHECK (shift_default IN ('Pagi', 'Siang', 'Malam')),
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Units Table
CREATE TABLE IF NOT EXISTS lsms_master_units (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  head_name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Master Gedung Table
CREATE TABLE IF NOT EXISTS lsms_master_gedung (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  floors INT NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Patrol Locations Table
CREATE TABLE IF NOT EXISTS lsms_patrol_locations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  gedung_id TEXT,
  floor TEXT,
  qr_code TEXT NOT NULL,
  description TEXT,
  target_times_per_shift INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Master Vehicles Table
CREATE TABLE IF NOT EXISTS lsms_master_vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity INT DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Tersedia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Incident Categories Table
CREATE TABLE IF NOT EXISTS lsms_incident_categories (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  default_priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Visit Purposes Table
CREATE TABLE IF NOT EXISTS lsms_visit_purposes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Visitors (Buku Tamu) Table
CREATE TABLE IF NOT EXISTS lsms_visitors (
  id TEXT PRIMARY KEY,
  visitor_number TEXT NOT NULL,
  date TEXT NOT NULL,
  time_in TEXT NOT NULL,
  time_out TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  destination_unit TEXT NOT NULL,
  host_person TEXT NOT NULL,
  purpose TEXT NOT NULL,
  photo_url TEXT,
  ktp_photo_url TEXT,
  visitor_card_number TEXT NOT NULL,
  receiver_security TEXT NOT NULL,
  checkout_security TEXT,
  status TEXT NOT NULL DEFAULT 'Masih di Sekolah',
  duration_minutes INT DEFAULT 0,
  is_overdue_alert BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Daily Reports Table
CREATE TABLE IF NOT EXISTS lsms_daily_reports (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  shift TEXT NOT NULL,
  officers JSONB DEFAULT '[]'::jsonb,
  weather TEXT DEFAULT 'Cerah',
  general_situation TEXT,
  checklist JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  handover_status JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Patrol Logs Table
CREATE TABLE IF NOT EXISTS lsms_patrol_logs (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  gedung_name TEXT,
  timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  photo_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Aman',
  qr_code_scanned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Incident Reports Table
CREATE TABLE IF NOT EXISTS lsms_incident_reports (
  id TEXT PRIMARY KEY,
  incident_number TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  chronology TEXT NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Lost and Found Table
CREATE TABLE IF NOT EXISTS lsms_lost_and_found (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  date_found TEXT NOT NULL,
  location TEXT NOT NULL,
  photo_url TEXT,
  found_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Belum Diambil',
  claimed_by TEXT,
  claimed_phone TEXT,
  claim_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Barang Titipan Table
CREATE TABLE IF NOT EXISTS lsms_barang_titipan (
  id TEXT PRIMARY KEY,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  item_description TEXT NOT NULL,
  photo_url TEXT,
  time_in TEXT NOT NULL,
  date_in TEXT NOT NULL,
  time_out TEXT,
  date_out TEXT,
  digital_signature TEXT,
  receiver_security TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Dititipkan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. School Vehicle Logs Table
CREATE TABLE IF NOT EXISTS lsms_school_vehicle_logs (
  id TEXT PRIMARY KEY,
  vehicle_name TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  date_out TEXT NOT NULL,
  time_out TEXT NOT NULL,
  time_in TEXT,
  status TEXT NOT NULL DEFAULT 'Masih Keluar',
  purpose TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. System Notifications Table
CREATE TABLE IF NOT EXISTS lsms_system_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link_module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS lsms_audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Login Policy Table
CREATE TABLE IF NOT EXISTS lsms_login_policy (
  id TEXT PRIMARY KEY DEFAULT 'default',
  max_failed_attempts INT DEFAULT 3,
  lockout_duration_seconds INT DEFAULT 30,
  session_timeout_minutes INT DEFAULT 60,
  require_pin_for_security BOOLEAN DEFAULT true,
  password_min_length INT DEFAULT 6,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Allow public anon access for LSMS app
ALTER TABLE lsms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_security_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_master_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_master_gedung ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_patrol_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_master_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_incident_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_visit_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_patrol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_lost_and_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_barang_titipan ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_school_vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsms_login_policy ENABLE ROW LEVEL SECURITY;

-- Anonymous CRUD policies for all LSMS tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'lsms_users', 'lsms_security_staff', 'lsms_master_units', 'lsms_master_gedung',
            'lsms_patrol_locations', 'lsms_master_vehicles', 'lsms_incident_categories',
            'lsms_visit_purposes', 'lsms_visitors', 'lsms_daily_reports', 'lsms_patrol_logs',
            'lsms_incident_reports', 'lsms_lost_and_found', 'lsms_barang_titipan',
            'lsms_school_vehicle_logs', 'lsms_system_notifications', 'lsms_audit_logs', 'lsms_login_policy'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow anon all on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
`;

// Test Supabase connectivity
export async function testSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  try {
    // Attempt a quick lightweight query on any table or schema check
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet (code 42P01 in PG or PGRST204/PGRST200 in PostgREST), Supabase itself is responding!
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('relation') ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST116' ||
        error.code === 'PGRST200'
      ) {
        return {
          connected: true,
          message: 'Terhubung ke Supabase! Tabel belum dibuat. Jalankan SQL Schema di Supabase SQL Editor.',
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          latencyMs,
          missingTables: Object.values(SUPABASE_TABLES),
        };
      }

      return {
        connected: false,
        message: `Koneksi Supabase gagal: ${error.message || error.code || 'Unknown error'}`,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        latencyMs,
      };
    }

    return {
      connected: true,
      message: `Terhubung sempurna ke Supabase Cloud (${latencyMs}ms)`,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      tablesFound: [SUPABASE_TABLES.USERS],
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Error koneksi: ${err?.message || 'Gagal menjangkau server Supabase'}`,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs: Date.now() - startTime,
    };
  }
}
