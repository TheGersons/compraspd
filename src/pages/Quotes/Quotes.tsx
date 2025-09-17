// pages/Quotes/Quotes.tsx
import { useMemo } from "react";
import KpiCard from "./components/KpiCard";
import QuotesTable, { Quote } from "./components/QuotesTable";
import ChartCard from "./components/ChartCard";
import BarMonthly from "./charts/BarMonthly";
import LineTrend from "./charts/LineTrend";
import { months, quotesPerMonth, amountPerMonth, revenuePerMonth } from "./data/mock";
import Button from "../../components/ui/button/Button";
import { Link, NavLink } from "react-router";

export default function Quotes() {
  const quotes = useMemo<Quote[]>(
    () => [
      { id:"Q-2025-0012", customer:"Acme SA", createdAt:"2025-09-10", dueAt:"2025-09-20", assignedTo:"María", amount:15500, currency:"USD", status:"in_review" },
      { id:"Q-2025-0011", customer:"Globex",  createdAt:"2025-09-09", dueAt:"2025-09-16", assignedTo:undefined, amount:78000, currency:"HNL", status:"open" },
      { id:"Q-2025-0010", customer:"Soylent", createdAt:"2025-09-08", dueAt:"2025-09-12", assignedTo:"Kevin", amount:9500,  currency:"USD", status:"approved" },
      { id:"Q-2025-0009", customer:"Initech", createdAt:"2025-09-01", dueAt:"2025-09-05", assignedTo:"Ana",   amount:12000, currency:"USD", status:"expired" },
    ],
    []
  );

  const kpis = useMemo(() => {
    const total = quotes.length;
    const open = quotes.filter(q => q.status === "open" || q.status === "in_review").length;
    const unassigned = quotes.filter(q => !q.assignedTo).length;
    const dueSoon = quotes.filter(q => new Date(q.dueAt).getTime() - Date.now() < 3 * 86400000 && q.status !== "approved").length;
    return { total, open, unassigned, dueSoon };
  }, [quotes]);

  const tabs = [
    { to: "/quotes", label: "Resumen", end: true },
    { to: "/quotes/new", label: "Nueva" },
    { to: "/quotes/follow-ups", label: "Seguimiento" },
    { to: "/quotes/history", label: "Historial" },
    { to: "/quotes/assignment", label: "Asignación" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-title-sm sm:text-title-md font-semibold text-gray-800 dark:text-white/90">Cotizaciones</h1>
        <Button className="text-sm"><Link to="/quotes/new">Nueva cotización</Link></Button>
      </div>

      {/* submenú */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end as any}
            className={({ isActive }) =>
              `px-4 py-2 rounded-t-md text-sm
               ${isActive ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* KPIs con tonos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Cotizaciones totales" value={kpis.total} hint="Últimos 30 días" tone="brand" />
        <KpiCard title="Abiertas / En revisión" value={kpis.open} tone="warn" />
        <KpiCard title="Sin asignar" value={kpis.unassigned} tone="danger" />
        <KpiCard title="Prontas a vencer (≤ 3 días)" value={kpis.dueSoon} tone="warn" />
      </div>

      {/* Charts reales */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Cotizaciones por mes">
          <BarMonthly categories={months} series={[{ name: "Cotizaciones", data: quotesPerMonth }]} height={220} />
        </ChartCard>

        <ChartCard title="Monto y Revenue por mes (k)">
          <LineTrend
            categories={months}
            series={[
              { name: "Monto", data: amountPerMonth },
              { name: "Revenue", data: revenuePerMonth },
            ]}
            height={280}
          />
        </ChartCard>
      </div>

      {/* Tabla */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Todas las cotizaciones</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-sm">Exportar</Button>
            <Button size="sm" className="text-sm"><Link to="/quotes/assignment">Asignaciones</Link></Button>
          </div>
        </div>
        <QuotesTable data={quotes} />
      </div>
    </div>
  );
}
