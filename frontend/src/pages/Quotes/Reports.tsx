import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Reporte = {
  id: string;
  compraId: string;
  fechaSolicitud: string;
  nombreCotizacion: string;
  tipoCompra: string;
  solicitante: string | null;
  descripcionProducto: string;
  statusOC: string;
  numeroPO: string;
  proveedor: string | null;
  origen: string | null;
  epdEps: string | null;
  totalPrice: number | null;
  fechaContratoFirmado: string | null;
  terminosPago: string | null;
  observaciones: string | null;
  pago1: number | null;
  fechaPago1: string | null;
  pago2: number | null;
  fechaPago2: string | null;
  pago3: number | null;
  fechaPago3: string | null;
  pago4: number | null;
  fechaPago4: string | null;
  comentarios: string | null;
  totalPagado: number;
  saldoPendiente: number | null;
  statusPago: string;
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
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMoney(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);
}

function toDateInput(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const STATUS_OC: Record<string, { label: string; cls: string }> = {
  PENDIENTE:   { label: "Pendiente",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  COMPLETADA:  { label: "Completada",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

const STATUS_PAGO: Record<string, { label: string; cls: string }> = {
  SIN_PAGOS:     { label: "Sin pagos",      cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  PRIMER_PAGO:   { label: "1er pago",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  PAGO_PARCIAL:  { label: "Pago parcial",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  PAGO_COMPLETO: { label: "Pago completo",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

// ─── Inline cell editors ──────────────────────────────────────────────────────

function TextCell({ value, onSave, disabled }: { value: string | null; onSave: (v: string | null) => void; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  if (disabled) return <span className="text-gray-400 text-xs">{value || "—"}</span>;

  if (!editing) {
    return (
      <span
        className="block min-w-[80px] cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
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

function LongTextCell({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  return (
    <>
      <span
        className="block max-w-[160px] cursor-pointer truncate rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => { setDraft(value ?? ""); setOpen(true); }}
        title={value ?? "Clic para editar"}
      >
        {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Editar texto</h4>
            <textarea
              autoFocus
              className="h-40 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">Cancelar</button>
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

function MoneyCell({ value, onSave }: { value: number | null; onSave: (v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);

  if (!editing) {
    return (
      <span
        className="block cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => { setDraft(value != null ? String(value) : ""); setEditing(true); }}
        title="Clic para editar"
      >
        {value != null ? fmtMoney(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      min="0"
      className="w-28 rounded border border-blue-400 px-1.5 py-0.5 text-xs outline-none dark:bg-gray-700 dark:text-white"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); const n = parseFloat(draft); onSave(isNaN(n) ? null : n); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { setEditing(false); const n = parseFloat(draft); onSave(isNaN(n) ? null : n); }
        if (e.key === "Escape") { setEditing(false); setDraft(value != null ? String(value) : ""); }
      }}
    />
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
        {value ? fmtDate(value) : <span className="text-gray-300 dark:text-gray-600">—</span>}
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

// ─── Log drawer ───────────────────────────────────────────────────────────────

function LogDrawer({ reporteId, onClose }: { reporteId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Log[]>(`/api/v1/reportes/${reporteId}/logs`)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [reporteId]);

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
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
            <span className="text-3xl mb-2">📋</span>
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
                  <span className="text-xs text-gray-400">{fmtDate(l.fecha)}</span>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reports() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [logReporteId, setLogReporteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Reporte[]>("/api/v1/reportes");
      setReportes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = useCallback(async (reporteId: string, campo: string, valor: any) => {
    setSaving(reporteId);
    try {
      await apiFetch(`/api/v1/reportes/${reporteId}`, {
        method: "PATCH",
        body: JSON.stringify({ [campo]: valor }),
      });
      setReportes((prev) =>
        prev.map((r) => r.id === reporteId ? { ...r, [campo]: valor } : r)
      );
    } finally {
      setSaving(null);
    }
  }, []);

  // Recalcular campos derivados en cliente para feedback inmediato
  const withCalc = (r: Reporte): Reporte => {
    const pagos = [r.pago1, r.pago2, r.pago3, r.pago4].filter((p) => p != null) as number[];
    const totalPagado = pagos.reduce((a, b) => a + b, 0);
    const saldoPendiente = r.totalPrice != null ? r.totalPrice - totalPagado : null;
    let statusPago = "SIN_PAGOS";
    if (r.totalPrice != null && totalPagado >= r.totalPrice && r.totalPrice > 0) statusPago = "PAGO_COMPLETO";
    else if (totalPagado > 0) statusPago = pagos.length === 1 ? "PRIMER_PAGO" : "PAGO_PARCIAL";
    return { ...r, totalPagado, saldoPendiente, statusPago };
  };

  const filtered = reportes
    .map(withCalc)
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.nombreCotizacion?.toLowerCase().includes(q) ||
        r.numeroPO?.toLowerCase().includes(q) ||
        r.proveedor?.toLowerCase().includes(q) ||
        r.descripcionProducto?.toLowerCase().includes(q)
      );
    });

  const th = "sticky top-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300";
  const td = "border-b border-gray-100 px-3 py-2 align-top dark:border-gray-800";

  return (
    <>
      <PageMeta title="Reportes de Compras" description="Tabla de seguimiento y reporte de órdenes de compra" />

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
            Reportes de Compras
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Tabla de seguimiento de órdenes de compra — campos editables en línea
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, #PO, proveedor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search ? "Sin resultados para la búsqueda" : "No hay compras registradas aún"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Leyenda */}
          <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <span>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
              Celdas azules = editables
            </span>
            {saving && <span className="text-blue-500">Guardando…</span>}
          </div>

          {/* Tabla horizontal scrollable */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[2800px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className={`${th} w-[30px]`}></th>
                  <th className={th}>Fecha Solicitud</th>
                  <th className={th}>#PO</th>
                  <th className={th}>Proveedor</th>
                  <th className={th}>Origen</th>
                  <th className={th}>Descripción Producto</th>
                  <th className={th}>EPD/EPS</th>
                  <th className={th}>Status OC</th>
                  <th className={th}>Total Price</th>
                  <th className={th}>Fecha Contrato</th>
                  <th className={th}>Términos Pago</th>
                  <th className={th}>Observaciones</th>
                  <th className={th}>1er Pago</th>
                  <th className={th}>Fecha 1er Pago</th>
                  <th className={th}>2do Pago</th>
                  <th className={th}>Fecha 2do Pago</th>
                  <th className={th}>3er Pago</th>
                  <th className={th}>Fecha 3er Pago</th>
                  <th className={th}>4to Pago</th>
                  <th className={th}>Fecha 4to Pago</th>
                  <th className={th}>Total Pagado</th>
                  <th className={th}>Saldo Pendiente</th>
                  <th className={th}>Status Pago</th>
                  <th className={th}>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const ocCfg = STATUS_OC[r.statusOC] ?? { label: r.statusOC, cls: "bg-gray-100 text-gray-600" };
                  const pagoCfg = STATUS_PAGO[r.statusPago] ?? STATUS_PAGO.SIN_PAGOS;

                  return (
                    <tr key={r.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10">
                      {/* Log button */}
                      <td className={`${td} text-center`}>
                        <button
                          onClick={() => setLogReporteId(r.id)}
                          className="rounded p-1 text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          title="Ver historial de cambios"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </td>

                      {/* Fecha solicitud — auto */}
                      <td className={td}>
                        <span className="whitespace-nowrap text-xs text-gray-500">{fmtDate(r.fechaSolicitud)}</span>
                      </td>

                      {/* #PO — editable */}
                      <td className={td}>
                        <TextCell value={r.numeroPO} onSave={(v) => handleSave(r.id, "numeroPO", v ?? "-")} />
                      </td>

                      {/* Proveedor — editable */}
                      <td className={td}>
                        <TextCell value={r.proveedor} onSave={(v) => handleSave(r.id, "proveedor", v)} />
                      </td>

                      {/* Origen — editable */}
                      <td className={td}>
                        <TextCell value={r.origen} onSave={(v) => handleSave(r.id, "origen", v)} />
                      </td>

                      {/* Descripción — auto */}
                      <td className={td}>
                        <span className="block max-w-[200px] truncate text-xs text-gray-600 dark:text-gray-300" title={r.descripcionProducto}>
                          {r.descripcionProducto}
                        </span>
                      </td>

                      {/* EPD/EPS — editable */}
                      <td className={td}>
                        <TextCell value={r.epdEps} onSave={(v) => handleSave(r.id, "epdEps", v)} />
                      </td>

                      {/* Status OC — auto */}
                      <td className={td}>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ocCfg.cls}`}>
                          {ocCfg.label}
                        </span>
                      </td>

                      {/* Total Price — editable */}
                      <td className={td}>
                        <MoneyCell value={r.totalPrice} onSave={(v) => handleSave(r.id, "totalPrice", v)} />
                      </td>

                      {/* Fecha contrato — editable */}
                      <td className={td}>
                        <DateCell value={r.fechaContratoFirmado} onSave={(v) => handleSave(r.id, "fechaContratoFirmado", v)} />
                      </td>

                      {/* Términos pago — editable */}
                      <td className={td}>
                        <TextCell value={r.terminosPago} onSave={(v) => handleSave(r.id, "terminosPago", v)} />
                      </td>

                      {/* Observaciones — long text */}
                      <td className={td}>
                        <LongTextCell value={r.observaciones} onSave={(v) => handleSave(r.id, "observaciones", v)} />
                      </td>

                      {/* 1er Pago */}
                      <td className={td}>
                        <MoneyCell value={r.pago1} onSave={(v) => handleSave(r.id, "pago1", v)} />
                      </td>
                      <td className={td}>
                        <DateCell value={r.fechaPago1} onSave={(v) => handleSave(r.id, "fechaPago1", v)} />
                      </td>

                      {/* 2do Pago */}
                      <td className={td}>
                        <MoneyCell value={r.pago2} onSave={(v) => handleSave(r.id, "pago2", v)} />
                      </td>
                      <td className={td}>
                        <DateCell value={r.fechaPago2} onSave={(v) => handleSave(r.id, "fechaPago2", v)} />
                      </td>

                      {/* 3er Pago */}
                      <td className={td}>
                        <MoneyCell value={r.pago3} onSave={(v) => handleSave(r.id, "pago3", v)} />
                      </td>
                      <td className={td}>
                        <DateCell value={r.fechaPago3} onSave={(v) => handleSave(r.id, "fechaPago3", v)} />
                      </td>

                      {/* 4to Pago */}
                      <td className={td}>
                        <MoneyCell value={r.pago4} onSave={(v) => handleSave(r.id, "pago4", v)} />
                      </td>
                      <td className={td}>
                        <DateCell value={r.fechaPago4} onSave={(v) => handleSave(r.id, "fechaPago4", v)} />
                      </td>

                      {/* Total pagado — auto */}
                      <td className={td}>
                        <span className={`text-xs font-medium ${r.totalPagado > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                          {r.totalPagado > 0 ? fmtMoney(r.totalPagado) : "—"}
                        </span>
                      </td>

                      {/* Saldo pendiente — auto */}
                      <td className={td}>
                        <span className={`text-xs font-medium ${
                          r.saldoPendiente != null && r.saldoPendiente > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : r.saldoPendiente === 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400"
                        }`}>
                          {r.saldoPendiente != null ? fmtMoney(r.saldoPendiente) : "—"}
                        </span>
                      </td>

                      {/* Status pago — auto */}
                      <td className={td}>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pagoCfg.cls}`}>
                          {pagoCfg.label}
                        </span>
                      </td>

                      {/* Comentarios — long text */}
                      <td className={td}>
                        <LongTextCell value={r.comentarios} onSave={(v) => handleSave(r.id, "comentarios", v)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log drawer */}
      {logReporteId && (
        <LogDrawer reporteId={logReporteId} onClose={() => setLogReporteId(null)} />
      )}
    </>
  );
}
