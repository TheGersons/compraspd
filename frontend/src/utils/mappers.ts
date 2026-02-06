// utils/mappers.ts
export function mapProcurement(v: string) {
  const t = v.trim().toLowerCase();
  if (t === 'nacional') return 'NATIONAL';
  if (t === 'internacional') return 'INTERNATIONAL';
  return String(v).toUpperCase();
}

export function mapDeliveryType(v: string) {
  const t = v.trim().toLowerCase();
  
  if (t === 'almacen' || t === 'almacén') return 'WAREHOUSE';
  if (t === 'proyecto') return 'PROJECT';
  if (t === 'oficina') return 'OFFICE'; // <-- Agregado aquí

  return String(v).toUpperCase();
}

export function toNumberString(x: unknown) {
  const n = Number(x);
  if (!Number.isFinite(n)) return '0';
  return String(n); // sin comas ni espacios
}
