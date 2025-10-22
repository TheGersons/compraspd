// frontend/src/pages/Quotes/hooks/utils.ts

/**
 * Parse many date formats into milliseconds.  Falls back to new Date().
 */
export function parseMs(s: string | undefined): number {
  if (!s) return NaN;
  // If ISO with T/Z, let Date handle it
  if (s.includes('T') || s.includes('Z') || /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return Date.parse(s);
  }
  // If DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(+yyyy, +mm - 1, +dd).getTime();
  }
  // Otherwise try Date.parse
  return Date.parse(s);
}

export function daysUntil(iso: string): number {
  return Math.ceil((parseMs(iso) - Date.now()) / 86_400_000);
}

/** Convert Date to YYYY‑MM‑DD */
export function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Check if an ISO date lies within a YYYY‑MM‑DD range */
export function inRangeYmd(iso: string, start?: string, end?: string): boolean {
  const date = new Date(parseMs(iso));
  const ymd = toYmd(date);
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  return true;
}

/** Lower‑case helper to normalise strings */
export const norm = (s: string | undefined) => (s || '').toLowerCase();
