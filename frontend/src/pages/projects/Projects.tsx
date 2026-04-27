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

interface Tipo {
  id: string;
  nombre: string;
  areaId: string;
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  criticidad: number;
  estado: boolean;
  creado: string;
  actualizado: string;
  areaId?: string;
  tipoId?: string;
  area?: Area;
  tipo?: Tipo;
  _count: { cotizaciones: number };
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = {
  async getProyectos(estado?: boolean): Promise<Proyecto[]> {
    const token = getToken();
    const params = new URLSearchParams();
    if (estado !== undefined) params.append("estado", estado.toString());
    const res = await fetch(`${API_BASE_URL}/api/v1/proyectos?${params}`, {
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

  async getTiposByArea(areaId: string): Promise<Tipo[]> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/tipos/area/${areaId}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
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

const PAGE_SIZE = 15;

function getCriticidadStyle(c: number) {
  if (c >= 8) return { dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", label: "Alta" };
  if (c >= 5) return { dot: "bg-amber-400", text: "text-amber-700 dark:text-amber-400", label: "Media" };
  return { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", label: "Baja" };
}

// ============================================================================
// PAGINATION
// ============================================================================

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
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {from}–{to} de <span className="font-medium text-gray-700 dark:text-gray-300">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-sm text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`h-7 min-w-[1.75rem] rounded-md px-1.5 text-sm font-medium transition-colors ${
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
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
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
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"all" | "active" | "closed">("active");
  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [filterTipoId, setFilterTipoId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);

  useEffect(() => {
    api.getAreas().then(setAreas).catch(() => {});
  }, []);

  // Cargar tipos cuando cambia el área filtrada
  useEffect(() => {
    if (!filterAreaId) {
      setTipos([]);
      setFilterTipoId("");
      return;
    }
    api.getTiposByArea(filterAreaId).then(setTipos).catch(() => setTipos([]));
  }, [filterAreaId]);

  useEffect(() => {
    const estado = filterEstado === "all" ? undefined : filterEstado === "active";
    setLoading(true);
    api
      .getProyectos(estado)
      .then(setProyectos)
      .catch((e) => addNotification("danger", "Error", e.message, { priority: "high" }))
      .finally(() => setLoading(false));
  }, [filterEstado]);

  // Búsqueda + filtro de área/tipo en frontend — reactivos al escribir
  const proyectosFiltrados = useMemo(() => {
    let result = proyectos;
    if (filterAreaId) result = result.filter((p) => p.area?.id === filterAreaId);
    if (filterTipoId) result = result.filter((p) => p.tipo?.id === filterTipoId);
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [proyectos, filterAreaId, filterTipoId, searchTerm]);

  // Reset página al cambiar filtros
  useEffect(() => { setCurrentPage(1); }, [filterEstado, filterAreaId, filterTipoId, searchTerm]);

  const totalPages = Math.ceil(proyectosFiltrados.length / PAGE_SIZE);
  const proyectosPaginados = proyectosFiltrados.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const reload = () => {
    const estado = filterEstado === "all" ? undefined : filterEstado === "active";
    setLoading(true);
    api
      .getProyectos(estado)
      .then(setProyectos)
      .catch((e) => addNotification("danger", "Error", e.message))
      .finally(() => setLoading(false));
  };

  const handleEliminar = async (proyecto: Proyecto) => {
    try {
      await api.deleteProyecto(proyecto.id);
      addNotification("success", "Eliminado", `"${proyecto.nombre}" eliminado.`);
      setProyectoAEliminar(null);
      reload();
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
      reload();
    } catch (e: any) {
      addNotification("danger", "Error", e.message);
    }
  };

  return (
    <>
      <PageMeta description="Lista de proyectos" title="Proyectos" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? "s" : ""}
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
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Select Área */}
          <div className="relative w-full sm:w-44">
            <select
              value={filterAreaId}
              onChange={(e) => setFilterAreaId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombreArea}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Select Tipo (depende del área) */}
          <div className="relative w-full sm:w-44">
            <select
              value={filterTipoId}
              onChange={(e) => setFilterTipoId(e.target.value)}
              disabled={!filterAreaId}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
            >
              <option value="">
                {!filterAreaId ? "Tipo (elige área)" : "Todos los tipos"}
              </option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Toggle Estado */}
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
        </div>

        {/* Lista */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : proyectosFiltrados.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">
                {searchTerm || filterAreaId ? "Sin resultados para los filtros aplicados" : "No hay proyectos aún"}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1.5fr_1fr_auto_auto_auto] items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                <span>Proyecto</span>
                <span>Área / Tipo</span>
                <span className="text-center">Criticidad</span>
                <span className="text-center">Estado</span>
                <span className="text-right">Acciones</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {proyectosPaginados.map((proyecto) => {
                  const crit = getCriticidadStyle(proyecto.criticidad);
                  return (
                    <div
                      key={proyecto.id}
                      className="grid grid-cols-[1.5fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      {/* Nombre + descripción */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {proyecto.nombre}
                        </p>
                        {proyecto.descripcion && (
                          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                            {proyecto.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Área / Tipo */}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs font-medium text-blue-700 dark:text-blue-400">
                          {proyecto.area?.nombreArea || "—"}
                        </span>
                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {proyecto.tipo?.nombre || (
                            <span className="italic text-amber-600 dark:text-amber-400">Sin tipo</span>
                          )}
                        </span>
                      </div>

                      {/* Criticidad */}
                      <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${crit.text}`}>
                        <span className={`h-2 w-2 rounded-full ${crit.dot}`} />
                        {crit.label}
                      </span>

                      {/* Estado */}
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          proyecto.estado
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {proyecto.estado ? "Activo" : "Cerrado"}
                      </span>

                      {/* Acciones */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/projects/edit/${proyecto.id}`)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleEstado(proyecto)}
                          title={proyecto.estado ? "Cerrar proyecto" : "Abrir proyecto"}
                          className={`rounded-lg p-1.5 transition-colors ${
                            proyecto.estado
                              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}
                        >
                          {proyecto.estado ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        {proyecto._count.cotizaciones === 0 && (
                          <button
                            onClick={() => setProyectoAEliminar(proyecto)}
                            title="Eliminar proyecto"
                            className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
