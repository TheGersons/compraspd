import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


// Definición de las pestañas con la nueva propiedad 'supervisorOnly'
const allTabs = [
  { to: "/quotes", label: "Resumen", end: true },
  { to: "/quotes/new", label: "Nueva cotización" },
  // 🛑 Solo para Supervisores/Administradores
  { to: "/quotes/follow-ups", label: "Seguimiento", supervisorOnly: true }, 
  { to: "/quotes/history", label: "Historial" },
  // 🛑 Solo para Supervisores/Administradores
  { to: "/quotes/assignment", label: "Asignación", supervisorOnly: true },
];

export default function QuotesLayout() {
  // 🛑 Paso 1: Obtener el rol del usuario
  const { user } = useAuth(); // Asegúrate de que este hook exista y devuelva { user: { role } }

  // 🛑 Paso 2: Verificar si el usuario tiene permiso de Supervisor
  const isSupervisor = user && ['SUPERVISOR', 'ADMIN'].includes(user.role?.toUpperCase());

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