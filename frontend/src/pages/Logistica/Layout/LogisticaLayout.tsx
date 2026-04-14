import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const allTabs = [
  { to: "/logistica/cotizaciones",  label: "Cotizaciones",  roles: ["ADMIN", "SUPERVISOR", "JEFE_COMPRAS", "COMERCIAL"] },
  { to: "/logistica/historial",     label: "Historial" },
  { to: "/logistica/rechazadas",    label: "Rechazadas",    roles: ["ADMIN", "SUPERVISOR", "JEFE_COMPRAS"] },
  { to: "/logistica/compras",       label: "Compras",       roles: ["ADMIN", "SUPERVISOR", "JEFE_COMPRAS", "COMERCIAL"] },
  { to: "/logistica/documentos",    label: "Documentos",    roles: ["ADMIN", "SUPERVISOR", "JEFE_COMPRAS", "COMERCIAL"] },
];

export default function LogisticaLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const userRole = user?.rol?.nombre?.toUpperCase() || "";
  const visibleTabs = allTabs.filter(t => !t.roles || t.roles.includes(userRole));

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-2">
          {visibleTabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end
              children={({ isActive }) => (
                <span className={`px-3 py-2 rounded-t-lg text-sm font-medium
                  ${isActive
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}>
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
