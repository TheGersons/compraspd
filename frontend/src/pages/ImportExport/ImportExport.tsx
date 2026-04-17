import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { History } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  tipoOperacion: string | null;
  prioridad: string | null;
  proveedor: string | null;
  marcaModelo: string | null;
  nombreMaterial: string | null;
  numeroOC: string | null;
  tipoImportacion: string | null;
  paisOrigenEdit: string | null;
  destino: string | null;
  estado: string | null;
  seguimiento: string | null;
  detalles: string | null;
  incoterms: string | null;
  terminosPago: string | null;
  formaPago: string | null;
  tipoTransporte: string | null;
  tipoEmbarque: string | null;
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
  fechaEmisionBoletinImpuesto: string | null;
  fechaPagoBoletin: string | null;
  fechaSelectivo: string | null;
  fechaRevision: string | null;
  fechaLevante: string | null;
  fechaLiberacionAduana: string | null;
  fechaGatePass: string | null;
  fechaEntregaFinal: string | null;
  fechaPagoProveedor: string | null;
  fechaDocumentosCompletos: string | null;
  remesaNotificado: boolean;
  blTelexReleased: boolean;
  polizaSeguroRecibida: boolean;
  factura: boolean;
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

// ─── Estado config ─────────────────────────────────────────────────────────

const ESTADO_OPTIONS = ["EN PROCESO", "EN COORDINACION", "EN TRANSITO", "EN ADUANA", "RECIBIDO", "CANCELADO"] as const;

const ESTADO_STYLES: Record<string, { bg: string; text: string }> = {
  "EN PROCESO": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300" },
  "EN COORDINACION": { bg: "bg-pink-100 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-300" },
  "EN TRANSITO": { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-400" },
  "EN ADUANA": { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-300" },
  "RECIBIDO": { bg: "bg-emerald-100 dark:bg-emerald-900/20", text: "text-emerald-800 dark:text-emerald-300" },
  "CANCELADO": { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-300" },
};

const ESTADO_RGB: Record<string, [number, number, number]> = {
  "EN PROCESO": [254, 215, 170],
  "EN COORDINACION": [251, 207, 232],
  "EN TRANSITO": [254, 240, 138],
  "EN ADUANA": [191, 219, 254],
  "RECIBIDO": [167, 243, 208],
  "CANCELADO": [254, 202, 202],
};

// ─── Prioridad config ───────────────────────────────────────────────────────

const PRIORIDAD_OPTIONS = ["NORMAL", "URGENTE", "CRITICO"] as const;

const PRIORIDAD_STYLES: Record<string, { bg: string; text: string }> = {
  "NORMAL": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300" },
  "URGENTE": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300" },
  "CRITICO": { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-300" },
};

const PRIORIDAD_RGB: Record<string, [number, number, number]> = {
  "NORMAL": [191, 219, 254],
  "URGENTE": [254, 215, 170],
  "CRITICO": [254, 202, 202],
};

// ─── Campo labels ───────────────────────────────────────────────────────────

const CAMPO_LABELS_DISPLAY: Record<string, string> = {
  tipoOperacion: "Tipo Operación", prioridad: "Prioridad",
  proveedor: "Proveedor", marcaModelo: "Marca / Modelo", nombreMaterial: "Nombre Material",
  numeroOC: "# OC", tipoImportacion: "Tipo Import/Export", paisOrigenEdit: "País Origen",
  destino: "Destino", estado: "Estado", seguimiento: "Seguimiento", detalles: "Detalles",
  incoterms: "Incoterms", terminosPago: "Términos Pago", formaPago: "Forma Pago",
  tipoTransporte: "Tipo Transporte", tipoEmbarque: "Tipo Embarque",
  bookingBl: "BL / Tracking", tracking: "Tracking",
  puertoSalida: "Puerto Origen", puertoLlegada: "Puerto Destino",
  agenteAduanal: "Agente Aduanal", naviera: "Naviera / Forwarder",
  contenedor: "Contenedor", observaciones: "Observaciones",
  fechaOc: "Fecha OC", fechaFabricacion: "Fecha Fabricación",
  fechaListoEmbarque: "Fecha Listo Embarque", fechaEmbarque: "Fecha ETD",
  fechaLlegadaPuerto: "Fecha ETA", fechaRetiroPuerto: "Fecha Manifiesto",
  fechaEmisionBoletinImpuesto: "Fecha Emis. Boletín",
  fechaPagoBoletin: "Fecha Pago Boletín", fechaSelectivo: "Fecha Selectivo",
  fechaRevision: "Fecha Revisión", fechaLevante: "Fecha Levante",
  fechaLiberacionAduana: "Fecha Lib. Aduana",
  fechaGatePass: "Fecha Gate Pass", fechaEntregaFinal: "Fecha Entrega Final",
  fechaPagoProveedor: "Fecha Pago Proveedor", fechaDocumentosCompletos: "Fecha Docs. Compl.",
  remesaNotificado: "Packing List", blTelexReleased: "BL Telex Released",
  polizaSeguroRecibida: "Póliza Seguro Recibida", factura: "Factura",
};

// ─── Options ────────────────────────────────────────────────────────────────

const TIPO_IMPORTACION_OPTIONS = ["Temporal", "Definitiva"];
const TIPO_EMBARQUE_OPTIONS = ["LCL", "FCL", "FTL", "FLT", "RORO/BREAKBULK", "AEREO"];

// ─── Search columns ─────────────────────────────────────────────────────────

const SEARCH_COLUMNS = [
  { key: "nombreCotizacion", label: "Cotización" },
  { key: "proveedor", label: "Proveedor" },
  { key: "numeroOC", label: "# OC" },
  { key: "bookingBl", label: "BL / Tracking" },
  { key: "contenedor", label: "Contenedor" },
  { key: "descripcionProducto", label: "Descripción" },
  { key: "paisOrigen", label: "País Origen" },
  { key: "solicitante", label: "Solicitante" },
  { key: "proyecto", label: "Proyecto" },
  { key: "naviera", label: "Naviera" },
  { key: "estado", label: "Estado" },
  { key: "prioridad", label: "Prioridad" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts?.headers ?? {}) },
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

function todayISO() { return new Date().toISOString().slice(0, 10); }

function calcDiasEntrega(r: Seguimiento): string {
  if (!r.fechaGatePass || !r.fechaRetiroPuerto) return "—";
  const gate = new Date(r.fechaGatePass).getTime();
  const manifiesto = new Date(r.fechaRetiroPuerto).getTime();
  const dias = Math.round((gate - manifiesto) / (1000 * 60 * 60 * 24));
  return `${dias} días`;
}

// ─── Inline editors ───────────────────────────────────────────────────────────

function TextCell({ value, onSave, minWidth = "80px" }: { value: string | null; onSave: (v: string | null) => void; minWidth?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  if (!editing)
    return (
      <span
        tabIndex={0}
        style={{ minWidth }}
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-0"
        onClick={() => { setDraft(value ?? ""); setEditing(true); }}
        onFocus={() => { setDraft(value ?? ""); setEditing(true); }}
        title="Clic para editar">
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );

  return (
    <input ref={ref}
      className="w-full min-w-[100px] rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      value={draft} onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onSave(draft.trim() || null); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); onSave(draft.trim() || null); }
        if (e.key === "Escape") { setEditing(false); setDraft(value ?? ""); }
      }} />
  );
}

function LongTextCell({ value, onSave, label }: { value: string | null; onSave: (v: string | null) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  return (
    <>
      <span
        tabIndex={0}
        className="block max-w-[200px] cursor-pointer truncate rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
        onClick={() => { setDraft(value ?? ""); setOpen(true); }}
        onFocus={() => { setDraft(value ?? ""); setOpen(true); }}
        title={value ?? "Clic para editar"}>
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">{label ?? "Texto"}</h4>
            <textarea autoFocus className="h-48 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escribe aquí..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">Cancelar</button>
              <button onClick={() => { onSave(draft.trim() || null); setOpen(false); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar</button>
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

  if (!editing)
    return (
      <span
        tabIndex={0}
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
        onClick={() => setEditing(true)}
        onFocus={() => setEditing(true)}
        title="Clic para editar fecha">
        {value ? fmtDateDMY(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );

  return (
    <input ref={ref} type="date" autoFocus
      className="rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      defaultValue={toDateInput(value)}
      onBlur={(e) => { setEditing(false); onSave(e.target.value ? new Date(e.target.value).toISOString() : null); }}
      onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }} />
  );
}

function SelectCell({ value, options, onSave }: { value: string | null; options: string[]; onSave: (v: string | null) => void }) {
  return (
    <select value={value ?? ""} onChange={(e) => onSave(e.target.value || null)}
      className="cursor-pointer rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function EstadoCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const style = value ? ESTADO_STYLES[value] : null;
  return (
    <select value={value ?? ""} onChange={(e) => onSave(e.target.value || null)}
      className={`cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium outline-none border-0 ${style ? `${style.bg} ${style.text}` : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
      <option value="">— Sin estado</option>
      {ESTADO_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

function PrioridadCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const style = value ? PRIORIDAD_STYLES[value] : null;
  return (
    <select value={value ?? ""} onChange={(e) => onSave(e.target.value || null)}
      className={`cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium outline-none border-0 ${style ? `${style.bg} ${style.text}` : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
      <option value="">— Sin prioridad</option>
      {PRIORIDAD_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

function TipoOperacionCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  return (
    <select value={value ?? ""} onChange={(e) => onSave(e.target.value || null)}
      className={`cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium outline-none border-0 ${value === "IMPORTACION" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
        value === "EXPORTACION" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" :
          "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        }`}>
      <option value="">— Tipo</option>
      <option value="IMPORTACION">Importación</option>
      <option value="EXPORTACION">Exportación</option>
    </select>
  );
}

function BLTrackingCell({ bookingBl, tracking, onSavebl, onSaveTracking }: {
  bookingBl: string | null;
  tracking: string | null;
  onSavebl: (v: string | null) => void;
  onSaveTracking: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftBl, setDraftBl] = useState(bookingBl ?? "");
  const [draftTrack, setDraftTrack] = useState(tracking ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const blRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) blRef.current?.focus(); }, [editing]);

  const save = () => {
    setEditing(false);
    onSavebl(draftBl.trim() || null);
    onSaveTracking(draftTrack.trim() || null);
  };

  if (!editing) {
    const display = [bookingBl, tracking].filter(Boolean).join(" / ") || null;
    return (
      <span
        tabIndex={0}
        className="block max-w-[180px] cursor-pointer truncate rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-1 focus:ring-blue-400"
        onClick={() => { setDraftBl(bookingBl ?? ""); setDraftTrack(tracking ?? ""); setEditing(true); }}
        onFocus={() => { setDraftBl(bookingBl ?? ""); setDraftTrack(tracking ?? ""); setEditing(true); }}
        title="Clic para editar">
        {display || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-0.5 min-w-[150px]"
      onBlur={(e) => { if (!wrapRef.current?.contains(e.relatedTarget as Node)) save(); }}>
      <input ref={blRef}
        className="rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
        placeholder="Booking / BL"
        value={draftBl} onChange={(e) => setDraftBl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />
      <input
        className="rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
        placeholder="Tracking"
        value={draftTrack} onChange={(e) => setDraftTrack(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />
    </div>
  );
}

function ActualizacionCell({ remesa, bl, poliza, factura, onToggle }: {
  remesa: boolean; bl: boolean; poliza: boolean; factura: boolean;
  onToggle: (k: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida" | "factura", v: boolean) => void;
}) {
  const items: { key: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida" | "factura"; label: string; value: boolean }[] = [
    { key: "remesaNotificado", label: "Packing List", value: remesa },
    { key: "blTelexReleased", label: "BL Telex", value: bl },
    { key: "polizaSeguroRecibida", label: "Póliza", value: poliza },
    { key: "factura", label: "Factura", value: factura },
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((it) => (
        <button key={it.key} onClick={() => onToggle(it.key, !it.value)}
          className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${it.value
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"}`}>
          <span>{it.value ? "✓" : "✗"}</span>
          <span className="whitespace-nowrap">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Log drawer ───────────────────────────────────────────────────────────────

function LogDrawer({ seguimientoId, onClose }: { seguimientoId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCol, setFiltroCol] = useState<string>("seguimiento");

  useEffect(() => {
    apiFetch<Log[]>(`/api/v1/import-export/${seguimientoId}/logs`)
      .then(setLogs).catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [seguimientoId]);

  const colsEnLogs = Array.from(new Set(logs.map((l) => l.campoKey)));
  const opcionesCol = [
    { key: "seguimiento", label: "Seguimiento" },
    ...colsEnLogs.filter((k) => k !== "seguimiento").map((k) => ({ key: k, label: CAMPO_LABELS_DISPLAY[k] ?? k })),
  ];
  const logsVisibles = filtroCol === "__all__" ? logs : logs.filter((l) => l.campoKey === filtroCol);

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Historial de cambios</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        {!loading && logs.length > 0 && (
          <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
            <select value={filtroCol} onChange={(e) => setFiltroCol(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
              {opcionesCol.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              <option value="__all__">Todas las columnas</option>
            </select>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : logsVisibles.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-sm text-gray-400">
            Sin cambios registrados{filtroCol !== "__all__" ? " para esta columna" : ""}.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {logsVisibles.map((l) => (
              <li key={l.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{l.campo}</span>
                  <span className="text-xs text-gray-400">{fmtDateDMY(l.fecha)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-gray-400">Anterior</p><p className="mt-0.5 truncate text-gray-600 dark:text-gray-300">{l.valorAnterior ?? "—"}</p></div>
                  <div><p className="text-gray-400">Nuevo</p><p className="mt-0.5 truncate font-medium text-gray-800 dark:text-white">{l.valorNuevo ?? "—"}</p></div>
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

// ─── Export helpers ───────────────────────────────────────────────────────────

type ExportCol = { label: string; get: (r: Seguimiento) => string };

const EXPORT_COLS: ExportCol[] = [
  { label: "Tipo Operación", get: (r) => r.tipoOperacion ?? "" },
  { label: "Estado", get: (r) => r.estado ?? "" },
  { label: "# OC", get: (r) => r.numeroOC ?? r.ordenCompraCotizacion ?? "" },
  { label: "Prioridad", get: (r) => r.prioridad ?? "" },
  { label: "Seguimiento", get: (r) => r.seguimiento ?? "" },
  { label: "Detalles", get: (r) => r.detalles ?? "" },
  { label: "Cotización", get: (r) => r.nombreCotizacion },
  { label: "Solicitante", get: (r) => r.solicitante ?? "" },
  { label: "Proyecto", get: (r) => r.proyecto ?? "" },
  { label: "Descripción", get: (r) => r.descripcionProducto },
  { label: "Proveedor", get: (r) => r.proveedor ?? "" },
  { label: "Marca / Modelo", get: (r) => r.marcaModelo ?? "" },
  { label: "Nombre Material", get: (r) => r.nombreMaterial ?? "" },
  { label: "Tipo Import/Export", get: (r) => r.tipoImportacion ?? "" },
  { label: "País Origen", get: (r) => r.paisOrigenEdit ?? r.paisOrigen ?? "" },
  { label: "Destino", get: (r) => r.destino ?? "" },
  { label: "Incoterms", get: (r) => r.incoterms ?? r.tipoEntrega ?? "" },
  { label: "Términos Pago", get: (r) => r.terminosPago ?? "" },
  { label: "Forma Pago", get: (r) => r.formaPago ?? "" },
  { label: "Tipo Transporte", get: (r) => r.tipoTransporte ?? r.medioTransporte ?? "" },
  { label: "Tipo Embarque", get: (r) => r.tipoEmbarque ?? "" },
  { label: "BL / Tracking", get: (r) => [r.bookingBl, r.tracking].filter(Boolean).join(" / ") },
  { label: "Packing List", get: (r) => r.remesaNotificado ? "Sí" : "No" },
  { label: "BL Telex Released", get: (r) => r.blTelexReleased ? "Sí" : "No" },
  { label: "Póliza Seguro", get: (r) => r.polizaSeguroRecibida ? "Sí" : "No" },
  { label: "Factura", get: (r) => r.factura ? "Sí" : "No" },
  { label: "Puerto Origen", get: (r) => r.puertoSalida ?? "" },
  { label: "Puerto Destino", get: (r) => r.puertoLlegada ?? "" },
  { label: "Agente Aduanal", get: (r) => r.agenteAduanal ?? "" },
  { label: "Naviera / Forwarder", get: (r) => r.naviera ?? "" },
  { label: "Contenedor", get: (r) => r.contenedor ?? "" },
  { label: "F. OC", get: (r) => fmtDateDMY(r.fechaOc) },
  { label: "F. Listo Emb.", get: (r) => fmtDateDMY(r.fechaListoEmbarque) },
  { label: "F. ETD", get: (r) => fmtDateDMY(r.fechaEmbarque) },
  { label: "F. ETA", get: (r) => fmtDateDMY(r.fechaLlegadaPuerto) },
  { label: "F. de Manifiesto", get: (r) => fmtDateDMY(r.fechaRetiroPuerto) },
  { label: "F. Emis. Boletín Imp.", get: (r) => fmtDateDMY(r.fechaEmisionBoletinImpuesto) },
  { label: "F. Pago Boletín", get: (r) => fmtDateDMY(r.fechaPagoBoletin) },
  { label: "F. Selectivo", get: (r) => fmtDateDMY(r.fechaSelectivo) },
  { label: "F. Revisión", get: (r) => fmtDateDMY(r.fechaRevision) },
  { label: "F. Levante", get: (r) => fmtDateDMY(r.fechaLevante) },
  { label: "F. Gate Pass", get: (r) => fmtDateDMY(r.fechaGatePass) },
  { label: "F. Entrega Final", get: (r) => fmtDateDMY(r.fechaEntregaFinal) },
  { label: "T. Entrega (Gate-Manif.)", get: (r) => calcDiasEntrega(r) },
  { label: "Observaciones", get: (r) => r.observaciones ?? "" },
];

const ESTADO_COL_IDX = EXPORT_COLS.findIndex((c) => c.label === "Estado");
const PRIORIDAD_COL_IDX = EXPORT_COLS.findIndex((c) => c.label === "Prioridad");

function exportExcel(rows: Seguimiento[]) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    EXPORT_COLS.map((c) => c.label),
    ...rows.map((r) => EXPORT_COLS.map((c) => c.get(r))),
  ]);

  ws["!cols"] = EXPORT_COLS.map(() => ({ wch: 18 }));

  rows.forEach((r, rowIdx) => {
    // Estado color
    const estado = r.estado;
    if (estado && ESTADO_RGB[estado]) {
      const [red, green, blue] = ESTADO_RGB[estado];
      const hex = ((red << 16) | (green << 8) | blue).toString(16).padStart(6, "0");
      const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: ESTADO_COL_IDX });
      if (!ws[addr]) ws[addr] = { t: "s", v: estado };
      ws[addr].s = { fill: { patternType: "solid", fgColor: { rgb: hex } }, font: { bold: true } };
    }
    // Prioridad color
    const prioridad = r.prioridad;
    if (prioridad && PRIORIDAD_RGB[prioridad]) {
      const [red, green, blue] = PRIORIDAD_RGB[prioridad];
      const hex = ((red << 16) | (green << 8) | blue).toString(16).padStart(6, "0");
      const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: PRIORIDAD_COL_IDX });
      if (!ws[addr]) ws[addr] = { t: "s", v: prioridad };
      ws[addr].s = { fill: { patternType: "solid", fgColor: { rgb: hex } }, font: { bold: true } };
    }
    // Actualizacion indicators
    const actCols = [
      { key: "remesaNotificado",     idx: EXPORT_COLS.findIndex((c) => c.label === "Packing List") },
      { key: "blTelexReleased",      idx: EXPORT_COLS.findIndex((c) => c.label === "BL Telex Released") },
      { key: "polizaSeguroRecibida", idx: EXPORT_COLS.findIndex((c) => c.label === "Póliza Seguro") },
      { key: "factura",              idx: EXPORT_COLS.findIndex((c) => c.label === "Factura") },
    ];
    actCols.forEach(({ key, idx }) => {
      const addr = XLSX.utils.encode_cell({ r: rowIdx + 1, c: idx });
      const val = (r as any)[key] as boolean;
      if (!ws[addr]) ws[addr] = { t: "s", v: val ? "Sí" : "No" };
      ws[addr].s = {
        fill: { patternType: "solid", fgColor: { rgb: val ? "a7f3d0" : "fecaca" } },
        font: { color: { rgb: val ? "065f46" : "991b1b" } },
      };
    });
  });

  XLSX.utils.book_append_sheet(wb, ws, "Import-Export");
  XLSX.writeFile(wb, `ImportExport_${todayISO()}.xlsx`);
}

function exportPDF(rows: Seguimiento[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a2" });
  doc.setFontSize(12);
  doc.text(`Import-Export — ${todayISO()}`, 40, 30);

  const body = rows.map((r) => EXPORT_COLS.map((c) => c.get(r)));

  autoTable(doc, {
    head: [EXPORT_COLS.map((c) => c.label)],
    body,
    startY: 45,
    styles: { fontSize: 5.5, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell(data) {
      if (data.section !== "body") return;
      if (data.column.index === ESTADO_COL_IDX) {
        const rgb = ESTADO_RGB[data.cell.raw as string];
        if (rgb) { data.cell.styles.fillColor = rgb; data.cell.styles.fontStyle = "bold"; }
      }
      if (data.column.index === PRIORIDAD_COL_IDX) {
        const rgb = PRIORIDAD_RGB[data.cell.raw as string];
        if (rgb) { data.cell.styles.fillColor = rgb; data.cell.styles.fontStyle = "bold"; }
      }
      const actIdxs = [
        EXPORT_COLS.findIndex((c) => c.label === "Packing List"),
        EXPORT_COLS.findIndex((c) => c.label === "BL Telex Released"),
        EXPORT_COLS.findIndex((c) => c.label === "Póliza Seguro"),
        EXPORT_COLS.findIndex((c) => c.label === "Factura"),
      ];
      if (actIdxs.includes(data.column.index)) {
        const val = data.cell.raw as string;
        data.cell.styles.fillColor = val === "Sí" ? [167, 243, 208] : [254, 202, 202];
        data.cell.styles.textColor = val === "Sí" ? [6, 95, 70] : [153, 27, 27];
      }
    },
  });

  doc.save(`ImportExport_${todayISO()}.pdf`);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImportExport() {
  const [rows, setRows] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [logId, setLogId] = useState<string | null>(null);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [searchCol, setSearchCol] = useState("nombreCotizacion");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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

  const actualizarCampo = async (id: string, campo: string, valor: string | boolean | null) => {
    setSaving(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor as any } : r)));
    try {
      await apiFetch(`/api/v1/import-export/${id}`, { method: "PATCH", body: JSON.stringify({ [campo]: valor }) });
    } catch (e: any) {
      setError(e.message || "Error al guardar");
      fetchData();
    } finally {
      setSaving(null);
    }
  };

  const filtered = rows.filter((r) => {
    if (desde) { const d = new Date(r.fechaSolicitud); if (d < new Date(desde)) return false; }
    if (hasta) { const d = new Date(r.fechaSolicitud); const h = new Date(hasta); h.setHours(23, 59, 59); if (d > h) return false; }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const val = (r as any)[searchCol];
      if (!val || !String(val).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const colLabel = SEARCH_COLUMNS.find((c) => c.key === searchCol)?.label ?? "columna";

  return (
    <>
      <PageMeta title="Import-Export" description="Seguimiento de importaciones" />
      <div className="p-4">

        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Import-Export</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seguimiento de cotizaciones internacionales</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportExcel(filtered)} disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Excel
            </button>
            <button onClick={() => exportPDF(filtered)} disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-40 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 18 15 15" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {/* Toolbar filtros */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
            <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
            <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Buscar por</label>
            <select value={searchCol} onChange={(e) => { setSearchCol(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {SEARCH_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Valor</label>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder={`Filtrar por ${colLabel}...`}
              className="w-52 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          {(desde || hasta || searchQuery) && (
            <button onClick={() => { setDesde(""); setHasta(""); setSearchQuery(""); setPage(1); }}
              className="self-end rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400">
              Limpiar
            </button>
          )}
          <div className="ml-auto flex items-center gap-2 self-end">
            <label className="text-xs text-gray-500 dark:text-gray-400">Filas por página</label>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-xs text-gray-400">{filtered.length} total</span>
            <button onClick={fetchData} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">↻</button>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}<button onClick={() => setError(null)} className="float-right text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Tabla */}
        <div className="flex gap-0 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

          {/* Columna fija historial */}
          <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-[37px] items-center justify-center border-b border-gray-200 px-2 dark:border-gray-700">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Log</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20 px-3">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              paginated.map((r) => (
                <div key={r.id} className={`flex items-center justify-center border-b border-gray-100 px-2 py-1.5 dark:border-gray-800 ${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`} style={{ height: "48px" }}>
                  <button onClick={() => setLogId(r.id)} title="Ver historial de cambios"
                    className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400">
                    <History className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Tabla scrolleable */}
          <div className="flex-1 overflow-x-auto bg-white dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500">Sin cotizaciones internacionales en estado "Comprado" todavía.</div>
            ) : (
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left">
                    <Th>TIPO OPER.</Th><Th>ESTADO</Th><Th># OC</Th><Th>PRIORIDAD</Th>
                    <Th>SEGUIMIENTO</Th><Th>DETALLES</Th>
                    <Th>COTIZACION</Th><Th>SOLICITANTE</Th><Th>PROYECTO</Th><Th>DESCRIPCION</Th>
                    <Th>PROVEEDOR</Th><Th>MARCA / MODELO</Th><Th>NOMBRE MATERIAL</Th>
                    <Th>TIPO IMP/EXP</Th><Th>PAIS ORIGEN</Th><Th>DESTINO</Th>
                    <Th>INCOTERMS</Th><Th>TERMINOS PAGO</Th><Th>FORMA PAGO</Th>
                    <Th>TIPO TRANSP.</Th><Th>TIPO EMBARQUE</Th>
                    <Th>BL / TRACKING</Th><Th>ACTUALIZACION</Th>
                    <Th>PUERTO ORIGEN</Th><Th>PUERTO DESTINO</Th>
                    <Th>AGENTE ADUANAL</Th><Th>NAVIERA / FORWARDER</Th><Th>CONTENEDOR</Th>
                    <Th>F. OC</Th><Th>F. LISTO EMB.</Th><Th>F. ETD</Th><Th>F. ETA</Th>
                    <Th>F. MANIFIESTO</Th><Th>F. EMIS. BOLETIN IMP.</Th>
                    <Th>F. PAGO BOLETIN</Th><Th>F. SELECTIVO</Th>
                    <Th>F. REVISION</Th><Th>F. LEVANTE</Th>
                    <Th>F. GATE PASS</Th><Th>F. ENTREGA FINAL</Th>
                    <Th>T. ENTREGA (GATE-MANIF.)</Th>
                    <Th>OBSERVACIONES</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((r) => {
                    const estadoStyle = r.estado ? ESTADO_STYLES[r.estado] : null;
                    const prioridadStyle = r.prioridad ? PRIORIDAD_STYLES[r.prioridad] : null;
                    const tipoOpBg =
                      r.tipoOperacion === "IMPORTACION" ? "bg-indigo-50 dark:bg-indigo-900/10" :
                        r.tipoOperacion === "EXPORTACION" ? "bg-teal-50 dark:bg-teal-900/10" : "";
                    return (
                      <tr key={r.id} style={{ height: "48px" }}
                        className={`${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
                        <td className={`whitespace-nowrap px-2 py-1.5 align-middle text-xs ${tipoOpBg}`}>
                          <TipoOperacionCell value={r.tipoOperacion} onSave={(v) => actualizarCampo(r.id, "tipoOperacion", v)} />
                        </td>
                        <td className={`whitespace-nowrap px-2 py-1.5 align-middle text-xs ${estadoStyle ? `${estadoStyle.bg} ${estadoStyle.text}` : ""}`}>
                          <EstadoCell value={r.estado} onSave={(v) => actualizarCampo(r.id, "estado", v)} />
                        </td>
                        <Td><TextCell value={r.numeroOC || r.ordenCompraCotizacion} onSave={(v) => actualizarCampo(r.id, "numeroOC", v)} /></Td>
                        <td className={`whitespace-nowrap px-2 py-1.5 align-middle text-xs ${prioridadStyle ? `${prioridadStyle.bg} ${prioridadStyle.text}` : ""}`}>
                          <PrioridadCell value={r.prioridad} onSave={(v) => actualizarCampo(r.id, "prioridad", v)} />
                        </td>
                        <Td><LongTextCell value={r.seguimiento} onSave={(v) => actualizarCampo(r.id, "seguimiento", v)} label="Seguimiento" /></Td>
                        <Td><LongTextCell value={r.detalles} onSave={(v) => actualizarCampo(r.id, "detalles", v)} label="Detalles" /></Td>
                        <Td><span className="block max-w-[140px] truncate" title={r.nombreCotizacion}>{r.nombreCotizacion}</span></Td>
                        <Td>{r.solicitante || "—"}</Td>
                        <Td>{r.proyecto || "—"}</Td>
                        <Td><span className="block max-w-[200px] truncate" title={r.descripcionProducto}>{r.descripcionProducto}</span></Td>
                        <Td><TextCell value={r.proveedor} onSave={(v) => actualizarCampo(r.id, "proveedor", v)} /></Td>
                        <Td><TextCell value={r.marcaModelo} onSave={(v) => actualizarCampo(r.id, "marcaModelo", v)} /></Td>
                        <Td><TextCell value={r.nombreMaterial} onSave={(v) => actualizarCampo(r.id, "nombreMaterial", v)} /></Td>
                        <Td><SelectCell value={r.tipoImportacion} options={TIPO_IMPORTACION_OPTIONS} onSave={(v) => actualizarCampo(r.id, "tipoImportacion", v)} /></Td>
                        <Td><TextCell value={r.paisOrigenEdit ?? r.paisOrigen} onSave={(v) => actualizarCampo(r.id, "paisOrigenEdit", v)} /></Td>
                        <Td><TextCell value={r.destino} onSave={(v) => actualizarCampo(r.id, "destino", v)} /></Td>
                        <Td><TextCell value={r.incoterms || r.tipoEntrega} onSave={(v) => actualizarCampo(r.id, "incoterms", v)} /></Td>
                        <Td><TextCell value={r.terminosPago} onSave={(v) => actualizarCampo(r.id, "terminosPago", v)} /></Td>
                        <Td><TextCell value={r.formaPago} onSave={(v) => actualizarCampo(r.id, "formaPago", v)} /></Td>
                        <Td><TextCell value={r.tipoTransporte || r.medioTransporte} onSave={(v) => actualizarCampo(r.id, "tipoTransporte", v)} /></Td>
                        <Td><SelectCell value={r.tipoEmbarque} options={TIPO_EMBARQUE_OPTIONS} onSave={(v) => actualizarCampo(r.id, "tipoEmbarque", v)} /></Td>
                        <Td><TextCell value={r.bookingBl} onSave={(v) => actualizarCampo(r.id, "bookingBl", v)} minWidth="120px" /></Td>
                        <Td>
                          <ActualizacionCell remesa={r.remesaNotificado} bl={r.blTelexReleased} poliza={r.polizaSeguroRecibida} factura={r.factura}
                            onToggle={(k, v) => actualizarCampo(r.id, k, v)} />
                        </Td>
                        <Td><TextCell value={r.puertoSalida} onSave={(v) => actualizarCampo(r.id, "puertoSalida", v)} /></Td>
                        <Td><TextCell value={r.puertoLlegada} onSave={(v) => actualizarCampo(r.id, "puertoLlegada", v)} /></Td>
                        <Td><TextCell value={r.agenteAduanal} onSave={(v) => actualizarCampo(r.id, "agenteAduanal", v)} /></Td>
                        <Td><TextCell value={r.naviera} onSave={(v) => actualizarCampo(r.id, "naviera", v)} /></Td>
                        <Td><TextCell value={r.contenedor} onSave={(v) => actualizarCampo(r.id, "contenedor", v)} /></Td>
                        <Td><DateCell value={r.fechaOc} onSave={(v) => actualizarCampo(r.id, "fechaOc", v)} /></Td>
                        <Td><DateCell value={r.fechaListoEmbarque} onSave={(v) => actualizarCampo(r.id, "fechaListoEmbarque", v)} /></Td>
                        <Td><DateCell value={r.fechaEmbarque} onSave={(v) => actualizarCampo(r.id, "fechaEmbarque", v)} /></Td>
                        <Td><DateCell value={r.fechaLlegadaPuerto} onSave={(v) => actualizarCampo(r.id, "fechaLlegadaPuerto", v)} /></Td>
                        <Td><DateCell value={r.fechaRetiroPuerto} onSave={(v) => actualizarCampo(r.id, "fechaRetiroPuerto", v)} /></Td>
                        <Td><DateCell value={r.fechaEmisionBoletinImpuesto} onSave={(v) => actualizarCampo(r.id, "fechaEmisionBoletinImpuesto", v)} /></Td>
                        <Td><DateCell value={r.fechaPagoBoletin} onSave={(v) => actualizarCampo(r.id, "fechaPagoBoletin", v)} /></Td>
                        <Td><DateCell value={r.fechaSelectivo} onSave={(v) => actualizarCampo(r.id, "fechaSelectivo", v)} /></Td>
                        <Td><DateCell value={r.fechaRevision} onSave={(v) => actualizarCampo(r.id, "fechaRevision", v)} /></Td>
                        <Td><DateCell value={r.fechaLevante} onSave={(v) => actualizarCampo(r.id, "fechaLevante", v)} /></Td>
                        <Td><DateCell value={r.fechaGatePass} onSave={(v) => actualizarCampo(r.id, "fechaGatePass", v)} /></Td>
                        <Td><DateCell value={r.fechaEntregaFinal} onSave={(v) => actualizarCampo(r.id, "fechaEntregaFinal", v)} /></Td>
                        <Td><span className="block whitespace-nowrap px-1 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">{calcDiasEntrega(r)}</span></Td>
                        <Td><TextCell value={r.observaciones} onSave={(v) => actualizarCampo(r.id, "observaciones", v)} minWidth="160px" /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400" title="Primera">«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400">‹</button>

            {(() => {
              const pages: (number | "…")[] = [];
              if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
              else {
                pages.push(1);
                if (safePage > 3) pages.push("…");
                for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
                if (safePage < totalPages - 2) pages.push("…");
                pages.push(totalPages);
              }
              return pages.map((p, i) =>
                p === "…" ? <span key={`e${i}`} className="px-1 text-xs text-gray-400">…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                    className={`min-w-[32px] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${p === safePage ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
                    {p}
                  </button>
              );
            })()}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400">›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400" title="Última">»</button>

            <span className="ml-3 text-xs text-gray-400">
              Página {safePage} de {totalPages} · {filtered.length} registros
            </span>
          </div>
        )}

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
