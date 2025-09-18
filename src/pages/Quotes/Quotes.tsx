import { useMemo, useState } from "react";
import KpiCard from "../../components/quotes/KpiCard";
import QuotesTable, { Quote } from "../../components/quotes/QuotesTable";
import { months, quotesPerMonth, amountPerMonth, revenuePerMonth } from "../../data/quotes";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import BarMonthly from "../../components/quotes/charts/BarMonthly";
import LineTrend from "../../components/quotes/charts/LineTrend";
import Filters, { QuoteFilters } from "../../components/quotes/filters";

export default function Quotes() {
  // datos ficticios
  const quotes = useMemo<Quote[]>(() => [
    { id: "Q-2025-0012", customer: "Acme SA", createdAt: "2025-09-10", dueAt: "2025-09-20", assignedTo: "María", amount: 15500, currency: "USD", status: "in_review" },
    { id: "Q-2025-0011", customer: "Globex", createdAt: "2025-09-09", dueAt: "2025-09-16", assignedTo: undefined, amount: 78000, currency: "HNL", status: "open" },
    { id: "Q-2025-0010", customer: "Walmart", createdAt: "2025-09-08", dueAt: "2025-09-15", assignedTo: "Carlos", amount: 23000, currency: "USD", status: "approved" },
    { id: "Q-2025-0009", customer: "Initech", createdAt: "2025-09-07", dueAt: "2025-09-14", assignedTo: "Ana", amount: 12500, currency: "USD", status: "rejected" },
    { id: "Q-2025-0008", customer: "Umbrella Corp", createdAt: "2025-09-06", dueAt: "2025-09-13", assignedTo: undefined, amount: 45000, currency: "HNL", status: "open" },
    { id: "Q-2025-0007", customer: "Soylent", createdAt: "2025-09-05", dueAt: "2025-09-12", assignedTo: "Luis", amount: 32000, currency: "USD", status: "in_review" },
    { id: "Q-2025-0006", customer: "Hooli", createdAt: "2025-09-04", dueAt: "2025-09-11", assignedTo: "María", amount: 27500, currency: "USD", status: "approved" },
    { id: "Q-2025-0005", customer: "Vehement Capital Partners", createdAt: "2025-09-03", dueAt: "2025-09-10", assignedTo: undefined, amount: 60000, currency: "HNL", status: "open" },
  ], []);
  const kpis = useMemo(() => {
    const total = quotes.length;
    const open = quotes.filter(q => q.status === "open" || q.status === "in_review").length;
    const unassigned = quotes.filter(q => !q.assignedTo).length;
    const dueSoon = quotes.filter(q =>
      new Date(q.dueAt).getTime() - Date.now() < 3 * 86400000 && q.status !== "approved"
    ).length;
    return { total, open, unassigned, dueSoon };
  }, [quotes]);

  //const [selected, setSelected] = useState<"last7" | "last30" | "last90">("last7");

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


  return (
    <>
      <PageMeta title="Cotizaciones" description="Resumen y gestion de cotizaciones" />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">
          Cotizaciones
        </h1>
        <Button size="sm">
          <Link to="/quotes/new">Nueva cotización</Link>
        </Button>
      </div>

      {/* Espacio en blanco */}
      <div className="h-6" />


      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Cotizaciones totales" value={kpis.total} hint="Últimos 30 días" tone="brand" />
        <KpiCard title="Abiertas / En revisión" value={kpis.open} tone="warn" />
        <KpiCard title="Sin asignar" value={kpis.unassigned} tone="danger" />
        <KpiCard title="Prontas a vencer (≤ 3 días)" value={kpis.dueSoon} tone="warn" />
      </div>

      {/* Espacio en blanco */}
      <div className="h-6" />

      {/* filtros 
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">Resumen de los últimos 30 días</p>
        <div className="flex gap-2">
          <Button size="sm" variant={selected === "last7" ? "primary" : "outline"} onClick={() => setSelected("last7")}>Últimos 7 días</Button>

          <Button size="sm" variant={selected === "last30" ? "primary" : "outline"} onClick={() => setSelected("last30")}>Últimos 30 días</Button>
          <Button size="sm" variant={selected === "last90" ? "primary" : "outline"} onClick={() => setSelected("last90")}>Últimos 90 días</Button>
        </div>
      </div>
      */}
      {/* Espacio en blanco */}
      <div className="h-6" />

      {/* Filtros mejorados*/}
      <Filters
        value={filters}
        onChange={setFilters}
        proyectos={[{ id: "p1", nombre: "Proyecto A" }, { id: "p2", nombre: "Proyecto B" }]}
        usuarios={[{ id: "u1", nombre: "María" }, { id: "u2", nombre: "Juan" }]}
      />;


      {/* Espacio en blanco */}
      <div className="h-6" />

      {/* Chart cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard title="Cotizaciones por mes">
          <BarMonthly categories={months} series={[{ name: "Cotizaciones", data: quotesPerMonth }]} />
        </ComponentCard>
        <ComponentCard title="Monto y revenue (k)">
          <LineTrend
            categories={months}
            series={[
              { name: "Monto", data: amountPerMonth },
              { name: "Revenue", data: revenuePerMonth },
            ]}
          />
        </ComponentCard>
      </div>

      {/* Espacio en blanco */}
      <div className="h-6" />

      {/* Tabla */}
      <ComponentCard title="Todas las cotizaciones">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Listado general</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Exportar</Button>
            <Button size="sm">
              <Link to="/quotes/assignment">Asignaciones</Link>
            </Button>
          </div>
        </div>
        <QuotesTable data={quotes} />
      </ComponentCard>
    </>
  );
}
