import { Outlet, NavLink } from "react-router";

const tabs = [
  { to: "/quotes", label: "Resumen", end: true },
  { to: "/quotes/new", label: "Nueva cotización" },
  { to: "/quotes/follow-ups", label: "Seguimiento" },
  { to: "/quotes/history", label: "Historial" },
  { to: "/quotes/assignment", label: "Asignación" },
];

export default function QuotesLayout() {
  return (
    <div className="flex flex-col">
      {/* Subnavegación */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}>
            {({ isActive }) => (
              <span
                className={`px-4 py-2 text-sm rounded-t-md ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {t.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Aquí se renderizan las páginas hijas */}
      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
}
