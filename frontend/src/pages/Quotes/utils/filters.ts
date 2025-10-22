// utils/filters.ts
export const parseMs = (s: string) => {
  if (!s) return NaN;
  if (s.includes("T") || s.includes("Z") || /^\d{4}-\d{2}-\d{2}$/.test(s)) return Date.parse(s);
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) { const [, dd, mm, yyyy] = m; return +new Date(+yyyy, +mm - 1, +dd); }
  return Date.parse(s);
};
export const daysUntil = (iso: string) => Math.ceil((parseMs(iso) - Date.now()) / 86_400_000);
export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const inRangeYmd = (iso: string, start?: string, end?: string) => {
  const ymd = toYmd(new Date(parseMs(iso)));
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  return true;
};

