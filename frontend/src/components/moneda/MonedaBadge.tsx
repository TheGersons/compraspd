import { useEffect, useRef, useState } from "react";
import { useMonedas } from "../../hooks/useMonedas";
import { getToken } from "../../lib/api";
import type { Moneda } from "../../utils/formatPrecio";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

interface MonedaBadgeProps {
  /** UUID de la cotización a la que se le va a cambiar la moneda. */
  cotizacionId: string;
  /** Moneda actualmente asignada (puede ser null para registros legacy). */
  monedaId?: string | null;
  /** tipoCompra de la cotización, usado solo como fallback visual si monedaId es null. */
  tipoCompra?: "NACIONAL" | "INTERNACIONAL" | string | null;
  /** Si false, muestra el badge sin permitir editar. */
  editable?: boolean;
  /** Callback opcional cuando se actualiza con éxito. */
  onChange?: (nueva: Moneda) => void;
  /** Tamaño visual. */
  size?: "sm" | "md";
}

export function MonedaBadge({
  cotizacionId,
  monedaId,
  tipoCompra,
  editable = true,
  onChange,
  size = "sm",
}: MonedaBadgeProps) {
  const { monedas, findById, defaultPorTipoCompra } = useMonedas();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const actual = findById(monedaId) || defaultPorTipoCompra(tipoCompra);
  const codigoMostrar = actual?.codigo || "—";
  const isLegacy = !monedaId; // registro sin moneda asignada todavía

  // Cerrar al click afuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = async (nueva: Moneda) => {
    if (nueva.id === monedaId) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/api/v1/quotations/${cotizacionId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ monedaId: nueva.id }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al cambiar moneda");
      }
      onChange?.(nueva);
      setOpen(false);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";

  const badgeColors = isLegacy
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-700"
    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${padding} ${fontSize} ${badgeColors}`}
        title={isLegacy ? "Moneda no asignada (legacy)" : actual?.nombre || ""}
      >
        {codigoMostrar}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        disabled={saving}
        title={
          isLegacy
            ? "Moneda no asignada — clic para asignar"
            : `Moneda: ${actual?.nombre || codigoMostrar}. Clic para cambiar.`
        }
        className={`inline-flex items-center gap-1 rounded-full font-semibold transition-colors hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-700 disabled:opacity-50 ${padding} ${fontSize} ${badgeColors}`}
      >
        {saving ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {codigoMostrar}
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {monedas.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelect(m)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                m.id === monedaId ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {m.codigo}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{m.simbolo}</span>
            </button>
          ))}
          {error && (
            <p className="border-t border-rose-200 px-3 py-2 text-[10px] text-rose-600 dark:border-rose-800 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
