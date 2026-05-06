import { useState, useEffect, useCallback, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { SearchableSelect } from "../../components/ui/searchable-select";
import { getToken } from "../../lib/api";
import { matchesSearch } from "../../utils/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductoRow = {
  id: string;
  cotizacionId: string;
  nombreCotizacion: string | null;
  estadoCotizacion: string | null;
  tipoCompra: string | null;
  fechaSolicitud: string | null;
  area: string | null;
  tipo: string | null;
  supervisorCotizacion: { id: string; nombre: string } | null;
  proyecto: { id: string; nombre: string } | null;
  ordenCompra: { id: string; nombre: string; numeroOC: string | null } | null;
  descripcion: string;
  cantidad: number | null;
  sku: string | null;
  proveedor: string | null;
  estatusActual: string;
  estadoGeneral: string;
  diasRetrasoActual: number;
  responsable: { id: string; nombre: string } | null;
  compraId: string | null;
};

type FiltrosData = {
  proyectos: { id: string; nombre: string }[];
  responsables: { id: string; nombre: string }[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}

function defaultDesde() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}
function defaultHasta() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Constantes de UI ────────────────────────────────────────────────────────

const ESTATUS_LABELS: Record<string, { label: string; cls: string }> = {
  recibido:                     { label: "Recibido",          cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  enCIF:                        { label: "En CIF",            cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  segundoSeguimiento:           { label: "2do Seguimiento",   cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" },
  conBL:                        { label: "Con BL",            cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  cotizacionFleteInternacional: { label: "Cot. Flete Int.",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  enFOB:                        { label: "En FOB",            cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  primerSeguimiento:            { label: "1er Seguimiento",   cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  aprobacionPlanos:             { label: "Aprob. Planos",     cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  pagado:                       { label: "Pagado",            cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  comprado:                     { label: "Comprado",          cls: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" },
  aprobacionCompra:             { label: "Aprob. Compra",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  conDescuento:                 { label: "Con Descuento",     cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  cotizado:                     { label: "Cotizado",          cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  pendiente:                    { label: "Pendiente",         cls: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" },
};

const ESTADO_COT: Record<string, { label: string; cls: string }> = {
  ENVIADA:          { label: "Enviada",       cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  PENDIENTE:        { label: "Pendiente",     cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  EN_CONFIGURACION: { label: "En config.",    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  APROBADA_PARCIAL: { label: "Aprob. parcial",cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  APROBADA:         { label: "Aprobada",      cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

const ESTADOS_GENERALES: Record<string, string> = {
  success: "border-l-2 border-emerald-400",
  warn:    "border-l-2 border-amber-400",
  danger:  "border-l-2 border-rose-400",
};

const ESTATUS_OPCIONES = [
  { value: "TODOS", label: "Todos los estatus" },
  ...Object.entries(ESTATUS_LABELS).map(([value, { label }]) => ({ value, label })),
];

const PAGE_SIZES = [15, 30, 50, 100] as const;

// ─── Sub-componentes simples ──────────────────────────────────────────────────

function EstatusBadge({ estatus }: { estatus: string }) {
  const cfg = ESTATUS_LABELS[estatus] ?? ESTATUS_LABELS.pendiente;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: string | null }) {
  if (!tipo) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>;
  const isInt = tipo === "INTERNACIONAL";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      isInt ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
             : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    }`}>
      {isInt ? "🌐" : "🏠"} {isInt ? "INT" : "NAC"}
    </span>
  );
}

function AtrasoCell({ dias }: { dias: number }) {
  if (dias <= 0) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      dias >= 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                 : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    }`}>
      +{dias}d
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReportesProductos() {
  // Datos del servidor
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [filtrosData, setFiltrosData] = useState<FiltrosData>({ proyectos: [], responsables: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros server-side
  const [desde, setDesde] = useState(defaultDesde());
  const [hasta, setHasta] = useState(defaultHasta());
  const [tipoCompra, setTipoCompra] = useState<"TODAS" | "NACIONAL" | "INTERNACIONAL">("TODAS");
  const [vista, setVista] = useState<"AMBOS" | "COTIZACION" | "COMPRA">("AMBOS");
  const [proyectoId, setProyectoId] = useState("TODOS");
  const [responsableId, setResponsableId] = useState("TODOS");

  // Filtros client-side
  const [searchProveedor, setSearchProveedor] = useState("");
  const [searchOC, setSearchOC] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("TODOS");

  // UI
  const [viewMode, setViewMode] = useState<"detalle" | "agrupada">("detalle");
  const [pageSize, setPageSize] = useState<typeof PAGE_SIZES[number]>(30);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Cargar opciones de filtro una sola vez
  useEffect(() => {
    apiFetch<FiltrosData>("/api/v1/reportes/productos/filtros")
      .then(setFiltrosData)
      .catch(() => {});
  }, []);

  // Fetch server-side
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (desde)         params.set("desde", desde);
      if (hasta)         params.set("hasta", hasta);
      if (tipoCompra !== "TODAS") params.set("tipoCompra", tipoCompra);
      if (vista !== "AMBOS")      params.set("vista", vista);
      if (proyectoId !== "TODOS") params.set("proyectoId", proyectoId);
      if (responsableId !== "TODOS") params.set("responsableId", responsableId);

      const data = await apiFetch<ProductoRow[]>(`/api/v1/reportes/productos?${params}`);
      setProductos(data);
      setPage(1);
    } catch (e: any) {
      const msg = e?.message === "403"
        ? "No tienes permiso para ver esta página."
        : `Error al cargar los datos (${e?.message ?? "desconocido"}). Verifica tu conexión.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, tipoCompra, vista, proyectoId, responsableId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filtros client-side
  const filtered = useMemo(() => {
    return productos.filter((r) => {
      if (filtroEstatus !== "TODOS" && r.estatusActual !== filtroEstatus) return false;
      if (searchProveedor && !matchesSearch(searchProveedor, r.proveedor)) return false;
      if (searchOC) {
        const ocText = r.ordenCompra ? `${r.ordenCompra.nombre} ${r.ordenCompra.numeroOC ?? ""}` : "";
        if (!matchesSearch(searchOC, ocText)) return false;
      }
      if (searchDesc && !matchesSearch(searchDesc, r.descripcion)) return false;
      return true;
    });
  }, [productos, filtroEstatus, searchProveedor, searchOC, searchDesc]);

  // Paginación (modo detalle)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Agrupado por cotización
  const grouped = useMemo(() => {
    const map = new Map<string, { cotizacionId: string; nombreCotizacion: string | null; estadoCotizacion: string | null; tipoCompra: string | null; fechaSolicitud: string | null; proyecto: ProductoRow["proyecto"]; supervisorCotizacion: ProductoRow["supervisorCotizacion"]; rows: ProductoRow[] }>();
    for (const r of filtered) {
      if (!map.has(r.cotizacionId)) {
        map.set(r.cotizacionId, {
          cotizacionId: r.cotizacionId,
          nombreCotizacion: r.nombreCotizacion,
          estadoCotizacion: r.estadoCotizacion,
          tipoCompra: r.tipoCompra,
          fechaSolicitud: r.fechaSolicitud,
          proyecto: r.proyecto,
          supervisorCotizacion: r.supervisorCotizacion,
          rows: [],
        });
      }
      map.get(r.cotizacionId)!.rows.push(r);
    }
    return Array.from(map.values());
  }, [filtered]);

  const totalPagesGrouped = Math.max(1, Math.ceil(grouped.length / pageSize));
  const safePageGrouped = Math.min(page, totalPagesGrouped);
  const paginatedGrouped = grouped.slice((safePageGrouped - 1) * pageSize, safePageGrouped * pageSize);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetFiltros = () => {
    setDesde(defaultDesde());
    setHasta(defaultHasta());
    setTipoCompra("TODAS");
    setVista("AMBOS");
    setProyectoId("TODOS");
    setResponsableId("TODOS");
    setSearchProveedor("");
    setSearchOC("");
    setSearchDesc("");
    setFiltroEstatus("TODOS");
    setPage(1);
  };

  // ─── Export ──────────────────────────────────────────────────────────────

  const exportExcel = () => {
    const rows = filtered.map((r) => ({
      "Tipo":         r.tipoCompra ?? "",
      "Cotización":   r.nombreCotizacion ?? "",
      "Proyecto":     r.proyecto?.nombre ?? "",
      "OC":           r.ordenCompra ? `${r.ordenCompra.nombre}${r.ordenCompra.numeroOC ? ` (${r.ordenCompra.numeroOC})` : ""}` : "",
      "Descripción":  r.descripcion,
      "SKU":          r.sku ?? "",
      "Cantidad":     r.cantidad ?? "",
      "Proveedor":    r.proveedor ?? "",
      "Estatus":      ESTATUS_LABELS[r.estatusActual]?.label ?? r.estatusActual,
      "Responsable":  r.responsable?.nombre ?? "",
      "Atraso (días)":r.diasRetrasoActual,
      "Fecha Solic.": r.fechaSolicitud ? new Date(r.fechaSolicitud).toLocaleDateString("es-HN") : "",
      "Estado Cot.":  ESTADO_COT[r.estadoCotizacion ?? ""]?.label ?? r.estadoCotizacion ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, `ReporteProductos_${defaultHasta()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
    doc.setFontSize(11);
    doc.text(`Reporte por Producto — ${defaultHasta()}`, 40, 30);
    const cols = ["Tipo", "Cotización", "Proyecto", "OC", "Descripción", "Proveedor", "Estatus", "Responsable", "Atraso"];
    autoTable(doc, {
      head: [cols],
      body: filtered.map((r) => [
        r.tipoCompra ?? "",
        r.nombreCotizacion ?? "",
        r.proyecto?.nombre ?? "",
        r.ordenCompra?.nombre ?? "",
        r.descripcion,
        r.proveedor ?? "",
        ESTATUS_LABELS[r.estatusActual]?.label ?? r.estatusActual,
        r.responsable?.nombre ?? "",
        r.diasRetrasoActual > 0 ? `+${r.diasRetrasoActual}d` : "",
      ]),
      startY: 45,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`ReporteProductos_${defaultHasta()}.pdf`);
  };

  // ─── Clases comunes ───────────────────────────────────────────────────────

  const th = "sticky top-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300";
  const td = "border-b border-gray-100 px-3 py-2 align-middle dark:border-gray-800";

  const activeRows = viewMode === "detalle" ? filtered.length : grouped.length;
  const activeTotalPages = viewMode === "detalle" ? totalPages : totalPagesGrouped;
  const activeSafePage = viewMode === "detalle" ? safePage : safePageGrouped;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title="Reporte por Producto" description="Seguimiento de productos en cotizaciones y compras" />

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
            Reporte por Producto
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Seguimiento por producto · cotizaciones y compras activas · sin logística
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Excel
          </button>
          <button
            onClick={exportPDF}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-40 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
            PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 space-y-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        {/* Fila 1: fechas + tipo + vista */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
            <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
            <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>

          {/* Tipo compra */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700/50">
            {(["TODAS", "NACIONAL", "INTERNACIONAL"] as const).map((opt) => (
              <button key={opt} onClick={() => { setTipoCompra(opt); setPage(1); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  tipoCompra === opt
                    ? opt === "NACIONAL" ? "bg-emerald-500 text-white shadow-sm"
                      : opt === "INTERNACIONAL" ? "bg-blue-500 text-white shadow-sm"
                      : "bg-white text-gray-700 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}>
                {opt === "TODAS" ? "Todas" : opt === "NACIONAL" ? "Nacional" : "Internacional"}
              </button>
            ))}
          </div>

          {/* Vista cotizacion/compra */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700/50">
            {(["AMBOS", "COTIZACION", "COMPRA"] as const).map((opt) => (
              <button key={opt} onClick={() => { setVista(opt); setPage(1); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  vista === opt
                    ? "bg-white text-gray-700 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}>
                {opt === "AMBOS" ? "Ambos" : opt === "COTIZACION" ? "Cotización" : "Compra"}
              </button>
            ))}
          </div>
        </div>

        {/* Fila 2: searchable selects + inputs de texto */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <SearchableSelect
              value={proyectoId}
              onChange={(v) => { setProyectoId(v); setPage(1); }}
              options={filtrosData.proyectos}
              allLabel="Todos los proyectos"
              allValue="TODOS"
              placeholder="Proyecto"
            />
          </div>
          <div className="w-48">
            <SearchableSelect
              value={responsableId}
              onChange={(v) => { setResponsableId(v); setPage(1); }}
              options={filtrosData.responsables}
              allLabel="Todos los responsables"
              allValue="TODOS"
              placeholder="Responsable"
            />
          </div>
          <input
            type="text" placeholder="Proveedor…" value={searchProveedor}
            onChange={(e) => { setSearchProveedor(e.target.value); setPage(1); }}
            className="w-36 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          />
          <input
            type="text" placeholder="OC…" value={searchOC}
            onChange={(e) => { setSearchOC(e.target.value); setPage(1); }}
            className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          />
          <input
            type="text" placeholder="Descripción…" value={searchDesc}
            onChange={(e) => { setSearchDesc(e.target.value); setPage(1); }}
            className="w-44 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
          />
          <select
            value={filtroEstatus}
            onChange={(e) => { setFiltroEstatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {ESTATUS_OPCIONES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Fila 3: controles de vista y paginación */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle vista */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700/50">
            <button onClick={() => { setViewMode("detalle"); setPage(1); }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "detalle" ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}>
              ≡ Detalle
            </button>
            <button onClick={() => { setViewMode("agrupada"); setPage(1); }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "agrupada" ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}>
              ⊞ Agrupada
            </button>
          </div>

          {/* Tamaño de página */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value) as typeof PAGE_SIZES[number]); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-gray-500 dark:text-gray-400">por página</span>
          </div>

          <button onClick={resetFiltros}
            className="ml-auto rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            Resetear
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-16 text-center dark:border-rose-800 dark:bg-rose-900/20">
          <span className="text-3xl mb-3">⚠️</span>
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
          <button onClick={fetchData}
            className="mt-4 rounded-lg border border-rose-300 px-4 py-2 text-xs text-rose-600 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-400">
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="text-4xl mb-3">📦</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay productos para los filtros seleccionados</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Leyenda */}
          <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <span>
              {activeRows === 0
                ? "0 registros"
                : `${(activeSafePage - 1) * pageSize + 1}–${Math.min(activeSafePage * pageSize, activeRows)} de ${activeRows} ${viewMode === "agrupada" ? "cotización" : "producto"}${activeRows !== 1 ? "s" : ""}`}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Recibido
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> En proceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> Atrasado
            </span>
          </div>

          <div className="overflow-x-auto">
            {viewMode === "detalle" ? (
              /* ── Vista Detalle ── */
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={th}>Tipo</th>
                    <th className={th}>Cotización</th>
                    <th className={th}>Proyecto</th>
                    <th className={th}>OC</th>
                    <th className={th}>Descripción</th>
                    <th className={th}>Proveedor</th>
                    <th className={th}>Estatus</th>
                    <th className={th}>Responsable</th>
                    <th className={th}>Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => (
                    <tr key={r.id}
                      className={`group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${ESTADOS_GENERALES[r.estadoGeneral] ?? ""}`}>
                      <td className={td}><TipoBadge tipo={r.tipoCompra} /></td>
                      <td className={td}>
                        <span className="block max-w-[180px] truncate text-xs font-medium text-gray-700 dark:text-gray-200" title={r.nombreCotizacion ?? ""}>
                          {r.nombreCotizacion || "—"}
                        </span>
                        {r.estadoCotizacion && (() => {
                          const cfg = ESTADO_COT[r.estadoCotizacion] ?? { label: r.estadoCotizacion, cls: "bg-gray-100 text-gray-600" };
                          return <span className={`mt-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
                        })()}
                      </td>
                      <td className={td}>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {r.proyecto?.nombre ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </span>
                      </td>
                      <td className={td}>
                        {r.ordenCompra ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{r.ordenCompra.nombre}</span>
                            {r.ordenCompra.numeroOC && <span className="text-xs text-gray-400">{r.ordenCompra.numeroOC}</span>}
                          </div>
                        ) : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className={td}>
                        <span className="block max-w-[220px] truncate text-xs text-gray-600 dark:text-gray-300" title={r.descripcion}>
                          {r.descripcion || "—"}
                          {r.cantidad != null && <span className="ml-1 text-gray-400">×{r.cantidad}</span>}
                        </span>
                        {r.sku && <span className="text-xs text-gray-400">{r.sku}</span>}
                      </td>
                      <td className={td}>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {r.proveedor || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </span>
                      </td>
                      <td className={td}><EstatusBadge estatus={r.estatusActual} /></td>
                      <td className={td}>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {r.responsable?.nombre ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </span>
                      </td>
                      <td className={td}><AtrasoCell dias={r.diasRetrasoActual} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* ── Vista Agrupada ── */
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={`${th} w-8`}></th>
                    <th className={th}>Cotización</th>
                    <th className={th}>Tipo</th>
                    <th className={th}>Proyecto</th>
                    <th className={th}># Productos</th>
                    <th className={th}>Proveedores</th>
                    <th className={th}>OC(s)</th>
                    <th className={th}>Responsable(s)</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Fecha Solic.</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGrouped.map((g) => {
                    const isOpen = expanded.has(g.cotizacionId);
                    const proveedores = [...new Set(g.rows.map((r) => r.proveedor).filter(Boolean))];
                    const ocs = [...new Map(g.rows.filter((r) => r.ordenCompra).map((r) => [r.ordenCompra!.id, r.ordenCompra!])).values()];
                    const responsables = [...new Map(g.rows.filter((r) => r.responsable).map((r) => [r.responsable!.id, r.responsable!])).values()];
                    const cotCfg = ESTADO_COT[g.estadoCotizacion ?? ""] ?? { label: g.estadoCotizacion ?? "—", cls: "bg-gray-100 text-gray-600" };

                    return [
                      <tr key={g.cotizacionId}
                        className="cursor-pointer bg-gray-50/50 hover:bg-blue-50/40 dark:bg-gray-800/30 dark:hover:bg-blue-900/10"
                        onClick={() => toggleExpanded(g.cotizacionId)}>
                        <td className={`${td} text-center`}>
                          <span className="text-gray-400 text-xs">{isOpen ? "▼" : "▶"}</span>
                        </td>
                        <td className={td}>
                          <span className="block max-w-[200px] truncate text-xs font-semibold text-gray-800 dark:text-white" title={g.nombreCotizacion ?? ""}>
                            {g.nombreCotizacion || "—"}
                          </span>
                        </td>
                        <td className={td}><TipoBadge tipo={g.tipoCompra} /></td>
                        <td className={td}>
                          <span className="text-xs text-gray-600 dark:text-gray-300">{g.proyecto?.nombre ?? "—"}</span>
                        </td>
                        <td className={td}>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {g.rows.length}
                          </span>
                        </td>
                        <td className={td}>
                          <span className="block max-w-[160px] truncate text-xs text-gray-600 dark:text-gray-300" title={proveedores.join(", ")}>
                            {proveedores.length > 0 ? proveedores.join(", ") : <span className="text-gray-300 dark:text-gray-600">—</span>}
                          </span>
                        </td>
                        <td className={td}>
                          <div className="flex flex-col gap-0.5">
                            {ocs.length > 0
                              ? ocs.map((oc) => (
                                  <span key={oc.id} className="text-xs text-purple-700 dark:text-purple-300">
                                    {oc.nombre}{oc.numeroOC ? ` (${oc.numeroOC})` : ""}
                                  </span>
                                ))
                              : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                          </div>
                        </td>
                        <td className={td}>
                          <span className="block max-w-[140px] truncate text-xs text-gray-600 dark:text-gray-300">
                            {responsables.length > 0 ? responsables.map((r) => r.nombre).join(", ") : "—"}
                          </span>
                        </td>
                        <td className={td}>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cotCfg.cls}`}>
                            {cotCfg.label}
                          </span>
                        </td>
                        <td className={td}>
                          <span className="whitespace-nowrap text-xs text-gray-500">{fmtDate(g.fechaSolicitud)}</span>
                        </td>
                      </tr>,

                      isOpen && g.rows.map((r) => (
                        <tr key={`${g.cotizacionId}-${r.id}`}
                          className={`bg-white hover:bg-blue-50/20 dark:bg-gray-900 dark:hover:bg-blue-900/5 ${ESTADOS_GENERALES[r.estadoGeneral] ?? ""}`}>
                          <td className={`${td} bg-blue-50/30 dark:bg-blue-900/10`}></td>
                          <td className={`${td} pl-6`} colSpan={1}>
                            <span className="block max-w-[220px] truncate text-xs text-gray-600 dark:text-gray-300" title={r.descripcion}>
                              {r.descripcion || "—"}
                              {r.cantidad != null && <span className="ml-1 text-gray-400">×{r.cantidad}</span>}
                            </span>
                            {r.sku && <span className="text-xs text-gray-400">{r.sku}</span>}
                          </td>
                          <td className={td}></td>
                          <td className={td}></td>
                          <td className={td}></td>
                          <td className={td}>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {r.proveedor || <span className="text-gray-300 dark:text-gray-600">—</span>}
                            </span>
                          </td>
                          <td className={td}>
                            {r.ordenCompra ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{r.ordenCompra.nombre}</span>
                                {r.ordenCompra.numeroOC && <span className="text-xs text-gray-400">{r.ordenCompra.numeroOC}</span>}
                              </div>
                            ) : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                          </td>
                          <td className={td}>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{r.responsable?.nombre ?? "—"}</span>
                          </td>
                          <td className={td}><EstatusBadge estatus={r.estatusActual} /></td>
                          <td className={td}><AtrasoCell dias={r.diasRetrasoActual} /></td>
                        </tr>
                      )),
                    ];
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {activeTotalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
              <button onClick={() => setPage(1)} disabled={activeSafePage === 1}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={activeSafePage === 1}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">‹</button>

              {(() => {
                const pages: (number | "…")[] = [];
                if (activeTotalPages <= 7) {
                  for (let i = 1; i <= activeTotalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (activeSafePage > 3) pages.push("…");
                  for (let i = Math.max(2, activeSafePage - 1); i <= Math.min(activeTotalPages - 1, activeSafePage + 1); i++) pages.push(i);
                  if (activeSafePage < activeTotalPages - 2) pages.push("…");
                  pages.push(activeTotalPages);
                }
                return pages.map((p, i) =>
                  p === "…"
                    ? <span key={`e-${i}`} className="px-1 text-xs text-gray-400">…</span>
                    : <button key={p} onClick={() => setPage(p)}
                        className={`min-w-[32px] rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                          p === activeSafePage
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}>{p}</button>
                );
              })()}

              <button onClick={() => setPage((p) => Math.min(activeTotalPages, p + 1))} disabled={activeSafePage === activeTotalPages}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">›</button>
              <button onClick={() => setPage(activeTotalPages)} disabled={activeSafePage === activeTotalPages}
                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">»</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
