import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { getToken } from "../../lib/api";

// ============================================================================
// TYPES
// ============================================================================

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  criticidad: number;
  estado: boolean;
  creado: string;
  actualizado: string;
  area?: { id: string; nombreArea: string; tipo: string };
  _count: {
    cotizaciones: number;
  };
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const token = getToken();

const api = {
  async getProyectos(params?: { estado?: boolean; search?: string }): Promise<Proyecto[]> {
    const searchParams = new URLSearchParams();
    if (params?.estado !== undefined) searchParams.append('estado', params.estado.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/proyectos?${searchParams}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar proyectos");
    return response.json();
  },

  async deleteProyecto(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al eliminar proyecto");
    }
    return response.json();
  },

  async closeProyecto(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}/close`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cerrar proyecto");
    return response.json();
  },

  async openProyecto(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}/open`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al abrir proyecto");
    return response.json();
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Projects() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<boolean | undefined>(true); // Default: solo activos
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);

  useEffect(() => {
    cargarProyectos();
  }, [filterEstado]);

  const cargarProyectos = async () => {
    try {
      setLoading(true);
      const data = await api.getProyectos({ estado: filterEstado, search: searchTerm });
      setProyectos(data);
    } catch (error: any) {
      console.error("Error al cargar proyectos:", error);
      addNotification("danger", "Error", error.message, { priority: "high" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    cargarProyectos();
  };

  const handleEliminar = async (proyecto: Proyecto) => {
    try {
      await api.deleteProyecto(proyecto.id);
      addNotification(
        "success",
        "Proyecto eliminado",
        `El proyecto "${proyecto.nombre}" ha sido eliminado exitosamente.`
      );
      setProyectoAEliminar(null);
      cargarProyectos();
    } catch (error: any) {
      addNotification("danger", "Error", error.message, { priority: "high" });
      setProyectoAEliminar(null);
    }
  };

  const handleToggleEstado = async (proyecto: Proyecto) => {
    try {
      if (proyecto.estado) {
        await api.closeProyecto(proyecto.id);
        addNotification("info", "Proyecto cerrado", `"${proyecto.nombre}" ha sido cerrado.`);
      } else {
        await api.openProyecto(proyecto.id);
        addNotification("success", "Proyecto abierto", `"${proyecto.nombre}" ha sido abierto.`);
      }
      cargarProyectos();
    } catch (error: any) {
      addNotification("danger", "Error", error.message);
    }
  };

  const getCriticidadColor = (criticidad: number) => {
    if (criticidad >= 8) return "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30";
    if (criticidad >= 5) return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
  };

  const getCriticidadLabel = (criticidad: number) => {
    if (criticidad >= 8) return "Alta";
    if (criticidad >= 5) return "Media";
    return "Baja";
  };

  return (
    <>
      <PageMeta description="Lista de proyectos" title="Proyectos" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Proyectos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Administra los proyectos de tu organización
            </p>
          </div>
          <Button onClick={() => navigate("/projects/new")} variant="primary">
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proyecto
          </Button>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Buscar por nombre o descripción..."
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filtro Estado */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterEstado(undefined)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filterEstado === undefined
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterEstado(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filterEstado === true
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterEstado(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filterEstado === false
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
              >
                Cerrados
              </button>
            </div>
          </div>
        </div>

        {/* Tabla/Cards */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando proyectos...</p>
            </div>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay proyectos
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Crea tu primer proyecto para comenzar"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {proyecto.nombre}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {proyecto.descripcion || "Sin descripción"}
                    </p>
                  </div>
                  <span
                    className={`ml-2 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${proyecto.estado
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                  >
                    {proyecto.estado ? "Activo" : "Cerrado"}
                  </span>
                </div>

                {/* Stats */}
                <div className="mb-4 flex items-center gap-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Área</p>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {proyecto.area?.nombreArea || "Sin área"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Criticidad</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getCriticidadColor(proyecto.criticidad)}`}>
                      {getCriticidadLabel(proyecto.criticidad)} ({proyecto.criticidad}/10)
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cotizaciones</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {proyecto._count.cotizaciones}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/projects/edit/${proyecto.id}`)}
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleToggleEstado(proyecto)}
                    size="sm"
                    variant={proyecto.estado ? "secondary" : "primary"}
                    className="flex-1"
                  >
                    {proyecto.estado ? "Cerrar" : "Abrir"}
                  </Button>
                  {proyecto._count.cotizaciones === 0 && (
                    <button
                      onClick={() => setProyectoAEliminar(proyecto)}
                      className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
                      title="Eliminar proyecto"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Confirmar Eliminación */}
      {proyectoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ¿Eliminar proyecto?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar el proyecto "{proyectoAEliminar.nombre}"? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setProyectoAEliminar(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleEliminar(proyectoAEliminar)}
                variant="danger"
                className="flex-1"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}