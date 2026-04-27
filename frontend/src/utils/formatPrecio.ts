// ============================================================================
// Formato de precios con moneda explícita
// ============================================================================

export interface Moneda {
  id: string;
  codigo: string;     // "HNL", "USD"
  nombre: string;
  simbolo: string;    // "L.", "$"
  decimales: number;  // típicamente 2
  activo: boolean;
  orden: number;
}

/**
 * Formatea un monto usando la moneda dada.
 *
 * Si `moneda` es null/undefined intenta usar `tipoCompra` como fallback
 * (NACIONAL → HNL implícito, INTERNACIONAL → USD implícito) — solo para
 * registros legacy sin moneda asignada.
 */
export function formatPrecio(
  monto: number | string | null | undefined,
  moneda?: Moneda | null,
  fallbackTipoCompra?: "NACIONAL" | "INTERNACIONAL" | null,
): string {
  if (monto === null || monto === undefined || monto === "") return "—";
  const num = typeof monto === "string" ? parseFloat(monto) : monto;
  if (Number.isNaN(num)) return "—";

  const decimales = moneda?.decimales ?? 2;

  const formatted = num.toLocaleString("es-HN", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  if (moneda) return `${moneda.simbolo} ${formatted}`;

  // Fallback legacy: deducir por tipoCompra
  if (fallbackTipoCompra === "INTERNACIONAL") return `$ ${formatted}`;
  if (fallbackTipoCompra === "NACIONAL") return `L. ${formatted}`;

  // Sin información: devolver el número solo
  return formatted;
}

/**
 * Variante corta: solo el código (HNL/USD) seguido del número.
 * Útil en tablas/badges donde el símbolo "$" puede ser ambiguo.
 */
export function formatPrecioConCodigo(
  monto: number | string | null | undefined,
  moneda?: Moneda | null,
): string {
  if (monto === null || monto === undefined || monto === "") return "—";
  const num = typeof monto === "string" ? parseFloat(monto) : monto;
  if (Number.isNaN(num)) return "—";
  const decimales = moneda?.decimales ?? 2;
  const formatted = num.toLocaleString("es-HN", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  return moneda ? `${moneda.codigo} ${formatted}` : formatted;
}

/**
 * Devuelve solo el símbolo o código de una moneda para mostrar en headers.
 */
export function formatMonedaBadge(moneda?: Moneda | null): string {
  if (!moneda) return "—";
  return moneda.codigo;
}
