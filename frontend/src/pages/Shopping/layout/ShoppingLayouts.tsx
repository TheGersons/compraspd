import { Outlet, NavLink } from "react-router-dom";

const tabs = [
  { to: "/shopping", label: "Resumen", end: true },
  { to: "/shopping/new", label: "Nueva compra" },
  { to: "/shopping/follow-ups", label: "Seguimiento" },
  { to: "/shopping/history", label: "Historial" },
];

export default function ShoppingLayout() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-2">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} end={t.end}
              children={({ isActive }) => (
                <span className={`px-3 py-2 rounded-t-lg text-sm font-medium
                  ${isActive ? "bg-brand-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  {t.label}
                </span>
              )}
            />
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
