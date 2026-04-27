import { useState, useEffect, useMemo } from "react";
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
  creado: string;
  area: { id: string; nombreArea: string; tipo: string };
  _count: { cotizaciones: number; proyectos: number };
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = {
  async getTipos(): Promise<Tipo[]> {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/tipos`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al cargar tipos");
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

  async createTipo(data: { nombre: string; areaId: string }) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/tipos`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al crear tipo");
    }
    return res.json();
  },

  async updateTipo(id: string, data: { nombre?: string; areaId?: string }) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/tipos/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al actualizar tipo");
    }
    return res.json();
  },

  async deleteTipo(id: string) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/tipos/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al eliminar tipo");
    }
    return res.json();
  },
};

// ============================================================================
// MODAL FORM
// ============================================================================

function TipoFormModal({
  open,
  initial,
  areas,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Tipo | null;
  areas: Area[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { addNotification } = useNotifications();
  const [nombre, setNombre] = useState("");
  const [areaId, setAreaId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(initial?.nombre || "");
      setAreaId(initial?.areaId || "");
    }
  }, [open, initial]);

  if (!open) return null;

  const isEditing = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      addNotification("warn", "Validación", "El nombre es obligatorio");
      return;
    }
    if (!areaId) {
      addNotification("warn", "Validación", "Debes seleccionar un área");
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await api.updateTipo(initial!.id, { nombre: nombre.trim(), areaId });
        addNotification("success", "Tipo actualizado", `"${nombre.trim()}" actualizado.`);
      } else {
        await api.createTipo({ nombre: nombre.trim(), areaId });
        addNotification("success", "Tipo creado", `"${nombre.trim()}" creado.`);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      addNotification("danger", "Error", e.message, { priority: "high" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Editar Tipo" : "Nuevo Tipo"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Los tipos son las categorías que se usan al crear cotizaciones.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              autoFocus
              placeholder="Ej: Administrativo"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Área <span className="text-rose-500">*</span>
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione un área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombreArea}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Types() {
  const { addNotification } = useNotifications();

  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAreaId, setFilterAreaId] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<Tipo | null>(null);
  const [tipoAEliminar, setTipoAEliminar] = useState<Tipo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([api.getTipos(), api.getAreas()]);
      setTipos(t);
      setAreas(a);
    } catch (e: any) {
      addNotification("danger", "Error", e.message, { priority: "high" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const tiposFiltrados = useMemo(() => {
    let result = tipos;
    if (filterAreaId) result = result.filter((t) => t.area.id === filterAreaId);
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.nombre.toLowerCase().includes(q) ||
          t.area.nombreArea.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tipos, filterAreaId, searchTerm]);

  const handleOpenCreate = () => {
    setTipoEditando(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (tipo: Tipo) => {
    setTipoEditando(tipo);
    setFormOpen(true);
  };

  const handleEliminar = async () => {
    if (!tipoAEliminar) return;
    try {
      setEliminando(true);
      await api.deleteTipo(tipoAEliminar.id);
      addNotification("success", "Eliminado", `"${tipoAEliminar.nombre}" eliminado.`);
      setTipoAEliminar(null);
      cargar();
    } catch (e: any) {
      addNotification("danger", "Error", e.message, { priority: "high" });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <PageMeta description="Gestión de tipos / categorías" title="Tipos" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipos / Categorías</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {tiposFiltrados.length} tipo{tiposFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={handleOpenCreate} variant="primary">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Tipo
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center">
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
              placeholder="Buscar por nombre o área..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="relative w-full sm:w-52">
            <select
              value={filterAreaId}
              onChange={(e) => setFilterAreaId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
        </div>

        {/* Lista */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : tiposFiltrados.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-sm">
                {searchTerm || filterAreaId ? "Sin resultados para los filtros" : "No hay tipos aún"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1.5fr_1fr_auto_auto_auto] items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                <span>Nombre</span>
                <span>Área</span>
                <span className="text-center">Cotizaciones</span>
                <span className="text-center">Proyectos</span>
                <span className="text-right">Acciones</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {tiposFiltrados.map((tipo) => {
                  const enUso = tipo._count.cotizaciones > 0 || tipo._count.proyectos > 0;
                  return (
                    <div
                      key={tipo.id}
                      className="grid grid-cols-[1.5fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {tipo.nombre}
                        </p>
                      </div>

                      <span className="truncate text-xs font-medium text-blue-700 dark:text-blue-400">
                        {tipo.area.nombreArea}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {tipo._count.cotizaciones}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {tipo._count.proyectos}
                      </span>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(tipo)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTipoAEliminar(tipo)}
                          disabled={enUso}
                          title={
                            enUso
                              ? `No se puede eliminar (${tipo._count.cotizaciones} cotizaciones, ${tipo._count.proyectos} proyectos)`
                              : "Eliminar tipo"
                          }
                          className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-rose-900/20"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <TipoFormModal
        open={formOpen}
        initial={tipoEditando}
        areas={areas}
        onClose={() => setFormOpen(false)}
        onSaved={cargar}
      />

      {/* Modal Confirmar Eliminación */}
      {tipoAEliminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !eliminando && setTipoAEliminar(null)}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">¿Eliminar tipo?</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Se eliminará el tipo{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">"{tipoAEliminar.nombre}"</span>{" "}
              del área{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{tipoAEliminar.area.nombreArea}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setTipoAEliminar(null)}
                disabled={eliminando}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex flex-1 items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {eliminando ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
