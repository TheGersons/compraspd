import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { History } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Seguimiento = {
  id: string;
  cotizacionId: string;
  fechaSolicitud: string;
  nombreCotizacion: string;
  ordenCompraCotizacion: string | null;
  solicitante: string | null;
  proyecto: string | null;
  area: string | null;
  descripcionProducto: string;
  paisOrigen: string | null;
  medioTransporte: string | null;
  tipoEntrega: string | null;
  fechaComprado: string | null;
  proveedor: string | null;
  marcaModelo: string | null;
  nombreMaterial: string | null;
  numeroOC: string | null;
  tipoImportacion: string | null;
  destino: string | null;
  estado: string | null;
  seguimiento: string | null;
  paisOrigenEdit: string | null;
  incoterms: string | null;
  terminosPago: string | null;
  formaPago: string | null;
  tipoTransporte: string | null;
  bookingBl: string | null;
  tracking: string | null;
  puertoSalida: string | null;
  puertoLlegada: string | null;
  agenteAduanal: string | null;
  naviera: string | null;
  contenedor: string | null;
  observaciones: string | null;
  fechaOc: string | null;
  fechaFabricacion: string | null;
  fechaListoEmbarque: string | null;
  fechaEmbarque: string | null;
  fechaLlegadaPuerto: string | null;
  fechaRetiroPuerto: string | null;
  fechaLiberacionAduana: string | null;
  fechaEntregaFinal: string | null;
  fechaPagoProveedor: string | null;
  fechaDocumentosCompletos: string | null;
  remesaNotificado: boolean;
  blTelexReleased: boolean;
  polizaSeguroRecibida: boolean;
  actualizado: string;
};

type Log = {
  id: string;
  campo: string;
  campoKey: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  usuario: string;
  fecha: string;
};

// ─── Estado options ──────────────────────────────────────────────────────────

const ESTADO_OPTIONS = [
  "EN PROCESO",
  "EN COORDINACION",
  "EN TRANSITO",
  "EN ADUANA",
  "RECIBIDO",
  "CANCELADO",
] as const;

const ESTADO_STYLES: Record<string, { bg: string; text: string }> = {
  "EN PROCESO":      { bg: "bg-orange-100 dark:bg-orange-900/30",   text: "text-orange-800 dark:text-orange-300" },
  "EN COORDINACION": { bg: "bg-pink-100 dark:bg-pink-900/20",       text: "text-pink-700 dark:text-pink-300" },
  "EN TRANSITO":     { bg: "bg-yellow-100 dark:bg-yellow-900/20",   text: "text-yellow-800 dark:text-yellow-400" },
  "EN ADUANA":       { bg: "bg-blue-100 dark:bg-blue-900/20",       text: "text-blue-800 dark:text-blue-300" },
  "RECIBIDO":        { bg: "bg-emerald-100 dark:bg-emerald-900/20", text: "text-emerald-800 dark:text-emerald-300" },
  "CANCELADO":       { bg: "bg-red-100 dark:bg-red-900/20",         text: "text-red-800 dark:text-red-300" },
};

// ─── Search column options ───────────────────────────────────────────────────

const SEARCH_COLUMNS = [
  { key: "nombreCotizacion", label: "Cotización" },
  { key: "proveedor",        label: "Proveedor" },
  { key: "numeroOC",         label: "# OC" },
  { key: "bookingBl",        label: "Booking / BL" },
  { key: "contenedor",       label: "Contenedor" },
  { key: "descripcionProducto", label: "Descripción" },
  { key: "paisOrigen",       label: "País Origen" },
  { key: "solicitante",      label: "Solicitante" },
  { key: "proyecto",         label: "Proyecto" },
  { key: "naviera",          label: "Naviera" },
  { key: "tracking",         label: "Tracking" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toDateInput(d: string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

// ─── Inline editors ──────────────────────────────────────────────────────────

function TextCell({
  value,
  onSave,
  minWidth = "80px",
}: {
  value: string | null;
  onSave: (v: string | null) => void;
  minWidth?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  if (!editing) {
    return (
      <span
        style={{ minWidth }}
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => { setDraft(value ?? ""); setEditing(true); }}
        title="Clic para editar"
      >
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      className="w-full min-w-[100px] rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onSave(draft.trim() || null); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); onSave(draft.trim() || null); }
        if (e.key === "Escape") { setEditing(false); setDraft(value ?? ""); }
      }}
    />
  );
}

// Celda de texto largo con modal cómodo
function LongTextCell({
  value,
  onSave,
  label,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  return (
    <>
      <span
        className="block max-w-[200px] cursor-pointer truncate rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => { setDraft(value ?? ""); setOpen(true); }}
        title={value ?? "Clic para editar"}
      >
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
              {label ?? "Seguimiento"}
            </h4>
            <textarea
              autoFocus
              className="h-48 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe el seguimiento aquí..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onSave(draft.trim() || null); setOpen(false); }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DateCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.showPicker?.(); }, [editing]);

  if (!editing) {
    return (
      <span
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => setEditing(true)}
        title="Clic para editar fecha"
      >
        {value ? fmtDateDMY(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type="date"
      className="rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      defaultValue={toDateInput(value)}
      autoFocus
      onBlur={(e) => {
        setEditing(false);
        onSave(e.target.value ? new Date(e.target.value).toISOString() : null);
      }}
      onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
    />
  );
}

// Select coloreado para Estado
function EstadoCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const style = value ? ESTADO_STYLES[value] : null;

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onSave(e.target.value || null)}
      className={`cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium outline-none border-0 ${
        style ? `${style.bg} ${style.text}` : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      <option value="">— Sin estado</option>
      {ESTADO_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function ActualizacionCell({
  remesa, bl, poliza,
  onToggle,
}: {
  remesa: boolean; bl: boolean; poliza: boolean;
  onToggle: (campo: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida", value: boolean) => void;
}) {
  const items: { key: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida"; label: string; value: boolean }[] = [
    { key: "remesaNotificado",     label: "Remesa Notificado",     value: remesa },
    { key: "blTelexReleased",      label: "BL Telex Released",      value: bl },
    { key: "polizaSeguroRecibida", label: "Póliza Seguro Recibida", value: poliza },
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onToggle(it.key, !it.value)}
          className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
            it.value
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          <span>{it.value ? "✓" : "✗"}</span>
          <span className="whitespace-nowrap">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Log drawer ──────────────────────────────────────────────────────────────

function LogDrawer({ seguimientoId, onClose }: { seguimientoId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Log[]>(`/api/v1/import-export/${seguimientoId}/logs`)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [seguimientoId]);

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Historial de cambios</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-sm text-gray-400">
            <span className="mb-2 text-3xl">📋</span>
            Sin cambios registrados
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((l) => (
              <li key={l.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {l.campo}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDateDMY(l.fecha)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Anterior</p>
                    <p className="mt-0.5 truncate text-gray-600 dark:text-gray-300">{l.valorAnterior ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Nuevo</p>
                    <p className="mt-0.5 truncate font-medium text-gray-800 dark:text-white">{l.valorNuevo ?? "—"}</p>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Por: {l.usuario}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ImportExport() {
  const [rows, setRows]       = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState<string | null>(null);
  const [logId, setLogId]     = useState<string | null>(null);

  // Filtros
  const [desde, setDesde]             = useState("");
  const [hasta, setHasta]             = useState("");
  const [searchCol, setSearchCol]     = useState<string>("nombreCotizacion");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Seguimiento[]>(`/api/v1/import-export`);
      setRows(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const actualizarCampo = async (
    id: string,
    campo: string,
    valor: string | boolean | null,
  ) => {
    setSaving(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor as any } : r)));
    try {
      await apiFetch(`/api/v1/import-export/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [campo]: valor }),
      });
    } catch (e: any) {
      setError(e.message || "Error al guardar");
      fetchData();
    } finally {
      setSaving(null);
    }
  };

  // Filtrado
  const filtered = rows.filter((r) => {
    // Rango de fechas sobre fechaSolicitud
    if (desde) {
      const d = new Date(r.fechaSolicitud);
      if (d < new Date(desde)) return false;
    }
    if (hasta) {
      const d = new Date(r.fechaSolicitud);
      const h = new Date(hasta);
      h.setHours(23, 59, 59);
      if (d > h) return false;
    }
    // Búsqueda por columna seleccionada
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const val = (r as any)[searchCol];
      if (!val || !String(val).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const colLabel = SEARCH_COLUMNS.find((c) => c.key === searchCol)?.label ?? "columna";

  return (
    <>
      <PageMeta title="Import-Export" description="Seguimiento de importaciones" />
      <div className="p-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Import-Export</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento de cotizaciones internacionales — FR-CO-16
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          {/* Desde */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {/* Hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {/* Buscar por columna */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Buscar por</label>
            <select
              value={searchCol}
              onChange={(e) => setSearchCol(e.target.value)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {SEARCH_COLUMNS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Valor</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filtrar por ${colLabel}...`}
              className="w-56 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {/* Limpiar */}
          {(desde || hasta || searchQuery) && (
            <button
              onClick={() => { setDesde(""); setHasta(""); setSearchQuery(""); }}
              className="self-end rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={fetchData}
            className="ml-auto self-end rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            ↻ Recargar
          </button>
          <span className="self-end text-xs text-gray-400">{filtered.length} registros</span>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
            <button onClick={() => setError(null)} className="float-right text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Layout: botones historial fijos a la izquierda + tabla scrolleable */}
        <div className="flex gap-0 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

          {/* Columna fija: botones historial */}
          <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header fijo */}
            <div className="flex h-[37px] items-center justify-center border-b border-gray-200 px-2 dark:border-gray-700">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Log</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20 px-3">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-center px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 ${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  style={{ height: "48px" }}
                >
                  <button
                    onClick={() => setLogId(r.id)}
                    title="Ver historial de cambios"
                    className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-colors"
                  >
                    <History className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Tabla principal scrolleable */}
          <div className="flex-1 overflow-x-auto bg-white dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500">
                Sin cotizaciones internacionales en estado "Comprado" todavía.
              </div>
            ) : (
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left">
                    <Th>SEGUIMIENTO</Th>
                    <Th>ACTUALIZACION</Th>
                    <Th>ESTADO</Th>
                    <Th>COTIZACION</Th>
                    <Th>SOLICITANTE</Th>
                    <Th>PROYECTO</Th>
                    <Th>DESCRIPCION</Th>
                    <Th>PROVEEDOR</Th>
                    <Th>MARCA / MODELO</Th>
                    <Th>NOMBRE MATERIAL</Th>
                    <Th># OC</Th>
                    <Th>TIPO IMPORT.</Th>
                    <Th>PAIS ORIGEN</Th>
                    <Th>DESTINO</Th>
                    <Th>INCOTERMS</Th>
                    <Th>TERMINOS PAGO</Th>
                    <Th>FORMA PAGO</Th>
                    <Th>TIPO TRANSP.</Th>
                    <Th>BOOKING / BL</Th>
                    <Th>TRACKING</Th>
                    <Th>PTO. SALIDA</Th>
                    <Th>PTO. LLEGADA</Th>
                    <Th>AGENTE ADUANAL</Th>
                    <Th>NAVIERA</Th>
                    <Th>CONTENEDOR</Th>
                    <Th>F. OC</Th>
                    <Th>F. FABRICACION</Th>
                    <Th>F. LISTO EMB.</Th>
                    <Th>F. EMBARQUE</Th>
                    <Th>F. LLEGADA PTO.</Th>
                    <Th>F. RETIRO PTO.</Th>
                    <Th>F. LIB. ADUANA</Th>
                    <Th>F. ENTREGA FINAL</Th>
                    <Th>F. PAGO PROV.</Th>
                    <Th>F. DOCS COMPL.</Th>
                    <Th>OBSERVACIONES</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      style={{ height: "48px" }}
                      className={`${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                    >
                      {/* SEGUIMIENTO — texto largo con modal */}
                      <Td>
                        <LongTextCell
                          value={r.seguimiento}
                          onSave={(v) => actualizarCampo(r.id, "seguimiento", v)}
                          label="Seguimiento"
                        />
                      </Td>
                      <Td>
                        <ActualizacionCell
                          remesa={r.remesaNotificado}
                          bl={r.blTelexReleased}
                          poliza={r.polizaSeguroRecibida}
                          onToggle={(k, v) => actualizarCampo(r.id, k, v)}
                        />
                      </Td>
                      {/* ESTADO — select coloreado */}
                      <Td>
                        <EstadoCell
                          value={r.estado}
                          onSave={(v) => actualizarCampo(r.id, "estado", v)}
                        />
                      </Td>
                      <Td>
                        <span className="block max-w-[140px] truncate" title={r.nombreCotizacion}>
                          {r.nombreCotizacion}
                        </span>
                      </Td>
                      <Td>{r.solicitante || "—"}</Td>
                      <Td>{r.proyecto || "—"}</Td>
                      <Td>
                        <span className="block max-w-[200px] truncate" title={r.descripcionProducto}>
                          {r.descripcionProducto}
                        </span>
                      </Td>
                      <Td><TextCell value={r.proveedor} onSave={(v) => actualizarCampo(r.id, "proveedor", v)} /></Td>
                      <Td><TextCell value={r.marcaModelo} onSave={(v) => actualizarCampo(r.id, "marcaModelo", v)} /></Td>
                      <Td><TextCell value={r.nombreMaterial} onSave={(v) => actualizarCampo(r.id, "nombreMaterial", v)} /></Td>
                      <Td><TextCell value={r.numeroOC || r.ordenCompraCotizacion} onSave={(v) => actualizarCampo(r.id, "numeroOC", v)} /></Td>
                      <Td><TextCell value={r.tipoImportacion} onSave={(v) => actualizarCampo(r.id, "tipoImportacion", v)} /></Td>
                      {/* PAIS ORIGEN — editable (guarda en paisOrigenEdit, fallback al auto) */}
                      <Td><TextCell value={r.paisOrigenEdit ?? r.paisOrigen} onSave={(v) => actualizarCampo(r.id, "paisOrigenEdit", v)} /></Td>
                      <Td><TextCell value={r.destino} onSave={(v) => actualizarCampo(r.id, "destino", v)} /></Td>
                      <Td><TextCell value={r.incoterms || r.tipoEntrega} onSave={(v) => actualizarCampo(r.id, "incoterms", v)} /></Td>
                      <Td><TextCell value={r.terminosPago} onSave={(v) => actualizarCampo(r.id, "terminosPago", v)} /></Td>
                      <Td><TextCell value={r.formaPago} onSave={(v) => actualizarCampo(r.id, "formaPago", v)} /></Td>
                      <Td><TextCell value={r.tipoTransporte || r.medioTransporte} onSave={(v) => actualizarCampo(r.id, "tipoTransporte", v)} /></Td>
                      <Td><TextCell value={r.bookingBl} onSave={(v) => actualizarCampo(r.id, "bookingBl", v)} /></Td>
                      <Td><TextCell value={r.tracking} onSave={(v) => actualizarCampo(r.id, "tracking", v)} /></Td>
                      <Td><TextCell value={r.puertoSalida} onSave={(v) => actualizarCampo(r.id, "puertoSalida", v)} /></Td>
                      <Td><TextCell value={r.puertoLlegada} onSave={(v) => actualizarCampo(r.id, "puertoLlegada", v)} /></Td>
                      <Td><TextCell value={r.agenteAduanal} onSave={(v) => actualizarCampo(r.id, "agenteAduanal", v)} /></Td>
                      <Td><TextCell value={r.naviera} onSave={(v) => actualizarCampo(r.id, "naviera", v)} /></Td>
                      <Td><TextCell value={r.contenedor} onSave={(v) => actualizarCampo(r.id, "contenedor", v)} /></Td>
                      <Td><DateCell value={r.fechaOc} onSave={(v) => actualizarCampo(r.id, "fechaOc", v)} /></Td>
                      <Td><DateCell value={r.fechaFabricacion} onSave={(v) => actualizarCampo(r.id, "fechaFabricacion", v)} /></Td>
                      <Td><DateCell value={r.fechaListoEmbarque} onSave={(v) => actualizarCampo(r.id, "fechaListoEmbarque", v)} /></Td>
                      <Td><DateCell value={r.fechaEmbarque} onSave={(v) => actualizarCampo(r.id, "fechaEmbarque", v)} /></Td>
                      <Td><DateCell value={r.fechaLlegadaPuerto} onSave={(v) => actualizarCampo(r.id, "fechaLlegadaPuerto", v)} /></Td>
                      <Td><DateCell value={r.fechaRetiroPuerto} onSave={(v) => actualizarCampo(r.id, "fechaRetiroPuerto", v)} /></Td>
                      <Td><DateCell value={r.fechaLiberacionAduana} onSave={(v) => actualizarCampo(r.id, "fechaLiberacionAduana", v)} /></Td>
                      <Td><DateCell value={r.fechaEntregaFinal} onSave={(v) => actualizarCampo(r.id, "fechaEntregaFinal", v)} /></Td>
                      <Td><DateCell value={r.fechaPagoProveedor} onSave={(v) => actualizarCampo(r.id, "fechaPagoProveedor", v)} /></Td>
                      <Td><DateCell value={r.fechaDocumentosCompletos} onSave={(v) => actualizarCampo(r.id, "fechaDocumentosCompletos", v)} /></Td>
                      <Td>
                        <TextCell value={r.observaciones} onSave={(v) => actualizarCampo(r.id, "observaciones", v)} minWidth="160px" />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {logId && <LogDrawer seguimientoId={logId} onClose={() => setLogId(null)} />}
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap border-b border-gray-200 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:text-gray-400">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap px-2 py-1.5 align-middle text-xs text-gray-700 dark:text-gray-300">
      {children}
    </td>
  );
}
