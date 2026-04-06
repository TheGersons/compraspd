import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import KpiCard from "../../components/quotes/KpiCard";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import useDarkMode from "./hooks/useDarkMode";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadisticasSupervisor = {
  totalPendientes: number;
  totalEnConfiguracion: number;
  totalAprobacionParcial: number;
  misAsignadas: number;
  totalEnProceso: number;
};

type CotizacionItem = {
  id: string;
  nombreCotizacion: string;
  estado: string;
  tipoCompra: string;
  fechaSolicitud: string;
  fechaLimite: string;
  solicitante: { nombre: string; departamento?: { nombre: string } | null };
  supervisorResponsable?: { id: string; nombre: string } | null;
  responsableAsignado?: { id: string; nombre: string } | null;
  proyecto?: { nombre: string; criticidad?: string } | null;
  tipo?: {
    id: string;
    nombre: string;
    area?: { id: string; nombreArea: string; tipo: string } | null;
  } | null;
  licitacion?: { id: string } | null;
  oferta?: { id: string } | null;
  detalles: { id: string }[];
  totalProductos?: number;
  productosAprobados?: number;
};

type CompraResumen = { total: number; pendientes: number; completadas: number };

// ─── Config ───────────────────────────────────────────────────────────────────

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; text: string }> = {
  ENVIADA:          { label: "Enviada",           color: "#f59e0b", bg: "bg-amber-100  dark:bg-amber-900/30",    text: "text-amber-700  dark:text-amber-300"   },
  PENDIENTE:        { label: "Pendiente",          color: "#3b82f6", bg: "bg-blue-100   dark:bg-blue-900/30",     text: "text-blue-700   dark:text-blue-300"    },
  EN_CONFIGURACION: { label: "En configuración",   color: "#8b5cf6", bg: "bg-purple-100 dark:bg-purple-900/30",  text: "text-purple-700 dark:text-purple-300"  },
  APROBADA_PARCIAL: { label: "Aprob. parcial",     color: "#10b981", bg: "bg-teal-100   dark:bg-teal-900/30",    text: "text-teal-700   dark:text-teal-300"    },
  APROBADA:         { label: "Aprobada",           color: "#059669", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  RECHAZADA:        { label: "Rechazada",          color: "#ef4444", bg: "bg-red-100    dark:bg-red-900/30",      text: "text-red-700    dark:text-red-300"     },
};

// área.tipo → label e icono para las categorías
const CATEGORIA_CFG: Record<string, { label: string; icon: string; color: string; borderColor: string }> = {
  licitacion:  { label: "Licitaciones",      icon: "🏛️", color: "bg-indigo-50  dark:bg-indigo-900/20",  borderColor: "border-indigo-200 dark:border-indigo-700" },
  oferta:      { label: "Ofertas comerciales", icon: "💼", color: "bg-blue-50    dark:bg-blue-900/20",    borderColor: "border-blue-200   dark:border-blue-700"   },
  comercial:   { label: "Área Comercial",    icon: "📊", color: "bg-cyan-50     dark:bg-cyan-900/20",    borderColor: "border-cyan-200   dark:border-cyan-700"   },
  tecnica:     { label: "Área Técnica",      icon: "⚙️", color: "bg-violet-50  dark:bg-violet-900/20",  borderColor: "border-violet-200 dark:border-violet-700" },
  proyectos:   { label: "Proyectos",         icon: "📁", color: "bg-amber-50   dark:bg-amber-900/20",   borderColor: "border-amber-200  dark:border-amber-700"  },
  operativa:   { label: "Área Operativa",    icon: "🔧", color: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-700" },
  otra:        { label: "Otras",             icon: "📋", color: "bg-gray-50    dark:bg-gray-800/40",    borderColor: "border-gray-200   dark:border-gray-700"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoriaKey(c: CotizacionItem): string {
  if (c.licitacion) return "licitacion";
  if (c.oferta) return "oferta";
  const areaTipo = c.tipo?.area?.tipo?.toLowerCase();
  if (areaTipo) return areaTipo;
  return "otra";
}

function isVencida(c: CotizacionItem): boolean {
  if (!c.fechaLimite) return false;
  return new Date(c.fechaLimite) < new Date();
}

function sinResponsable(c: CotizacionItem): boolean {
  return !c.supervisorResponsable && !c.responsableAsignado;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}

function diasRestantes(fechaLimite: string): number {
  return Math.ceil((new Date(fechaLimite).getTime() - Date.now()) / 86400000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StateBadge({ estado }: { estado: string }) {
  const c = ESTADO_CFG[estado] ?? { label: estado, bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

function CotizacionRow({ cot }: { cot: CotizacionItem }) {
  const vencida = isVencida(cot);
  const sinResp = sinResponsable(cot);
  const dias = cot.fechaLimite ? diasRestantes(cot.fechaLimite) : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${vencida || sinResp ? "border-l-2 border-rose-400" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
          {cot.nombreCotizacion}
        </p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {cot.solicitante?.nombre}
          {cot.proyecto && <> · <span className="text-blue-500">{cot.proyecto.nombre}</span></>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {sinResp && (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            ⚠ Sin responsable
          </span>
        )}
        {vencida && (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            🕒 Vencida
          </span>
        )}
        {!vencida && dias !== null && dias <= 3 && dias >= 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            ⏳ {dias}d
          </span>
        )}
        <span className="text-xs text-gray-400">{formatDate(cot.fechaSolicitud)}</span>
        <StateBadge estado={cot.estado} />
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function DonutEstados({ data }: { data: { label: string; value: number; color: string }[] }) {
  const isDark = useDarkMode();
  const surface = isDark ? "#1E2636" : "#ffffff";
  const label = isDark ? "#9CA3AF" : "#6B7280";

  const options: ApexOptions = {
    chart: { type: "donut", background: surface, fontFamily: "Outfit, sans-serif" },
    theme: { mode: isDark ? "dark" : "light" },
    colors: data.map((d) => d.color),
    labels: data.map((d) => d.label),
    legend: { position: "bottom", labels: { colors: label }, fontSize: "13px" },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: label,
              fontSize: "13px",
              formatter: (w) => String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)),
            },
          },
        },
      },
    },
    stroke: { width: 0 },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  return <Chart options={options} series={data.map((d) => d.value)} type="donut" height={270} />;
}

function BarTipoCompra({ nacional, internacional }: { nacional: number; internacional: number }) {
  const isDark = useDarkMode();
  const surface = isDark ? "#1E2636" : "#ffffff";
  const labelColor = isDark ? "#9CA3AF" : "#6B7280";
  const grid = isDark ? "rgba(255,255,255,0.07)" : "#E5E7EB";

  const options: ApexOptions = {
    chart: { type: "bar", background: surface, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#465fff", "#10b981"],
    plotOptions: { bar: { columnWidth: "40%", borderRadius: 6, borderRadiusApplication: "end" } },
    dataLabels: { enabled: true, style: { fontSize: "13px", colors: [isDark ? "#e2e8f0" : "#374151"] } },
    xaxis: {
      categories: ["Nacional", "Internacional"],
      labels: { style: { colors: [labelColor, labelColor], fontSize: "13px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: [labelColor] } }, min: 0 },
    grid: { borderColor: grid },
    tooltip: { theme: isDark ? "dark" : "light" },
    legend: { show: false },
  };

  return (
    <Chart
      options={options}
      series={[{ name: "Cotizaciones", data: [nacional, internacional] }]}
      type="bar"
      height={270}
    />
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Quotes() {
  const { user } = useAuth();
  const userRole = (user as any)?.rol?.nombre?.toUpperCase() as string | undefined;
  const isSupervisor = userRole === "SUPERVISOR" || userRole === "ADMIN" || userRole === "COMERCIAL";

  const [estadisticas, setEstadisticas] = useState<EstadisticasSupervisor | null>(null);
  const [cotizaciones, setCotizaciones] = useState<CotizacionItem[]>([]);
  const [compras, setCompras] = useState<CompraResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupervisor) {
        const [stats, lista, comprasList] = await Promise.allSettled([
          apiFetch<EstadisticasSupervisor>("/api/v1/followups/estadisticas"),
          apiFetch<{ items: CotizacionItem[]; total: number }>("/api/v1/followups?pageSize=100"),
          apiFetch<{ items: any[]; total: number }>("/api/v1/compras?pageSize=100"),
        ]);
        if (stats.status === "fulfilled") setEstadisticas(stats.value);
        if (lista.status === "fulfilled") setCotizaciones(lista.value.items ?? []);
        if (comprasList.status === "fulfilled") {
          const items = comprasList.value.items ?? [];
          setCompras({
            total: comprasList.value.total ?? items.length,
            pendientes: items.filter((c: any) => c.estado === "PENDIENTE").length,
            completadas: items.filter((c: any) => c.estado === "COMPLETADA").length,
          });
        }
      } else {
        const data = await apiFetch<CotizacionItem[]>("/api/v1/quotations/my-quotations");
        setCotizaciones(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }, [isSupervisor]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const criticas = useMemo(
    () => cotizaciones.filter((c) => sinResponsable(c) || isVencida(c)),
    [cotizaciones]
  );

  const sinResp = useMemo(() => cotizaciones.filter(sinResponsable), [cotizaciones]);
  const vencidas = useMemo(() => cotizaciones.filter(isVencida), [cotizaciones]);

  // Agrupación por categoría
  const categorias = useMemo(() => {
    const map: Record<string, CotizacionItem[]> = {};
    cotizaciones.forEach((c) => {
      const key = getCategoriaKey(c);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [cotizaciones]);

  const categoriasDisponibles = useMemo(
    () => Object.keys(categorias).filter((k) => categorias[k].length > 0),
    [categorias]
  );

  const cotizacionesFiltradas = useMemo(() => {
    if (categoriaActiva === "todas") return cotizaciones;
    if (categoriaActiva === "criticas") return criticas;
    return categorias[categoriaActiva] ?? [];
  }, [cotizaciones, criticas, categorias, categoriaActiva]);

  const estadosDist = useMemo(() => {
    const counts: Record<string, number> = {};
    cotizaciones.forEach((c) => { counts[c.estado] = (counts[c.estado] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([estado, value]) => ({
        label: ESTADO_CFG[estado]?.label ?? estado,
        value,
        color: ESTADO_CFG[estado]?.color ?? "#9CA3AF",
      }));
  }, [cotizaciones]);

  const tipoCompraDist = useMemo(() => ({
    nacional: cotizaciones.filter((c) => c.tipoCompra === "NACIONAL").length,
    internacional: cotizaciones.filter((c) => c.tipoCompra === "INTERNACIONAL").length,
  }), [cotizaciones]);

  const misKpis = useMemo(() => {
    if (isSupervisor) return null;
    return {
      total: cotizaciones.length,
      enviadas: cotizaciones.filter((c) => c.estado === "ENVIADA").length,
      aprobadas: cotizaciones.filter((c) => c.estado === "APROBADA").length,
      enProceso: cotizaciones.filter((c) =>
        ["PENDIENTE", "EN_CONFIGURACION", "APROBADA_PARCIAL"].includes(c.estado)
      ).length,
    };
  }, [cotizaciones, isSupervisor]);

  const recentCotizaciones = useMemo(
    () => [...cotizacionesFiltradas]
      .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime())
      .slice(0, 10),
    [cotizacionesFiltradas]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta title="Dashboard de Compras" description="Resumen general del sistema de compras" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
            Dashboard de Compras
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isSupervisor ? "Vista general del proceso de cotizaciones" : "Resumen de tus cotizaciones"}
          </p>
        </div>
        <div className="flex gap-2">
          {isSupervisor && (
            <Link
              to="/quotes/follow-ups"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Seguimientos
            </Link>
          )}
          {!isSupervisor && (
            <Link
              to="/quotes/my-quotes"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Mis cotizaciones
            </Link>
          )}
          <Link
            to="/quotes/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            + Nueva cotización
          </Link>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : isSupervisor && estadisticas ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard title="Total en proceso"        value={estadisticas.totalEnProceso}  hint="Cotizaciones activas"                        tone="brand"   />
          <KpiCard title="Pendientes de asignar"   value={estadisticas.totalPendientes} hint="Sin supervisor responsable"                  tone="warn"    />
          <KpiCard title="En configuración"        value={estadisticas.totalEnConfiguracion + estadisticas.totalAprobacionParcial} hint="Configurando / aprob. parcial" tone="purple"  />
          <KpiCard title="Mis asignadas"           value={estadisticas.misAsignadas}    hint="Activas bajo tu responsabilidad"             tone="teal"    />
          {/* Card crítico */}
          <KpiCard
            title="⚠ Atención requerida"
            value={criticas.length}
            hint={`${sinResp.length} sin responsable · ${vencidas.length} vencidas`}
            tone={criticas.length > 0 ? "danger" : "success"}
            onClick={() => setCategoriaActiva(categoriaActiva === "criticas" ? "todas" : "criticas")}
          />
        </div>
      ) : misKpis ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="Total enviadas"   value={misKpis.total}      tone="brand"   />
          <KpiCard title="Esperando resp."  value={misKpis.enviadas}   hint="Pendientes de revisión" tone="warn" />
          <KpiCard title="En proceso"       value={misKpis.enProceso}  hint="Configuración o aprob. parcial" tone="purple" />
          <KpiCard title="Aprobadas"        value={misKpis.aprobadas}  tone="success" />
        </div>
      ) : null}

      {/* ── Compras info (supervisor) ──────────────────────────────────────── */}
      {isSupervisor && !loading && compras && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-800 dark:text-white">{compras.pendientes}</span> compra{compras.pendientes !== 1 ? "s" : ""} pendiente{compras.pendientes !== 1 ? "s" : ""} de completar
            </span>
            <Link to="/quotes/follow-ups" className="ml-2 text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400">
              Ver →
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-800 dark:text-white">{compras.completadas}</span> compra{compras.completadas !== 1 ? "s" : ""} completada{compras.completadas !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Distribución por estado</h3>
          <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">{cotizaciones.length} cotizaciones en seguimiento</p>
          {loading ? <Skeleton className="h-[270px]" /> : estadosDist.length > 0
            ? <DonutEstados data={estadosDist} />
            : <div className="flex h-[270px] items-center justify-center text-sm text-gray-400">Sin datos</div>
          }
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Tipo de compra</h3>
          <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">Nacional vs Internacional</p>
          {loading ? <Skeleton className="h-[270px]" /> : <BarTipoCompra nacional={tipoCompraDist.nacional} internacional={tipoCompraDist.internacional} />}
        </div>
      </div>

      {/* ── Categorías (supervisor) ────────────────────────────────────────── */}
      {isSupervisor && !loading && categoriasDisponibles.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Por tipo de solicitud</h3>

          {/* Tarjetas resumen por categoría */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* Tarjeta "Todas" */}
            <button
              onClick={() => setCategoriaActiva("todas")}
              className={`rounded-xl border p-3 text-left transition hover:shadow-md ${
                categoriaActiva === "todas"
                  ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="text-lg">📋</div>
              <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">Todas</div>
              <div className="mt-0.5 text-xl font-bold text-gray-800 dark:text-white">{cotizaciones.length}</div>
            </button>

            {/* Tarjeta "Críticas" */}
            {criticas.length > 0 && (
              <button
                onClick={() => setCategoriaActiva(categoriaActiva === "criticas" ? "todas" : "criticas")}
                className={`rounded-xl border p-3 text-left transition hover:shadow-md ${
                  categoriaActiva === "criticas"
                    ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-900/20"
                    : "border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/10"
                }`}
              >
                <div className="text-lg">⚠️</div>
                <div className="mt-1 text-xs font-medium text-rose-500 dark:text-rose-400">Críticas</div>
                <div className="mt-0.5 text-xl font-bold text-rose-600 dark:text-rose-400">{criticas.length}</div>
              </button>
            )}

            {/* Tarjetas por categoría */}
            {categoriasDisponibles.map((key) => {
              const cfg = CATEGORIA_CFG[key] ?? CATEGORIA_CFG.otra;
              const count = categorias[key].length;
              const isActive = categoriaActiva === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategoriaActiva(isActive ? "todas" : key)}
                  className={`rounded-xl border p-3 text-left transition hover:shadow-md ${
                    isActive
                      ? `border-blue-400 ${cfg.color} dark:border-blue-500`
                      : `${cfg.borderColor} ${cfg.color}`
                  }`}
                >
                  <div className="text-lg">{cfg.icon}</div>
                  <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{cfg.label}</div>
                  <div className="mt-0.5 text-xl font-bold text-gray-800 dark:text-white">{count}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lista de cotizaciones ──────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {categoriaActiva === "todas"
                ? "Cotizaciones recientes"
                : categoriaActiva === "criticas"
                ? "⚠ Cotizaciones críticas"
                : `${CATEGORIA_CFG[categoriaActiva]?.icon ?? ""} ${CATEGORIA_CFG[categoriaActiva]?.label ?? categoriaActiva}`}
            </h3>
            {categoriaActiva !== "todas" && (
              <button
                onClick={() => setCategoriaActiva("todas")}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                (ver todas)
              </button>
            )}
          </div>
          <Link
            to={isSupervisor ? "/quotes/follow-ups" : "/quotes/my-quotes"}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        ) : recentCotizaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categoriaActiva === "criticas"
                ? "No hay cotizaciones críticas. ¡Todo en orden!"
                : isSupervisor
                ? "No hay cotizaciones en seguimiento"
                : "Aún no tienes cotizaciones"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentCotizaciones.map((cot) => (
              <CotizacionRow key={cot.id} cot={cot} />
            ))}
            {cotizacionesFiltradas.length > 10 && (
              <div className="px-5 py-3 text-center text-xs text-gray-400 dark:text-gray-500">
                Mostrando 10 de {cotizacionesFiltradas.length}. &nbsp;
                <Link to="/quotes/follow-ups" className="text-blue-500 hover:underline">Ver todas en seguimientos →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
