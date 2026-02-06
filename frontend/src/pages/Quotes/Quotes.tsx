import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import KpiCard from "../../components/quotes/KpiCard";
import QuotesTable from "../../components/quotes/QuotesTable";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import BarMonthly from "../../components/quotes/charts/BarMonthly";
import LineTrend from "../../components/quotes/charts/LineTrend";
import Filters, { QuoteFilters } from "../../components/quotes/filters";
import { useQuotesDashboard, useQuotesStats } from "./hooks/useQuotesDashboard";
import { getToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";


// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = {
    async getMe() {
      const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar usuario");
        return response.json();
    },
  }



// ============================================================================
// TYPES
// ============================================================================

type Quote = {
  id: string;
  reference: string;
  customer: string;
  createdAt: string;
  dueAt: string;
  assignedTo?: string;
  amount: number;
  currency: "USD" | "HNL";
  status: string;
  requestCategory: string;
  procurement: string;
  items: number; // Ahora es contador de items
};

// Tipo para cotización del backend (nuevo schema)
type QuotationFromAPI = {
  id: string;
  nombreCotizacion: string;
  estado: string;
  tipoCompra: string;
  lugarEntrega: string;
  fechaSolicitud: string;
  fechaLimite: string;
  fechaEstimada: string;
  comentarios?: string;
  solicitante: {
    id: string;
    nombre: string;
    email: string;
    departamento?: {
      nombre: string;
    };
  };
  tipo: {
    id: string;
    nombre: string;
    area: {
      nombreArea: string;
    };
  };
  proyecto?: {
    id: string;
    nombre: string;
  };
  detalles: Array<{
    id: string;
    cantidad: number;
    descripcionProducto: string;
  }>;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Mapea cotización del nuevo schema al formato legacy usado en la tabla
 */
const mapQuotationToQuote = (quotation: QuotationFromAPI): Quote => {
  // Calcular total de items
  const itemsCount = quotation.detalles.reduce(
    (acc, detalle) => acc + detalle.cantidad,
    0
  );

  return {
    id: quotation.id,
    reference: `COT-${quotation.id.slice(0, 8).toUpperCase()}`,
    customer: quotation.solicitante.nombre,
    createdAt: quotation.fechaSolicitud,
    dueAt: quotation.fechaLimite,
    assignedTo: undefined, // TODO: Implementar asignaciones en nuevo sistema
    amount: 0, // TODO: Calcular cuando tengamos precios seleccionados
    currency: quotation.tipoCompra === "INTERNACIONAL" ? "USD" : "HNL",
    status: quotation.estado,
    requestCategory: quotation.tipo.nombre,
    procurement: quotation.tipoCompra,
    items: itemsCount,
  };
};

/**
 * Mapea estados del nuevo schema al formato de la tabla
 */
const getStatusForTable = (
  estado: string
): "open" | "in_review" | "approved" | "rejected" | "cancelled" => {
  const statusMap: Record<
    string,
    "open" | "in_review" | "approved" | "rejected" | "cancelled"
  > = {
    ENVIADA: "open",
    EN_REVISION: "in_review",
    APROBADA: "approved",
    RECHAZADA: "rejected",
    CANCELADA: "cancelled",
  };
  return statusMap[estado] || "open";
};

/**
 * Calcula días hasta la fecha límite
 */
const calculateDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Traduce tipo de compra para mostrar
 */
const translateProcurement = (tipoCompra: string): string => {
  return tipoCompra === "NACIONAL" ? "Nacional" : "Internacional";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Quotes() {
  const user = api.getMe();
  
  console.log(user);
  const [filters, setFilters] = useState<QuoteFilters>({
    preset: "30d",
    estado: "todas",
    tipoSolicitud: "todas",
    tipoCompra: "todas",
    proyectoId: "todos",
    asignadoA: "todos",
    origen: "todos",
    ordenar: "recientes",
    q: "",
  });

  const { data: dashboardData, isLoading } = useQuotesDashboard(filters);
  const { data: statsData, isLoading: isLoadingStats } = useQuotesStats(
    filters.preset === undefined ? "" : filters.preset
  );

  // Transform quotations to quotes format
  const quotes = useMemo(() => {
    if (!dashboardData?.quotations) return [];
    return dashboardData.quotations.map(mapQuotationToQuote);
  }, [dashboardData]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!quotes.length) return { total: 0, open: 0, unassigned: 0, dueSoon: 0 };

    const total = quotes.length;
    const open = quotes.filter(
      (q: Quote) => q.status === "ENVIADA" || q.status === "EN_REVISION"
    ).length;
    const unassigned = quotes.filter((q: Quote) => !q.assignedTo).length;
    const dueSoon = quotes.filter((q: Quote) => {
      const daysLeft = calculateDaysUntilDue(q.dueAt);
      return daysLeft >= 0 && daysLeft <= 3 && q.status !== "APROBADA";
    }).length;

    return { total, open, unassigned, dueSoon };
  }, [quotes]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!statsData) {
      return {
        months: [],
        quotesPerMonth: [],
        amountPerMonth: [],
        revenuePerMonth: [],
      };
    }

    const months = statsData.monthlyStats.map((stat: any) => stat.month);
    const quotesPerMonth = statsData.monthlyStats.map((stat: any) => stat.count);
    const amountPerMonth = statsData.monthlyStats.map((stat: any) =>
      Math.round(stat.totalAmount / 1000)
    );
    const revenuePerMonth = statsData.monthlyStats.map((stat: any) =>
      Math.round(stat.estimatedRevenue / 1000)
    );

    return { months, quotesPerMonth, amountPerMonth, revenuePerMonth };
  }, [statsData]);

  // Prepare data for projects and users filters
  const filterData = useMemo(() => {
    if (!dashboardData?.quotations) {
      return { projects: [], users: [], tipos: [], areas: [] };
    }

    const projectsSet = new Set<string>();
    const tiposSet = new Set<string>();
    const areasSet = new Set<string>();

    dashboardData.quotations.forEach((quot: QuotationFromAPI) => {
      // Proyectos
      if (quot.proyecto) {
        projectsSet.add(
          JSON.stringify({
            id: quot.proyecto.id,
            nombre: quot.proyecto.nombre,
          })
        );
      }

      // Tipos de solicitud
      if (quot.tipo) {
        tiposSet.add(
          JSON.stringify({
            id: quot.tipo.id,
            nombre: quot.tipo.nombre,
          })
        );
      }

      // Áreas
      if (quot.tipo?.area) {
        areasSet.add(
          JSON.stringify({
            nombreArea: quot.tipo.area.nombreArea,
          })
        );
      }
    });

    return {
      projects: Array.from(projectsSet).map((str) => JSON.parse(str)),
      users: [], // TODO: Implementar cuando tengamos asignaciones
      tipos: Array.from(tiposSet).map((str) => JSON.parse(str)),
      areas: Array.from(areasSet).map((str) => JSON.parse(str)),
    };
  }, [dashboardData]);

  // Prepare table data
  const tableQuotes = useMemo(() => {
    if (!dashboardData?.quotations) return [];

    return dashboardData.quotations.map((quot: QuotationFromAPI) => {
      const itemsCount = quot.detalles.reduce(
        (acc, detalle) => acc + detalle.cantidad,
        0
      );

      return {
        id: quot.id,
        reference: `COT-${quot.id.slice(0, 8).toUpperCase()}`,
        customer: quot.solicitante.nombre,
        createdAt: quot.fechaSolicitud,
        dueAt: quot.fechaLimite,
        assignedTo: undefined, // TODO: Sistema de asignaciones
        items: itemsCount,
        amount: 0, // TODO: Calcular con precios
        currency: (quot.tipoCompra === "INTERNACIONAL" ? "USD" : "HNL") as "USD" | "HNL",
        status: getStatusForTable(quot.estado),
        requestCategory: quot.tipo.nombre,
        procurement: translateProcurement(quot.tipoCompra),
      };
    });
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Cotizaciones"
        description="Resumen y gestión de cotizaciones"
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
          Cotizaciones
        </h1>
        <Button size="sm">
          <Link to="/quotes/new">Nueva cotización</Link>
        </Button>
      </div>

      <div className="h-6" />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Cotizaciones totales"
          value={kpis.total}
          hint={`Período seleccionado`}
          tone="brand"
        />
        <KpiCard
          title="Abiertas / En revisión"
          value={kpis.open}
          tone="warn"
        />
        <KpiCard title="Sin asignar" value={kpis.unassigned} tone="danger" />
        <KpiCard
          title="Próximas a vencer (≤ 3 días)"
          value={kpis.dueSoon}
          tone="warn"
        />
      </div>

      {/* Filtros */}
      <Filters
        value={filters}
        onChange={setFilters}
        proyectos={filterData.projects}
        tipos={filterData.tipos}
        areas={filterData.areas}
      />

      <div className="h-6" />

      {/* Chart cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard title="Cotizaciones por mes">
          {isLoadingStats ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">Cargando estadísticas...</p>
            </div>
          ) : (
            <BarMonthly
              categories={chartData.months}
              series={[
                {
                  name: "Cotizaciones",
                  data: chartData.quotesPerMonth,
                },
              ]}
            />
          )}
        </ComponentCard>

        <ComponentCard title="Monto y revenue estimado (miles)">
          {isLoadingStats ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">Cargando estadísticas...</p>
            </div>
          ) : (
            <LineTrend
              categories={chartData.months}
              series={[
                { name: "Monto", data: chartData.amountPerMonth },
                { name: "Revenue", data: chartData.revenuePerMonth },
              ]}
            />
          )}
        </ComponentCard>
      </div>

      <div className="h-6" />

      {/* Tabla */}
      <ComponentCard title="Todas las cotizaciones">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {tableQuotes.length} cotización
            {tableQuotes.length !== 1 ? "es" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // TODO: Implementar exportación
                console.log("Exportar datos");
              }}
            >
              Exportar
            </Button>
            <Button size="sm">
              <Link to="/quotes/assignment">Asignaciones</Link>
            </Button>
          </div>
        </div>

        {tableQuotes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No hay cotizaciones con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <QuotesTable data={tableQuotes} pageSize={5} />
        )}
      </ComponentCard>
    </>
  );
}