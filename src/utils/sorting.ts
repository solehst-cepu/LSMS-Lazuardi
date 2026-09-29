/**
 * Sorting utility to ensure reports and input result lists are always displayed 
 * at the first order (newest / most recent first).
 */

export function parseFlexibleDate(dateStr?: string, timeStr?: string): number {
  if (!dateStr) return 0;
  const str = String(dateStr).trim();
  if (!str) return 0;

  // 1. Direct standard parse (ISO: "2026-09-28T15:00:00" or "2026-09-28 15:00:00")
  if (!str.includes('/') && (str.includes('-') || str.includes('T'))) {
    const direct = Date.parse(str);
    if (!isNaN(direct) && direct > 0) {
      return direct;
    }
  }

  // 2. YYYY-MM-DD with optional time
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    let hour = 0;
    let min = 0;
    let sec = 0;

    const timeInStr = str.match(/(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?/);
    if (timeInStr && str.length > 10) {
      hour = parseInt(timeInStr[1], 10);
      min = parseInt(timeInStr[2], 10);
      sec = timeInStr[3] ? parseInt(timeInStr[3], 10) : 0;
    } else if (timeStr) {
      const tMatch = String(timeStr).match(/(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?/);
      if (tMatch) {
        hour = parseInt(tMatch[1], 10);
        min = parseInt(tMatch[2], 10);
        sec = tMatch[3] ? parseInt(tMatch[3], 10) : 0;
      }
    }
    return new Date(year, month, day, hour, min, sec).getTime();
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY (Indonesian / European format, e.g. "29/09/2026, 07.44.00")
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    let hour = 0;
    let min = 0;
    let sec = 0;

    const timeInStr = str.match(/(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?/);
    if (timeInStr) {
      hour = parseInt(timeInStr[1], 10);
      min = parseInt(timeInStr[2], 10);
      sec = timeInStr[3] ? parseInt(timeInStr[3], 10) : 0;
    } else if (timeStr) {
      const tMatch = String(timeStr).match(/(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?/);
      if (tMatch) {
        hour = parseInt(tMatch[1], 10);
        min = parseInt(tMatch[2], 10);
        sec = tMatch[3] ? parseInt(tMatch[3], 10) : 0;
      }
    }
    return new Date(year, month, day, hour, min, sec).getTime();
  }

  return 0;
}

export function getItemTimestampScore(item: Record<string, any>): number {
  if (!item || typeof item !== 'object') return 0;

  // A. Check explicit timestamp / createdAt
  const rawTs = item.timestamp || item.createdAt || item.created_at;
  if (rawTs) {
    const parsed = parseFlexibleDate(String(rawTs));
    if (parsed > 0) return parsed;
  }

  // B. Check date + time combinations
  const dateStr = item.date || item.dateFound || item.dateIn || item.dateOut || item.claimDate;
  const timeStr = item.time || item.timeIn || item.timeOut;
  if (dateStr) {
    const parsed = parseFlexibleDate(String(dateStr), timeStr ? String(timeStr) : undefined);
    if (parsed > 0) return parsed;
  }

  // C. Check ID for embedded Date.now() timestamp (13 digits starting with 1...)
  const idStr = String(item.id || item.visitorNumber || item.incidentNumber || '');
  const idMatch = idStr.match(/(1\d{12})/);
  if (idMatch) {
    const val = Number(idMatch[1]);
    if (!isNaN(val) && val > 1600000000000) {
      return val;
    }
  }

  // D. Check for YYYYMMDD in number/ID (e.g. VST-20260803-004 or INC-20260803-02)
  const ymdMatch = idStr.match(/(\d{4})(\d{2})(\d{2})-(\d+)/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    const seq = parseInt(ymdMatch[4], 10);
    return new Date(y, m, d, 0, 0, 0, seq).getTime();
  }

  return 0;
}

export function sortNewestFirst<T extends Record<string, any>>(items: T[]): T[] {
  if (!items || items.length <= 1) return items ? [...items] : [];

  return [...items].sort((a, b) => {
    // 1. Compare comprehensive timestamp scores (newest timestamp first)
    const scoreA = getItemTimestampScore(a);
    const scoreB = getItemTimestampScore(b);

    if (scoreA > 0 && scoreB > 0 && scoreA !== scoreB) {
      return scoreB - scoreA; // Descending: newer timestamp first
    }

    // 2. If one has score and other doesn't, valid score comes first
    if (scoreA > 0 && scoreB <= 0) return -1;
    if (scoreB > 0 && scoreA <= 0) return 1;

    // 3. Fallback: Check ID / sequence descending
    const idA = String(a.id || a.visitorNumber || a.incidentNumber || '');
    const idB = String(b.id || b.visitorNumber || b.incidentNumber || '');
    return idB.localeCompare(idA, undefined, { numeric: true });
  });
}
