import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { getToken } from "../../lib/api";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import "../../components/common/datepick.css";
import DatePicker from "../../components/common/DatePicker";


// ============================================================================
// TYPES
// ============================================================================

type TipoCompra = "NACIONAL" | "INTERNACIONAL";
type LugarEntrega = "ALMACEN" | "OFICINA" | "PROYECTO";
type TipoUnidad = "UNIDAD" | "CAJA" | "PAQUETE" | "METRO" | "Pies" | "KILOGRAMO" | "LITRO" | "OTRO";

interface ArchivoAdjunto {
  file: File;
  id: string; // local key para el preview
  estado: "pendiente" | "subiendo" | "ok" | "error";
  error?: string;
}

interface ItemCotizacion {
  // sku eliminado - será autoasignado por backend
  descripcionProducto: string;
  cantidad: number;
  tipoUnidad: TipoUnidad;
  notas?: string;
}

interface Tipo {
  id: string;
  nombre: string;
  areaId: string;
  area: {
    id: string;
    nombreArea: string;
    tipo: string;
  };
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  departamento: {
    nombre: string;
  };
  rol: {
    nombre: string;
    descripcion: string;
  };
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
  areaId?: string;
  area?: { id: string; nombreArea: string; tipo: string };
}

interface AreaCategoria {
  id: string;
  nombreArea: string;
  tipo: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const api = {

  async getCurrentUser(): Promise<Usuario> {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener usuario actual");
      return response.json();
    } catch (error) {
      throw error;
    } finally {

    }

  },

  async getTipos(): Promise<Tipo[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/tipos`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar tipos");
    return response.json();
  },

  async getUsuarios(): Promise<Usuario[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/all`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar usuarios");
    return response.json();
  },

  async getProyectos(): Promise<Proyecto[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al cargar proyectos");
    return response.json();
  },

  async crearCotizacion(data: any) {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations`, {
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
      throw new Error(error.message || "Error al crear cotización");
    }

    return response.json();
  },

  async getAreas(): Promise<AreaCategoria[]> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/areas`, {
      credentials: "include", headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  },

  async crearProyecto(data: { nombre: string; areaId: string }): Promise<Proyecto> {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proyectos`, {
      method: "POST", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, criticidad: 5 }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al crear proyecto"); }
    return response.json();
  },

  async subirArchivosChat(chatId: string, archivos: File[]): Promise<{ ok: File[]; error: File[] }> {
    const ok: File[] = [];
    const error: File[] = [];
    await Promise.all(
      archivos.map(async (file) => {
        try {
          const token = await getToken();
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/upload`, {
            method: "POST",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!response.ok) throw new Error("Error al subir archivo");
          ok.push(file);
        } catch {
          error.push(file);
        }
      })
    );
    return { ok, error };
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function New() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [nombreCotizacion, setNombreCotizacion] = useState("");
  const [tipoCompra, setTipoCompra] = useState<TipoCompra>("NACIONAL");
  const [lugarEntrega, setLugarEntrega] = useState<LugarEntrega>("ALMACEN");
  const [comentarios, setComentarios] = useState("");
  const [tipoId, setTipoId] = useState("");
  const { user, isLoading } = useAuth();

  const [solicitanteId, setSolicitanteId] = useState("");
  const [searchSolicitante, setSearchSolicitante] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [items, setItems] = useState<ItemCotizacion[]>([
    { descripcionProducto: "", cantidad: 1, tipoUnidad: "UNIDAD", notas: "" },
  ]);
  const [fechaLimite, setFechaLimite] = useState<Date | null>(null);

  // Calcular fecha mínima (+5 días hábiles desde hoy, sin contar sábados ni domingos)
  const minDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    let diasHabiles = 0;
    while (diasHabiles < 5) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) diasHabiles++;
    }
    return date;
  })();
  // Catálogos
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [areas, setAreas] = useState<AreaCategoria[]>([]);

  // Modal crear proyecto
  const [showNuevoProyecto, setShowNuevoProyecto] = useState(false);
  const [nuevoProyectoNombre, setNuevoProyectoNombre] = useState("");
  const [nuevoProyectoAreaId, setNuevoProyectoAreaId] = useState("");
  const [creandoProyecto, setCreandoProyecto] = useState(false);

  // Archivos adjuntos
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);


  // 1. LOADING
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  // Cargar catálogos al montar
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {

    try {
      setIsLoading(true);
      setLoadingCatalogos(true);
      setError(null);
      const [tiposResult, usuariosResult, proyectosResult, areasResult] = await Promise.allSettled([
        api.getTipos(),
        api.getUsuarios(),
        api.getProyectos(),
        api.getAreas(),
      ]);
      // 1. Manejar Tipos (CON VALIDACIÓN DE NULOS EXTRA)
      if (tiposResult.status === 'fulfilled') {
        // Si tiposResult.value es null o undefined, usamos [] para evitar pantallas blancas
        const datosSeguros = tiposResult.value || [];
        setTipos(datosSeguros);
      } else {
        console.warn("⚠️ Error cargando Tipos:", tiposResult.reason);
        setTipos([]);
      }

      // 2. Manejar Usuarios
      if (usuariosResult.status === 'fulfilled') {
        // Validamos también aquí por seguridad básica
        const usuariosSeguros = usuariosResult.value || [];
        setUsuarios(usuariosSeguros.filter((u: any) => u.activo));
      } else {
        // Aquí suele caer el 401, lo manejamos silenciosamente
        console.warn("⚠️ Error cargando Usuarios (posible 401):", usuariosResult.reason);
        setUsuarios([]);
      }

      // 3. Manejar Proyectos
      if (proyectosResult.status === 'fulfilled') {
        const proyectosSeguros = proyectosResult.value || [];
        setProyectos(proyectosSeguros.filter((p: any) => p.estado));
      } else {
        console.warn("⚠️ Error cargando Proyectos:", proyectosResult.reason);
        setProyectos([]);
      }

      // 4. Manejar Áreas
      if (areasResult.status === 'fulfilled') {
        setAreas(areasResult.value || []);
      }

      // Obtener usuario actual del endpoint /auth/me
      try {
        setSolicitanteId(user.id);
      } catch (error) {
        console.log('⚠️ No se pudo obtener usuario actual:', error);
      }

    } catch (error) {
      console.error("Error al cargar catálogos:", error);
      setError("No se pudieron cargar los catálogos necesarios. Por favor, recarga la página.");
      addNotification(
        "danger",
        "Error al cargar datos",
        "No se pudieron cargar los catálogos necesarios. Por favor, recarga la página.",
        { priority: "critical", source: "Nueva Cotización" }
      );
    } finally {
      setIsLoading(false);
      setLoadingCatalogos(false);
    }
  };

  useEffect(() => {
    if (!proyectoId && lugarEntrega === "PROYECTO") {

      setLugarEntrega("ALMACEN");
      addNotification(
        "info",
        "Lugar de entrega actualizado",
        "Se cambió a Almacén porque no hay proyecto seleccionado.",
        { priority: "low" }
      );


    }
  }, [proyectoId]);

  // Manejo de items
  const agregarItem = () => {
    setItems([
      ...items,
      { descripcionProducto: "", cantidad: 1, tipoUnidad: "UNIDAD", notas: "" },
    ]);
  };

  const eliminarItem = (index: number) => {
    if (items.length === 1) {
      addNotification("warn", "Atención", "Debe haber al menos un item en la cotización.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (index: number, campo: keyof ItemCotizacion, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    setItems(nuevosItems);
  };

  // Manejo de archivos adjuntos
  const agregarArchivos = (files: FileList | File[]) => {
    const nuevos: ArchivoAdjunto[] = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      estado: "pendiente" as const,
    }));
    setArchivos((prev) => [...prev, ...nuevos]);
  };

  const eliminarArchivo = (id: string) => {
    setArchivos((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) agregarArchivos(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  };

  // Validación
  const validarFormulario = (): string | null => {
    if (!nombreCotizacion.trim()) return "El nombre de la cotización es obligatorio";
    if (!tipoId) return "Debe seleccionar un tipo de cotización";
    if (!solicitanteId) return "Debe seleccionar un solicitante";
    // ESTO ES LO CORRECTO
    // Solo pide proyecto si el lugar de entrega es explícitamente 'PROYECTO'
    if (!proyectoId && lugarEntrega === 'PROYECTO') {
      return "Debe seleccionar un proyecto cuando el lugar de entrega es 'Proyecto'";
    }
    if (!fechaLimite) return "La fecha límite es obligatoria";

    // Validar fecha
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(fechaLimite);

    if (limite < hoy) return "La fecha límite no puede ser en el pasado";

    // Validar items (SKU eliminado de validación)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.descripcionProducto.trim()) return `La descripción del item ${i + 1} es obligatoria`;
      if (item.cantidad <= 0) return `La cantidad del item ${i + 1} debe ser mayor a 0`;
    }

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

      const fechaEstimadaDefault = new Date();
      fechaEstimadaDefault.setDate(fechaEstimadaDefault.getDate() + 30); // +30 días
      // Preparar datos (SKU eliminado del payload)
      const payload = {
        nombreCotizacion: nombreCotizacion.trim(),
        tipoCompra,
        lugarEntrega,
        fechaLimite: fechaLimite?.toISOString(),
        fechaEstimada: fechaEstimadaDefault.toISOString(),
        comentarios: comentarios.trim() || undefined,
        tipoId,
        solicitanteId,
        proyectoId,
        items: items.map(item => ({
          // sku eliminado - backend lo asignará automáticamente
          descripcionProducto: item.descripcionProducto.trim(),
          cantidad: item.cantidad,
          tipoUnidad: item.tipoUnidad,
          notas: item.notas?.trim() || undefined,
        })),
      };

      const resultado = await api.crearCotizacion(payload);

      // Subir archivos adjuntos al chat (si hay)
      if (archivos.length > 0 && resultado.chatId) {
        // Marcar todos como "subiendo"
        setArchivos((prev) => prev.map((a) => ({ ...a, estado: "subiendo" as const })));

        const { ok, error: errores } = await api.subirArchivosChat(
          resultado.chatId,
          archivos.map((a) => a.file)
        );

        // Actualizar estados individuales
        setArchivos((prev) =>
          prev.map((a) => ({
            ...a,
            estado: errores.includes(a.file) ? ("error" as const) : ("ok" as const),
          }))
        );

        if (errores.length > 0 && ok.length === 0) {
          addNotification("warn", "Archivos no subidos", `La cotización se creó pero no se pudieron subir ${errores.length} archivo(s). Puedes adjuntarlos desde el chat en Mis Cotizaciones.`);
        } else if (errores.length > 0) {
          addNotification("warn", "Algunos archivos fallaron", `${ok.length} archivo(s) subidos, ${errores.length} fallaron. Puedes adjuntar los faltantes desde el chat.`);
        }
      }

      addNotification(
        "success",
        "¡Cotización creada!",
        `La cotización "${resultado.nombreCotizacion}" ha sido creada exitosamente.`,
        {
          priority: "medium",
          source: "Nueva Cotización",
          actionUrl: `/quotes/${resultado.id}`,
        }
      );

      // Redirigir
      setTimeout(() => {
        navigate("/quotes");
      }, 1500);
    } catch (error: any) {
      console.error("Error al crear cotización:", error);
      addNotification(
        "danger",
        "Error al crear cotización",
        error.message || "Ocurrió un error inesperado. Intenta nuevamente.",
        { priority: "critical", source: "Nueva Cotización" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading y error states
  if (loadingCatalogos) {
    return <LoadingScreen message="Cargando formulario de cotización..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarCatalogos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Nueva Cotización" description="Crear una nueva cotización" />

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Nueva Cotización
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Complete el formulario para crear una nueva solicitud de cotización
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Información General
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Cotización <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nombreCotizacion}
                onChange={(e) => setNombreCotizacion(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                placeholder="Ej: Cotización Laptops Octubre"
                required
              />
            </div>

            {/* Tipo de Compra */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Compra <span className="text-rose-500">*</span>
              </label>
              <select
                value={tipoCompra}
                onChange={(e) => setTipoCompra(e.target.value as TipoCompra)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="NACIONAL">Nacional</option>
                <option value="INTERNACIONAL">Internacional</option>
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo/Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="">Seleccione un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} - {tipo.area.nombreArea}
                  </option>
                ))}
              </select>
            </div>

            {/* Proyecto - Filtrado por área del tipo seleccionado */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proyecto <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(e.target.value.length < 5 ? null : e.target.value)}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Seleccione un proyecto</option>
                  {(() => {
                    const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                    const areaNombre = tipoSeleccionado?.area?.nombreArea?.toLowerCase();
                    const proyectosFiltrados = areaNombre
                      ? proyectos.filter(p => p.area?.nombreArea?.toLowerCase() === areaNombre)
                      : proyectos;
                    return proyectosFiltrados.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre} {proyecto.area ? `(${proyecto.area.nombreArea})` : ''}
                      </option>
                    ));
                  })()}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                    setNuevoProyectoAreaId(tipoSeleccionado?.area?.id || '');
                    setNuevoProyectoNombre('');
                    setShowNuevoProyecto(true);
                  }}
                  className="rounded-lg border-2 border-dashed border-gray-300 px-3 py-2.5 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors dark:border-gray-600 dark:text-gray-400"
                  title="Crear nuevo proyecto"
                >
                  +
                </button>
              </div>
              {tipoId && (() => {
                const tipoSeleccionado = tipos.find(t => t.id === tipoId);
                return tipoSeleccionado?.area ? (
                  <p className="mt-1 text-xs text-gray-500">Mostrando proyectos de: {tipoSeleccionado.area.nombreArea}</p>
                ) : null;
              })()}
            </div>

            {/* Solicitante - Combobox con búsqueda */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Solicitante <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                {solicitanteId ? (
                  // Mostrar usuario seleccionado con botón X
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      {usuarios.find(u => u.id === solicitanteId)?.nombre || 'Usuario seleccionado'}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {usuarios.find(u => u.id === solicitanteId)?.departamento.nombre}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSolicitanteId('');
                        setSearchSolicitante('');
                      }}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border-2 border-rose-300 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                      title="Limpiar solicitante"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // Input de búsqueda + lista filtrada
                  <div className="relative">
                    <input
                      type="text"
                      value={searchSolicitante}
                      onChange={(e) => setSearchSolicitante(e.target.value)}
                      placeholder="Buscar solicitante por nombre..."
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                    <svg
                      className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchSolicitante && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                        {usuarios
                          .filter(u =>
                            u.nombre.toLowerCase().includes(searchSolicitante.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(usuario => (
                            <button
                              key={usuario.id}
                              type="button"
                              onClick={() => {
                                setSolicitanteId(usuario.id);
                                setSearchSolicitante('');
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                {usuario.nombre}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {usuario.departamento.nombre} • {usuario.rol.nombre}
                              </div>
                            </button>
                          ))}
                        {usuarios.filter(u =>
                          u.nombre.toLowerCase().includes(searchSolicitante.toLowerCase())
                        ).length === 0 && (
                            <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No se encontraron resultados
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lugar de Entrega */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lugar de Entrega <span className="text-rose-500">*</span>
              </label>
              <select
                value={lugarEntrega}
                onChange={(e) => setLugarEntrega(e.target.value as LugarEntrega)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                required
              >
                <option value="ALMACEN">Almacén</option>
                <option value="OFICINA">Oficina</option>
                <option value="PROYECTO" disabled={!proyectoId}>
                  Proyecto {!proyectoId && "(seleccione proyecto primero)"}
                </option>
              </select>
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha Límite <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                selected={fechaLimite}
                onChange={(date) => setFechaLimite(date)}
                minDate={minDate}
                placeholder="Seleccionar fecha límite"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 5 días a partir de hoy
              </p>
            </div>

            {/* Comentarios */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentarios o Instrucciones Especiales
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                placeholder="Añade cualquier comentario relevante..."
              />
            </div>
          </div>
        </div>

        {/* Items de la Cotización */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items de la Cotización
            </h2>
            <Button
              onClick={agregarItem}
              size="sm"
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="rounded-lg p-1.5 text-rose-600 transition-colors hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/30"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Grid cambiado de 4 a 3 columnas, SKU eliminado */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Descripción - ahora ocupa más espacio */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Descripción del Producto <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.descripcionProducto}
                      onChange={(e) => actualizarItem(index, "descripcionProducto", e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Laptop Dell Latitude 5420"
                      required
                    />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Cantidad <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, "cantidad", parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      required
                    />
                  </div>

                  {/* Tipo de Unidad */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Tipo Unidad <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.tipoUnidad}
                      onChange={(e) => actualizarItem(index, "tipoUnidad", e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      required
                    >
                      <option value="UNIDAD">Unidad</option>
                      <option value="CAJA">Caja</option>
                      <option value="PAQUETE">Paquete</option>
                      <option value="METRO">Metro</option>
                      <option value="PIES">Pies</option>
                      <option value="KILOGRAMO">Kilogramo</option>
                      <option value="LITRO">Litro</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  {/* Notas */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Notas/Especificaciones
                    </label>
                    <input
                      type="text"
                      value={item.notas || ""}
                      onChange={(e) => actualizarItem(index, "notas", e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                      placeholder="Preferiblemente con SSD"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Archivos Adjuntos */}
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            Archivos Adjuntos
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Opcional — los archivos se enviarán directamente al chat de la cotización al crearla.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer
              ${isDragging
                ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
              }`}
            onClick={() => document.getElementById("file-input-new")?.click()}
          >
            <input
              id="file-input-new"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) { agregarArchivos(e.target.files); e.target.value = ""; } }}
            />
            <svg className={`mb-2 h-10 w-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar"}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              PDF, imágenes, Excel, Word — cualquier tipo de archivo
            </p>
          </div>

          {/* Lista de archivos seleccionados */}
          {archivos.length > 0 && (
            <div className="mt-4 space-y-2">
              {archivos.map((adjunto) => (
                <div
                  key={adjunto.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors
                    ${adjunto.estado === "ok" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                      : adjunto.estado === "error" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        : adjunto.estado === "subiendo" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700"}`}
                >
                  <span className="text-lg">{getFileIcon(adjunto.file)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {adjunto.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(adjunto.file.size)}
                    </p>
                  </div>
                  {/* Estado */}
                  {adjunto.estado === "subiendo" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  )}
                  {adjunto.estado === "ok" && (
                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {adjunto.estado === "error" && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Error</span>
                  )}
                  {adjunto.estado === "pendiente" && (
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(adjunto.id)}
                      className="ml-1 rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <p className="text-right text-xs text-gray-400 dark:text-gray-500">
                {archivos.length} archivo{archivos.length !== 1 ? "s" : ""} seleccionado{archivos.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => navigate("/quotes")}
            variant="secondary"
            disabled={loading}
          >
            Cancelar
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Creando...
              </>
            ) : (
              "Crear Cotización"
            )}
          </button>
        </div>
      </form>

      {/* Modal Crear Proyecto Rápido */}
      {showNuevoProyecto && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Proyecto</h3>
              <button onClick={() => setShowNuevoProyecto(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={nuevoProyectoNombre}
                  onChange={(e) => setNuevoProyectoNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Nombre del proyecto" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área *</label>
                <select value={nuevoProyectoAreaId}
                  onChange={(e) => setNuevoProyectoAreaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  <option value="">Seleccione un área</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombreArea}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
              <button onClick={() => setShowNuevoProyecto(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
              <button
                disabled={creandoProyecto || !nuevoProyectoNombre.trim() || !nuevoProyectoAreaId}
                onClick={async () => {
                  setCreandoProyecto(true);
                  try {
                    const nuevo = await api.crearProyecto({ nombre: nuevoProyectoNombre.trim(), areaId: nuevoProyectoAreaId });
                    // Recargar proyectos para tener el area incluida
                    const proyectosActualizados = await api.getProyectos();
                    setProyectos((proyectosActualizados || []).filter((p: any) => p.estado));
                    setProyectoId(nuevo.id);
                    setShowNuevoProyecto(false);
                    addNotification("success", "Proyecto creado", `"${nuevo.nombre}" creado exitosamente`);
                  } catch (e: any) {
                    addNotification("danger", "Error", e.message);
                  } finally { setCreandoProyecto(false); }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {creandoProyecto ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}