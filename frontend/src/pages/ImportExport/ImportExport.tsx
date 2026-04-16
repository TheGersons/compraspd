import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Seguimiento = {
  id: string;
  cotizacionId: string;
  // Auto
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
  // Editables texto
  proveedor: string | null;
  marcaModelo: string | null;
  nombreMaterial: string | null;
  numeroOC: string | null;
  tipoImportacion: string | null;
  destino: string | null;
  estado: string | null;
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
  // Fechas
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
  // ACTUALIZACION
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

// dd/mm/yyyy display
function fmtDateDMY(d: string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <span
        style={{ minWidth }}
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => {
          setDraft(value ?? "");
          setEditing(true);
        }}
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
      onBlur={() => {
        setEditing(false);
        onSave(draft.trim() || null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setEditing(false);
          onSave(draft.trim() || null);
        }
        if (e.key === "Escape") {
          setEditing(false);
          setDraft(value ?? "");
        }
      }}
    />
  );
}

function DateCell({
  value,
  onSave,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.showPicker?.();
  }, [editing]);

  if (!editing) {
    return (
      <span
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => setEditing(true)}
        title="Clic para editar fecha"
      >
        {value ? (
          fmtDateDMY(value)
        ) : (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        )}
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
      onKeyDown={(e) => {
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

function ActualizacionCell({
  remesa,
  bl,
  poliza,
  onToggle,
}: {
  remesa: boolean;
  bl: boolean;
  poliza: boolean;
  onToggle: (campo: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida", value: boolean) => void;
}) {
  const items: { key: "remesaNotificado" | "blTelexReleased" | "polizaSeguroRecibida"; label: string; value: boolean }[] = [
    { key: "remesaNotificado", label: "Remesa Notificado", value: remesa },
    { key: "blTelexReleased", label: "BL Telex Released", value: bl },
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
          title={`Clic para marcar como ${it.value ? "pendiente" : "recibido"}`}
        >
          <span>{it.value ? "✓" : "✗"}</span>
          <span className="whitespace-nowrap">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Log drawer ──────────────────────────────────────────────────────────────

function LogDrawer({
  seguimientoId,
  onClose,
}: {
  seguimientoId: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Log[]>(`/api/v1/import-export/${seguimientoId}/logs`)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [seguimientoId]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            Seguimiento — Historial de cambios
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
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
                  <span className="text-xs text-gray-400">
                    {fmtDateDMY(l.fecha)}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400">Anterior</p>
                    <p className="mt-0.5 truncate text-gray-600 dark:text-gray-300">
                      {l.valorAnterior ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Nuevo</p>
                    <p className="mt-0.5 truncate font-medium text-gray-800 dark:text-white">
                      {l.valorNuevo ?? "—"}
                    </p>
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
  const [rows, setRows] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [logId, setLogId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actualizarCampo = async (
    id: string,
    campo: string,
    valor: string | number | boolean | null,
  ) => {
    setSaving(id);
    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [campo]: valor as any } : r)),
    );
    try {
      await apiFetch(`/api/v1/import-export/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [campo]: valor }),
      });
    } catch (e: any) {
      setError(e.message || "Error al guardar");
      // Reload on error
      fetchData();
    } finally {
      setSaving(null);
    }
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.nombreCotizacion.toLowerCase().includes(q) ||
      (r.proveedor ?? "").toLowerCase().includes(q) ||
      (r.numeroOC ?? r.ordenCompraCotizacion ?? "").toLowerCase().includes(q) ||
      (r.descripcionProducto ?? "").toLowerCase().includes(q) ||
      (r.bookingBl ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageMeta title="Import-Export" description="Seguimiento de importaciones" />
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import-Export
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Seguimiento de cotizaciones internacionales en proceso de
              importación (FR-CO-16)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cotización, proveedor, OC, BL..."
              className="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={fetchData}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              ↻ Recargar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
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
                  <Th>ESTADO</Th>
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
                    className={`${saving === r.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                  >
                    <Td>
                      <button
                        onClick={() => setLogId(r.id)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        title="Ver historial de cambios"
                      >
                        📋 Historial
                      </button>
                    </Td>
                    <Td>
                      <ActualizacionCell
                        remesa={r.remesaNotificado}
                        bl={r.blTelexReleased}
                        poliza={r.polizaSeguroRecibida}
                        onToggle={(k, v) => actualizarCampo(r.id, k, v)}
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
                      <span
                        className="block max-w-[200px] truncate"
                        title={r.descripcionProducto}
                      >
                        {r.descripcionProducto}
                      </span>
                    </Td>
                    <Td>
                      <TextCell
                        value={r.proveedor}
                        onSave={(v) => actualizarCampo(r.id, "proveedor", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.marcaModelo}
                        onSave={(v) => actualizarCampo(r.id, "marcaModelo", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.nombreMaterial}
                        onSave={(v) => actualizarCampo(r.id, "nombreMaterial", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.numeroOC || r.ordenCompraCotizacion}
                        onSave={(v) => actualizarCampo(r.id, "numeroOC", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.tipoImportacion}
                        onSave={(v) => actualizarCampo(r.id, "tipoImportacion", v)}
                      />
                    </Td>
                    <Td>{r.paisOrigen || "—"}</Td>
                    <Td>
                      <TextCell
                        value={r.destino}
                        onSave={(v) => actualizarCampo(r.id, "destino", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.estado}
                        onSave={(v) => actualizarCampo(r.id, "estado", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.incoterms || r.tipoEntrega}
                        onSave={(v) => actualizarCampo(r.id, "incoterms", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.terminosPago}
                        onSave={(v) => actualizarCampo(r.id, "terminosPago", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.formaPago}
                        onSave={(v) => actualizarCampo(r.id, "formaPago", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.tipoTransporte || r.medioTransporte}
                        onSave={(v) => actualizarCampo(r.id, "tipoTransporte", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.bookingBl}
                        onSave={(v) => actualizarCampo(r.id, "bookingBl", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.tracking}
                        onSave={(v) => actualizarCampo(r.id, "tracking", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.puertoSalida}
                        onSave={(v) => actualizarCampo(r.id, "puertoSalida", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.puertoLlegada}
                        onSave={(v) => actualizarCampo(r.id, "puertoLlegada", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.agenteAduanal}
                        onSave={(v) => actualizarCampo(r.id, "agenteAduanal", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.naviera}
                        onSave={(v) => actualizarCampo(r.id, "naviera", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.contenedor}
                        onSave={(v) => actualizarCampo(r.id, "contenedor", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaOc}
                        onSave={(v) => actualizarCampo(r.id, "fechaOc", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaFabricacion}
                        onSave={(v) => actualizarCampo(r.id, "fechaFabricacion", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaListoEmbarque}
                        onSave={(v) => actualizarCampo(r.id, "fechaListoEmbarque", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaEmbarque}
                        onSave={(v) => actualizarCampo(r.id, "fechaEmbarque", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaLlegadaPuerto}
                        onSave={(v) => actualizarCampo(r.id, "fechaLlegadaPuerto", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaRetiroPuerto}
                        onSave={(v) => actualizarCampo(r.id, "fechaRetiroPuerto", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaLiberacionAduana}
                        onSave={(v) => actualizarCampo(r.id, "fechaLiberacionAduana", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaEntregaFinal}
                        onSave={(v) => actualizarCampo(r.id, "fechaEntregaFinal", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaPagoProveedor}
                        onSave={(v) => actualizarCampo(r.id, "fechaPagoProveedor", v)}
                      />
                    </Td>
                    <Td>
                      <DateCell
                        value={r.fechaDocumentosCompletos}
                        onSave={(v) => actualizarCampo(r.id, "fechaDocumentosCompletos", v)}
                      />
                    </Td>
                    <Td>
                      <TextCell
                        value={r.observaciones}
                        onSave={(v) => actualizarCampo(r.id, "observaciones", v)}
                        minWidth="160px"
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {logId && (
          <LogDrawer seguimientoId={logId} onClose={() => setLogId(null)} />
        )}
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
    <td className="whitespace-nowrap px-2 py-1.5 align-top text-xs text-gray-700 dark:text-gray-300">
      {children}
    </td>
  );
}
