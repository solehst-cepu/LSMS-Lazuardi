/**
 * Resilient Multi-Tier Storage Engine for LSMS:
 * Tier 1: Memory & State (instant reactivity)
 * Tier 2: IndexedDB (Virtually unlimited storage for photos, logs, transactions)
 * Tier 3: LocalStorage (Synchronous bootstrap cache with automatic quota-safe compression)
 */

const DB_NAME = 'lsms_database';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

let idbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (!idbPromise) {
    idbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return idbPromise;
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Gracefully handle idb errors
  }
}

export async function idbGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && req.result !== null) {
          resolve(req.result);
        } else {
          resolve(fallback);
        }
      };
      req.onerror = () => resolve(fallback);
    });
  } catch {
    return fallback;
  }
}

/**
 * Strip heavy base64 strings if localStorage quota is exceeded,
 * so localStorage contains compact metadata while IndexedDB and Supabase hold full high-res data.
 */
function createQuotaSafeValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === 'object') {
        const clone = { ...item };
        // If there are giant base64 fields, truncate or replace for localStorage cache
        for (const k of Object.keys(clone)) {
          if (typeof clone[k] === 'string' && clone[k].startsWith('data:image/') && clone[k].length > 5000) {
            clone[k] = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
          }
        }
        return clone;
      }
      return item;
    });
  }
  return value;
}

export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = localStorage.getItem(`lsms_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSetLocalStorage<T>(key: string, value: T): void {
  // Always asynchronously persist the full uncompromised state to IndexedDB
  idbSet(`lsms_${key}`, value);

  if (typeof window === 'undefined' || !window.localStorage) return;

  const storageKey = `lsms_${key}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (e: any) {
    // Quota exceeded: apply safe degradation for localStorage bootstrap cache
    try {
      const quotaSafe = createQuotaSafeValue(value);
      localStorage.setItem(storageKey, JSON.stringify(quotaSafe));
    } catch (e2) {
      // If still full, remove non-essential cache keys or ignore without throwing
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  }
}
