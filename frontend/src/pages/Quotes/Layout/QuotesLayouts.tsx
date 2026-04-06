import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


// Orden sincronizado con AppSidebar: Resumen, Nueva, Mis, Seguimiento, Rechazadas, Historial
const allTabs = [
  { to: "/quotes", label: "Resumen", end: true, roles: ['ADMIN', 'SUPERVISOR', 'COMERCIAL'] },
  { to: "/quotes/new", label: "Nueva cotización" },
  { to: "/quotes/my-quotes", label: "Mis cotizaciónes" },
  { to: "/quotes/follow-ups", label: "Seguimiento", roles: ['ADMIN', 'SUPERVISOR', 'COMERCIAL'] },
  { to: "/quotes/rejected", label: "Rechazadas", roles: ['ADMIN', 'SUPERVISOR'] },
  { to: "/quotes/reportes", label: "Reportes", roles: ['ADMIN', 'SUPERVISOR'] },
  { to: "/quotes/history", label: "Historial" },
];

export default function QuotesLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user?.rol?.nombre?.toUpperCase() || '';
  const visibleTabs = allTabs.filter(t => !t.roles || t.roles.includes(userRole));

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-2">
          {visibleTabs.map(t => ( // 🛑 Mapeamos la lista filtrada
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
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