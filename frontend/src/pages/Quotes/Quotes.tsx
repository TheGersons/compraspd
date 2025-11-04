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
  currency: string;
  status: string;
  requestCategory: string;
  procurement: string;
  items: any[]
};

// ============================================================================
// UTILITIES
// ============================================================================

const mapRequestToQuote = (request: any): Quote => {
  const assignment = request.assignments?.[0];

  return {
    id: request.id,
    reference: request.reference || `REQ-${request.id.slice(0, 8)}`,
    customer: request.requester.fullName || "N/A",
    createdAt: request.createdAt,
    dueAt: request.quoteDeadline || request.createdAt,
    assignedTo: assignment?.assignedTo?.fullName,
    amount: 0, // TODO: Calcular del quote cuando exista
    currency: request.procurement === "INTERNATIONAL" ? "USD" : "HNL",
    status: request.status,
    requestCategory: request.requestCategory,
    procurement: request.procurement,
    items: request.items || []
  };
};

const getStatusForTable = (status: string): "open" | "in_review" | "approved" | "rejected" | "cancelled" => {
  const statusMap: Record<string, "open" | "in_review" | "approved" | "rejected" | "cancelled"> = {
    SUBMITTED: "open",
    IN_PROGRESS: "in_review",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  };
  return statusMap[status] || "open";
};

const calculateDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Quotes() {
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
  const { data: statsData, isLoading: isLoadingStats } = useQuotesStats(filters.preset === undefined ? "" : filters.preset);

  // Transform requests to quotes format
  const quotes = useMemo(() => {
    if (!dashboardData?.requests) return [];
    return dashboardData.requests.map(mapRequestToQuote);
  }, [dashboardData]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!quotes.length) return { total: 0, open: 0, unassigned: 0, dueSoon: 0 };

    const total = quotes.length;
    const open = quotes.filter((q: Quote) =>
      q.status === "SUBMITTED" || q.status === "IN_PROGRESS"
    ).length;
    const unassigned = quotes.filter((q: Quote) => !q.assignedTo).length;
    const dueSoon = quotes.filter((q: Quote) => {
      const daysLeft = calculateDaysUntilDue(q.dueAt);
      return daysLeft >= 0 && daysLeft <= 3 && q.status !== "APPROVED";
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
    if (!dashboardData) {
      return { projects: [], users: [] };
    }

    const projectsSet = new Set<string>();
    const usersSet = new Set<string>();

    dashboardData.requests.forEach((req: any) => {
      if (req.project) {
        projectsSet.add(JSON.stringify({
          id: req.project.id,
          nombre: req.project.name
        }));
      }
      if (req.assignments?.[0]?.assignedTo) {
        usersSet.add(JSON.stringify({
          id: req.assignments[0].assignedTo.id,
          nombre: req.assignments[0].assignedTo.fullName
        }));
      }
    });

    return {
      projects: Array.from(projectsSet).map(str => JSON.parse(str)),
      users: Array.from(usersSet).map(str => JSON.parse(str)),
    };
  }, [dashboardData]);

  // En Quotes.tsx - Asegúrate de que no haya duplicación
const tableQuotes = useMemo(() => {
  return quotes.map((q: any) => {
    const itemsCount = Array.isArray(q.items)
      ? q.items.reduce((acc: number, it: any) => acc + Number(it.quantity ?? 0), 0)
      : 0;

    return {
      ...q,
      items: itemsCount,
      assignedTo: q.assignments?.[0]?.assignedTo?.fullName ?? q.assignedTo,
      dueAt: q.dueDate ?? q.quoteDeadline ?? q.dueAt,
      customer: q.requester?.fullName ?? q.customer ?? "—",
      status: getStatusForTable(q.status),
    };
  });
}, [quotes]); // ✅ Asegúrate de que solo dependa de quotes

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Cotizaciones" description="Resumen y gestión de cotizaciones" />

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
        <KpiCard
          title="Sin asignar"
          value={kpis.unassigned}
          tone="danger"
        />
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
        usuarios={filterData.users}
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
              series={[{
                name: "Cotizaciones",
                data: chartData.quotesPerMonth
              }]}
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
            Mostrando {tableQuotes.length} solicitud{tableQuotes.length !== 1 ? 'es' : ''}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              // TODO: Implementar exportación
              console.log('Exportar datos');
            }}>
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