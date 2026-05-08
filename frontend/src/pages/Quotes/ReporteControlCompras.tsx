import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { SearchableSelect } from "../../components/ui/searchable-select";
import { getToken } from "../../lib/api";
import { matchesSearch } from "../../utils/utils";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PIN_MAX = 8;
const ROLES_EDICION = ["ADMIN", "SUPERVISOR", "JEFE_COMPRAS"];

// ─── Types ───────────────────────────────────────────────────────────────────

type ControlComprasRow = {
  id: string;
  proyecto: { id: string; nombre: string } | null;
  cotizacionNombre: string | null;
  solicitante: { id: string; nombre: string } | null;
  descripcion: string;
  po: string | null;
  fechaEmisionOC: string | null;
  fechaPagoAnticipo: string | null;
  fechaFinFabricacion: string | null;
  fechaFinFabricacionEsManual: boolean;
  fobBase: string | null;
  cifBase: string | null;
  llegadaBase: string | null;
  fobReal: string | null;
  cifReal: string | null;
  llegadaReal: string | null;
  observaciones: string | null;
  status: string;
  encargado: { id: string; nombre: string } | null;
};

type Solicitante = { id: string; nombre: string };

type ColDef = { key: string; label: string; width: number };

const COL_DEFS: ColDef[] = [
  { key: "proyecto",            label: "Proyecto",                       width: 140 },
  { key: "descripcion",         label: "Descripción del Equipo",         width: 240 },
  { key: "po",                  label: "PO",                             width: 95  },
  { key: "fechaEmisionOC",      label: "Fecha Emisión OC",               width: 120 },
  { key: "fechaPagoAnticipo",   label: "Fecha Pago Anticipo",            width: 130 },
  { key: "fechaFinFabricacion", label: "Fecha Fin. Fabricación",         width: 145 },
  { key: "fobBase",             label: "T. Entrega FOB (Base)",          width: 135 },
  { key: "cifBase",             label: "Transporte CIF (Base)",          width: 135 },
  { key: "llegadaBase",         label: "Llegada a Sitio (Base)",         width: 135 },
  { key: "fobReal",             label: "T. Entrega FOB",                 width: 120 },
  { key: "cifReal",             label: "Transporte CIF",                 width: 120 },
  { key: "llegadaReal",         label: "Llegada a Sitio",                width: 120 },
  { key: "observaciones",       label: "Observaciones",                  width: 220 },
  { key: "status",              label: "Status",                         width: 130 },
  { key: "encargado",           label: "Encargado Responsable",          width: 160 },
];

const DEFAULT_PINNED = ["proyecto", "descripcion", "po"];

const STATUS_STYLES: Record<string, string> = {
  "Recibido":         "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "En Coordinación":  "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300",
  "Fabricación":      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Orden de Compra":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Cotización":       "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Pendiente":        "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `${res.status}`);
  }
  return res.json();
}

function fmtDateDMY(d: string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function toDateInput(d: string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function PinIcon({ pinned }: { pinned: boolean }) {
  return pinned ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 3.86 4.45 9.12 5.53 10.37.24.28.7.28.94 0C13.55 17.12 18 11.86 18 8c0-3.31-2.69-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5z" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 3.86 4.45 9.12 5.53 10.37.24.28.7.28.94 0C13.55 17.12 18 11.86 18 8c0-3.31-2.69-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES["Pendiente"];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function DateCell({
  value,
  esManual,
  editable,
  onSave,
}: {
  value: string | null;
  esManual: boolean;
  editable: boolean;
  onSave: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.showPicker?.(); }, [editing]);

  if (!editable) {
    return (
      <span className="text-xs text-gray-700 dark:text-gray-300">
        {value ? fmtDateDMY(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        tabIndex={0}
        title={esManual ? "Valor manual — clic para editar" : "Default (1er seguimiento) — clic para editar"}
        className={`block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-400 ${esManual ? "" : "italic text-gray-500 dark:text-gray-400"}`}
        onClick={() => setEditing(true)}
        onFocus={() => setEditing(true)}
      >
        {value ? fmtDateDMY(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type="date"
      autoFocus
      className="rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      defaultValue={toDateInput(value)}
      onBlur={(e) => {
        setEditing(false);
        const v = e.target.value;
        onSave(v ? new Date(v).toISOString() : null);
      }}
      onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
    />
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function ReporteControlCompras() {
  const { user } = useAuth();
  const rolNombre = (user as any)?.rol?.nombre?.toUpperCase?.() ?? "";
  const puedeEditar = ROLES_EDICION.includes(rolNombre);

  const [rows, setRows] = useState<ControlComprasRow[]>([]);
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const [solicitanteId, setSolicitanteId] = useState<string>("TODOS");
  const [search, setSearch] = useState("");

  const [pinnedCols, setPinnedCols] = useState<string[]>(DEFAULT_PINNED);

  const togglePin = useCallback((key: string) => {
    setPinnedCols((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= PIN_MAX) return prev;
      return [...prev, key];
    });
  }, []);

  // Orden: ancladas primero (preservando orden de COL_DEFS), luego el resto
  const pinnedInOrder = COL_DEFS.filter((c) => pinnedCols.includes(c.key));
  const unpinned = COL_DEFS.filter((c) => !pinnedCols.includes(c.key));
  const allColsOrdered = [...pinnedInOrder, ...unpinned];

  const pinInfo: Record<string, { left: number; isLast: boolean }> = {};
  {
    let left = 0;
    pinnedInOrder.forEach((col, i) => {
      pinInfo[col.key] = { left, isLast: i === pinnedInOrder.length - 1 };
      left += col.width;
    });
  }

  // Cargar filtros
  useEffect(() => {
    apiFetch<{ solicitantes: Solicitante[] }>("/api/v1/reportes/control-compras/filtros")
      .then((d) => setSolicitantes(d.solicitantes))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (solicitanteId && solicitanteId !== "TODOS") params.set("solicitanteId", solicitanteId);
      const data = await apiFetch<ControlComprasRow[]>(
        `/api/v1/reportes/control-compras?${params}`,
      );
      setRows(data);
    } catch (e: any) {
      const msg =
        e?.message === "403"
          ? "No tienes permiso para ver este reporte."
          : `Error al cargar (${e?.message ?? "desconocido"})`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [solicitanteId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const guardarFinFabricacion = async (id: string, fechaIso: string | null) => {
    if (!puedeEditar) return;
    setSaving(id);
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, fechaFinFabricacion: fechaIso, fechaFinFabricacionEsManual: fechaIso != null }
          : r,
      ),
    );
    try {
      await apiFetch(`/api/v1/reportes/control-compras/${id}/fin-fabricacion`, {
        method: "PATCH",
        body: JSON.stringify({ fecha: fechaIso }),
      });
    } catch (e: any) {
      setError(e?.message || "Error al guardar fecha");
      fetchData();
    } finally {
      setSaving(null);
    }
  };

  // Filtro client-side libre
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((r) => {
      const haystack = [
        r.proyecto?.nombre ?? "",
        r.descripcion,
        r.po ?? "",
        r.observaciones ?? "",
        r.encargado?.nombre ?? "",
        r.cotizacionNombre ?? "",
        r.status,
      ].join(" ");
      return matchesSearch(search, haystack);
    });
  }, [rows, search]);

  // ─── Export ─────────────────────────────────────────────────────────────
  const exportExcel = () => {
    const data = filtered.map((r) => ({
      "Proyecto":                r.proyecto?.nombre ?? "",
      "Descripción del Equipo":  r.descripcion,
      "PO":                      r.po ?? "",
      "Fecha Emisión OC":        r.fechaEmisionOC ? fmtDateDMY(r.fechaEmisionOC) : "",
      "Fecha Pago Anticipo":     r.fechaPagoAnticipo ? fmtDateDMY(r.fechaPagoAnticipo) : "",
      "Fecha Fin Fabricación":   r.fechaFinFabricacion ? fmtDateDMY(r.fechaFinFabricacion) : "",
      "T. Entrega FOB (Base)":   r.fobBase ? fmtDateDMY(r.fobBase) : "",
      "Transporte CIF (Base)":   r.cifBase ? fmtDateDMY(r.cifBase) : "",
      "Llegada a Sitio (Base)":  r.llegadaBase ? fmtDateDMY(r.llegadaBase) : "",
      "T. Entrega FOB":          r.fobReal ? fmtDateDMY(r.fobReal) : "",
      "Transporte CIF":          r.cifReal ? fmtDateDMY(r.cifReal) : "",
      "Llegada a Sitio":         r.llegadaReal ? fmtDateDMY(r.llegadaReal) : "",
      "Observaciones":           r.observaciones ?? "",
      "Status":                  r.status,
      "Encargado Responsable":   r.encargado?.nombre ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Control de Compras");
    XLSX.writeFile(wb, `ControlCompras_${todayISO()}.xlsx`);
  };

  // ─── Renderer por columna ───────────────────────────────────────────────
  const renderCell = (key: string, r: ControlComprasRow) => {
    switch (key) {
      case "proyecto":
        return r.proyecto?.nombre ?? <span className="text-gray-300 dark:text-gray-600">—</span>;
      case "descripcion":
        return (
          <span className="block max-w-[320px] truncate" title={r.descripcion}>
            {r.descripcion}
          </span>
        );
      case "po":
        return r.po ?? <span className="text-gray-300 dark:text-gray-600">—</span>;
      case "fechaEmisionOC":     return fmtDateDMY(r.fechaEmisionOC);
      case "fechaPagoAnticipo":  return fmtDateDMY(r.fechaPagoAnticipo);
      case "fechaFinFabricacion":
        return (
          <DateCell
            value={r.fechaFinFabricacion}
            esManual={r.fechaFinFabricacionEsManual}
            editable={puedeEditar}
            onSave={(v) => guardarFinFabricacion(r.id, v)}
          />
        );
      case "fobBase":     return fmtDateDMY(r.fobBase);
      case "cifBase":     return fmtDateDMY(r.cifBase);
      case "llegadaBase": return fmtDateDMY(r.llegadaBase);
      case "fobReal":     return fmtDateDMY(r.fobReal);
      case "cifReal":     return fmtDateDMY(r.cifReal);
      case "llegadaReal": return fmtDateDMY(r.llegadaReal);
      case "observaciones":
        return r.observaciones ? (
          <span className="block max-w-[300px] truncate" title={r.observaciones}>
            {r.observaciones}
          </span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        );
      case "status":      return <StatusBadge status={r.status} />;
      case "encargado":   return r.encargado?.nombre ?? <span className="text-gray-300 dark:text-gray-600">—</span>;
      default: return null;
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <PageMeta title="Control de Compras" description="Reporte estilo Excel del cliente" />
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Control de Compras</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reporte por solicitante con encargado responsable y fechas base/reales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="min-w-[260px] flex-1">
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Solicitante
            </label>
            <SearchableSelect
              value={solicitanteId}
              onChange={setSolicitanteId}
              options={solicitantes}
              allLabel="Todos los solicitantes"
              allValue="TODOS"
              placeholder="Selecciona solicitante"
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Búsqueda
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Proyecto, PO, descripción, encargado…"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} fila{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-260px)] rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500">
                Sin productos para los filtros seleccionados.
              </div>
            ) : (
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left">
                    {allColsOrdered.map((col) => {
                      const isPinned = col.key in pinInfo;
                      const isLastPin = isPinned && pinInfo[col.key].isLast;
                      const atMax = !isPinned && pinnedCols.length >= PIN_MAX;
                      return (
                        <th
                          key={col.key}
                          style={{
                            minWidth: col.width,
                            ...(isPinned ? { position: "sticky", left: pinInfo[col.key].left, zIndex: 20 } : {}),
                          }}
                          className={[
                            "group whitespace-nowrap border-b px-2 py-2 text-[10px] font-semibold uppercase tracking-wider",
                            isPinned
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                            isLastPin
                              ? "border-r-2 border-r-blue-300 dark:border-r-blue-700"
                              : "border-gray-200 dark:border-gray-700",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-1 pr-1">
                            <span className="flex-1">{col.label}</span>
                            <button
                              onClick={() => togglePin(col.key)}
                              disabled={atMax}
                              title={
                                isPinned
                                  ? "Desanclar columna"
                                  : atMax
                                  ? `Máximo ${PIN_MAX} columnas ancladas`
                                  : "Anclar columna"
                              }
                              className={[
                                "flex-shrink-0 rounded p-0.5 transition-all",
                                isPinned
                                  ? "text-blue-600 opacity-100 dark:text-blue-400"
                                  : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400",
                                atMax ? "cursor-not-allowed opacity-30 group-hover:opacity-30" : "cursor-pointer",
                              ].join(" ")}
                            >
                              <PinIcon pinned={isPinned} />
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={`${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} hover:bg-gray-50/80 dark:hover:bg-gray-800/50`}
                    >
                      {allColsOrdered.map((col) => {
                        const isPinned = col.key in pinInfo;
                        const isLastPin = isPinned && pinInfo[col.key].isLast;
                        return (
                          <td
                            key={col.key}
                            style={{
                              ...(isPinned ? { position: "sticky", left: pinInfo[col.key].left, zIndex: 5 } : {}),
                            }}
                            className={[
                              "whitespace-nowrap px-2 py-1.5 align-middle text-xs text-gray-700 dark:text-gray-300",
                              isPinned ? "bg-white dark:bg-gray-900" : "",
                              isLastPin ? "border-r-2 border-r-blue-200 dark:border-r-blue-800" : "",
                            ].join(" ")}
                          >
                            {renderCell(col.key, r)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
