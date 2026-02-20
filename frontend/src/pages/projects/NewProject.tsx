import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  areaId?: string;
  area?: { id: string; nombreArea: string };
  creado: string;
  actualizado: string;
}

interface Area {
  id: string;
  nombreArea: string;
  tipo: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const token = getToken();

const api = {
  async getProyecto(id: string): Promise<Proyecto> {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar proyecto");
    return response.json();
  },

  async crearProyecto(data: { nombre: string; descripcion: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear proyecto");
    }

    return response.json();
  },

  async actualizarProyecto(id: string, data: { nombre?: string; descripcion?: string; areaId?: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar proyecto");
    }

    return response.json();
  },

  async getAreas(): Promise<Area[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/areas`, {
      credentials: "include", headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useNotifications();
  const isEditing = !!id;

  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  // Cargar proyecto si es edición
  useEffect(() => {
    api.getAreas().then(setAreas);
    if (isEditing) {
      cargarProyecto();
    }
  }, [id]);

  const cargarProyecto = async () => {
    try {
      setLoadingData(true);
      const proyecto = await api.getProyecto(id!);
      setNombre(proyecto.nombre);
      setDescripcion(proyecto.descripcion || "");
      setAreaId(proyecto.areaId || "");
    } catch (error: any) {
      console.error("Error al cargar proyecto:", error);
      addNotification("danger", "Error", error.message, { priority: "high" });
      navigate("/projects");
    } finally {
      setLoadingData(false);
    }
  };

  // Validación
  const validarFormulario = (): string | null => {
    if (!nombre.trim()) return "El nombre del proyecto es obligatorio";
    if (nombre.length > 200) return "El nombre no puede exceder 200 caracteres";
    if (descripcion.length > 1000) return "La descripción no puede exceder 1000 caracteres";
    return null;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar
    const error = validarFormulario();
    if (error) {
      addNotification("warn", "Validación", error, { priority: "medium" });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || "",
        areaId: areaId || undefined,
      };

      if (isEditing) {
        const resultado = await api.actualizarProyecto(id!, payload);
        addNotification(
          "success",
          "¡Proyecto actualizado!",
          `El proyecto "${resultado.nombre}" ha sido actualizado exitosamente.`
        );
      } else {
        const resultado = await api.crearProyecto(payload);
        addNotification(
          "success",
          "¡Proyecto creado!",
          `El proyecto "${resultado.nombre}" ha sido creado exitosamente.`
        );
      }

      // Redirigir
      setTimeout(() => {
        navigate("/projects");
      }, 1000);
    } catch (error: any) {
      console.error("Error:", error);
      addNotification(
        "danger",
        isEditing ? "Error al actualizar proyecto" : "Error al crear proyecto",
        error.message,
        { priority: "high" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <>
        <PageMeta description="Cargando" title="Cargando..." />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando proyecto...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta description={isEditing ? "Editar Proyecto" : "Nuevo Proyecto"} title={isEditing ? "Editar Proyecto" : "Nuevo Proyecto"} />

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/projects")}
            className="mb-4 flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Proyectos
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isEditing
              ? "Modifica la información del proyecto"
              : "Completa los datos para crear un nuevo proyecto"}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Información General
            </h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del Proyecto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={200}
                  placeholder="Ej: Renovación de Infraestructura IT"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {nombre.length}/200 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Descripción detallada del proyecto..."
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {descripcion.length}/1000 caracteres
                </p>
              </div>

              {/* Área */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Área <span className="text-rose-500">*</span>
                </label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Seleccione un área</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombreArea}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/projects")}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEditing ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{isEditing ? "Actualizar Proyecto" : "Crear Proyecto"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}