import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { getToken } from "../../lib/api";

// ============================================================================
// TYPES
// ============================================================================

interface Area {
  id: string;
  nombreArea: string;
  tipo: string;
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  criticidad: number;
  estado: boolean;
  creado: string;
  actualizado: string;
  area?: Area;
  _count: { cotizaciones: number };
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = {
  async getProyectos(params?: { estado?: boolean; search?: string }): Promise<Proyecto[]> {
    const token = getToken();
    const searchParams = new URLSearchParams();
    if (params?.estado !== undefined) searchParams.append("estado", params.estado.toString());
    if (params?.search) searchParams.append("search", params.search);
    const res = await fetch(`${API_BASE_URL}/api/v1/proyectos?${searchParams}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al cargar proyectos");
    return res.json();
  },

  async getAreas(): Promise<Area[]> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/areas`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al cargar áreas");
    return res.json();
  },

  async deleteProyecto(id: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al eliminar proyecto");
    }
    return res.json();
  },

  async closeProyecto(id: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}/close`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al cerrar proyecto");
    return res.json();
  },

  async openProyecto(id: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}/open`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al abrir proyecto");
    return res.json();
  },
};

// ============================================================================
// HELPERS
// ============================================================================

const PAGE_SIZE = 9;

function getCriticidadStyle(c: number) {
  if (c >= 8) return { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", label: "Alta" };
  if (c >= 5) return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Media" };
  return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Baja" };
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function ProyectoCard({
  proyecto,
  onEdit,
  onToggle,
  onDelete,
}: {
  proyecto: Proyecto;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const crit = getCriticidadStyle(proyecto.criticidad);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Top strip de criticidad */}
      <div
        className={`h-1 w-full rounded-t-2xl ${
          proyecto.criticidad >= 8
            ? "bg-rose-500"
            : proyecto.criticidad >= 5
            ? "bg-amber-400"
            : "bg-emerald-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
            {proyecto.nombre}
          </h3>
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              proyecto.estado
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {proyecto.estado ? "Activo" : "Cerrado"}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {proyecto.descripcion || "Sin descripción"}
        </p>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {proyecto.area?.nombreArea || "Sin área"}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${crit.bg} ${crit.text}`}>
            {crit.label} ({proyecto.criticidad}/10)
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {proyecto._count.cotizaciones} cotización{proyecto._count.cotizaciones !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={onToggle}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              proyecto.estado
                ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            }`}
          >
            {proyecto.estado ? "Cerrar" : "Abrir"}
          </button>
          {proyecto._count.cotizaciones === 0 && (
            <button
              onClick={onDelete}
              title="Eliminar proyecto"
              className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando <span className="font-medium text-gray-700 dark:text-gray-300">{from}–{to}</span> de{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">{totalItems}</span> proyectos
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Projects() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"all" | "active" | "closed">("active");
  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);

  useEffect(() => {
    api.getAreas().then(setAreas).catch(() => {});
  }, []);

  useEffect(() => {
    cargarProyectos();
  }, [filterEstado]);

  // Reset page whenever filters change
  useEffect(() => { setCurrentPage(1); }, [filterEstado, filterAreaId, searchTerm]);

  const cargarProyectos = async () => {
    const estado = filterEstado === "all" ? undefined : filterEstado === "active";
    try {
      setLoading(true);
      const data = await api.getProyectos({ estado, search: searchTerm || undefined });
      setProyectos(data);
    } catch (e: any) {
      addNotification("danger", "Error", e.message, { priority: "high" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    cargarProyectos();
  };

  const handleEliminar = async (proyecto: Proyecto) => {
    try {
      await api.deleteProyecto(proyecto.id);
      addNotification("success", "Eliminado", `"${proyecto.nombre}" eliminado.`);
      setProyectoAEliminar(null);
      cargarProyectos();
    } catch (e: any) {
      addNotification("danger", "Error", e.message, { priority: "high" });
      setProyectoAEliminar(null);
    }
  };

  const handleToggleEstado = async (proyecto: Proyecto) => {
    try {
      if (proyecto.estado) {
        await api.closeProyecto(proyecto.id);
        addNotification("info", "Proyecto cerrado", `"${proyecto.nombre}" cerrado.`);
      } else {
        await api.openProyecto(proyecto.id);
        addNotification("success", "Proyecto abierto", `"${proyecto.nombre}" abierto.`);
      }
      cargarProyectos();
    } catch (e: any) {
      addNotification("danger", "Error", e.message);
    }
  };

  // Filtro por área en el frontend
  const proyectosFiltrados = useMemo(() => {
    if (!filterAreaId) return proyectos;
    return proyectos.filter((p) => p.area?.id === filterAreaId);
  }, [proyectos, filterAreaId]);

  const totalPages = Math.ceil(proyectosFiltrados.length / PAGE_SIZE);
  const proyectosPaginados = proyectosFiltrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <PageMeta description="Lista de proyectos" title="Proyectos" />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? "s" : ""} encontrado{proyectosFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => navigate("/projects/new")} variant="primary">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proyecto
          </Button>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar por nombre o descripción..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Select Área */}
            <div className="relative w-full lg:w-52">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <select
                value={filterAreaId}
                onChange={(e) => setFilterAreaId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas las áreas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombreArea}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Estado toggle */}
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
              {(["active", "all", "closed"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterEstado(opt)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filterEstado === opt
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {opt === "active" ? "Activos" : opt === "all" ? "Todos" : "Cerrados"}
                </button>
              ))}
            </div>

            {/* Buscar */}
            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cargando proyectos...</p>
            </div>
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-3 text-base font-medium text-gray-900 dark:text-white">No hay proyectos</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterAreaId
                  ? "Intenta con otros filtros de búsqueda"
                  : "Crea tu primer proyecto para comenzar"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {proyectosPaginados.map((proyecto) => (
                <ProyectoCard
                  key={proyecto.id}
                  proyecto={proyecto}
                  onEdit={() => navigate(`/projects/edit/${proyecto.id}`)}
                  onToggle={() => handleToggleEstado(proyecto)}
                  onDelete={() => setProyectoAEliminar(proyecto)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={proyectosFiltrados.length}
              pageSize={PAGE_SIZE}
              onChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Modal Confirmar Eliminación */}
      {proyectoAEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setProyectoAEliminar(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">¿Eliminar proyecto?</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer. El proyecto{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">"{proyectoAEliminar.nombre}"</span>{" "}
              será eliminado permanentemente.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setProyectoAEliminar(null)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(proyectoAEliminar)}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
