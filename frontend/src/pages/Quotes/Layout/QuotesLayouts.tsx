import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


// Definición de las pestañas con la nueva propiedad 'supervisorOnly'
const allTabs = [
  { to: "/quotes", label: "Resumen", end: true },
  { to: "/quotes/new", label: "Nueva cotización" },
  { to: "/quotes/my-quotes", label: "Mis cotizaciónes" },
  // 🛑 Solo para Supervisores/Administradores
  { to: "/quotes/follow-ups", label: "Seguimiento", supervisorOnly: true },
  { to: "/quotes/rejected", label: "Rechazadas", supervisorOnly: true },
  { to: "/quotes/history", label: "Historial" },
  // 🛑 Solo para Supervisores/Administradores
];

export default function QuotesLayout() {
  // 🛑 Paso 1: Obtener el rol del usuario
  const { user, isLoading } = useAuth(); // Asegúrate de que este hook exista y devuelva { user: { role } }


  // Mostrar loading mientras carga
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

  // Si no hay usuario, no renderizar nada (ProtectedRoute redirigirá)
  if (!user) {
    return null;
  }
  // 🛑 Paso 2: Verificar si el usuario tiene permiso de Supervisor
  // DESPUÉS
  const isSupervisor = user?.rol?.nombre
    ? ['SUPERVISOR', 'ADMIN'].includes(user.rol.nombre.toUpperCase())
    : false;
  // 🛑 Paso 3: Filtrar las pestañas basado en el rol
  const visibleTabs = allTabs.filter(t => {
    // Si NO requiere rol especial, es visible para todos
    if (!t.supervisorOnly) {
      return true;
    }
    // Si SÍ requiere rol especial, solo es visible si es Supervisor
    return isSupervisor;
  });

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