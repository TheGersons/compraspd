import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";

// ============================================================================
// TYPES
// ============================================================================

type TimelineItem = {
  estado: string;
  label: string;
  completado: boolean;
  fecha?: Date | string | null;
  fechaLimite?: Date | string | null;
  diasRetraso: number;
  enTiempo: boolean;
  evidencia?: string;
  tieneEvidencia: boolean;
  esNoAplica: boolean;
};

type EstadoProducto = {
  id: string;
  sku: string;
  descripcion: string;
  cantidad?: number;
  precioUnitario?: number;
  precioTotal?: number;
  proveedor?: string;
  responsable?: string;
  observaciones?: string;
  
  // 10 estados booleanos
  cotizado: boolean;
  conDescuento: boolean;
  comprado: boolean;
  pagado: boolean;
  primerSeguimiento: boolean;
  enFOB: boolean;
  conBL: boolean;
  segundoSeguimiento: boolean;
  enCIF: boolean;
  recibido: boolean;
  
  // Fechas reales
  fechaCotizado?: string | null;
  fechaConDescuento?: string | null;
  fechaComprado?: string | null;
  fechaPagado?: string | null;
  fechaPrimerSeguimiento?: string | null;
  fechaEnFOB?: string | null;
  fechaConBL?: string | null;
  fechaSegundoSeguimiento?: string | null;
  fechaEnCIF?: string | null;
  fechaRecibido?: string | null;
  
  // Fechas límite
  fechaLimiteCotizado?: string | null;
  fechaLimiteConDescuento?: string | null;
  fechaLimiteComprado?: string | null;
  fechaLimitePagado?: string | null;
  fechaLimitePrimerSeguimiento?: string | null;
  fechaLimiteEnFOB?: string | null;
  fechaLimiteConBL?: string | null;
  fechaLimiteSegundoSeguimiento?: string | null;
  fechaLimiteEnCIF?: string | null;
  fechaLimiteRecibido?: string | null;
  
  // Criticidad y retrasos
  criticidad: number;
  nivelCriticidad: string;
  diasRetrasoActual: number;
  estadoGeneral: string;
  
  // Relaciones
  proyecto?: {
    id: string;
    nombre: string;
    criticidad: number;
  };
  cotizacion?: {
    id: string;
    nombreCotizacion: string;
    tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  };
  paisOrigen?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  medioTransporte?: string;
  
  // Aprobación
  aprobadoPorSupervisor: boolean;
  fechaAprobacion?: string | null;
  
  // Tipo de compra y estados aplicables
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  estadosAplicables?: string[];
  siguienteEstado?: string | null;
  
  // Timeline calculado
  estadoActual?: string;
  progreso?: number;
  timeline?: TimelineItem[];
};

// ============================================================================
// CONSTANTS
// ============================================================================

const ESTADOS_LABELS: Record<string, string> = {
  cotizado: "Cotizado",
  conDescuento: "Con Descuento",
  comprado: "Comprado",
  pagado: "Pagado",
  primerSeguimiento: "1er Seguimiento",
  enFOB: "En FOB",
  conBL: "Con BL",
  segundoSeguimiento: "2do Seguimiento",
  enCIF: "En CIF",
  recibido: "Recibido",
};

const ESTADOS_ICONOS: Record<string, string> = {
  cotizado: "📋",
  conDescuento: "💰",
  comprado: "🛒",
  pagado: "💳",
  primerSeguimiento: "📞",
  enFOB: "🚢",
  conBL: "📄",
  segundoSeguimiento: "📞",
  enCIF: "🌊",
  recibido: "📦",
};

const ESTADOS_NACIONAL = ['cotizado', 'conDescuento', 'comprado', 'pagado', 'recibido'];
const ESTADOS_INTERNACIONAL = ['cotizado', 'conDescuento', 'comprado', 'pagado', 'primerSeguimiento', 'enFOB', 'conBL', 'segundoSeguimiento', 'enCIF', 'recibido'];

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = {
  getToken: () => getToken(),

  async getEstadosProductos(filters?: {
    proyectoId?: string;
    cotizacionId?: string;
    sku?: string;
    nivelCriticidad?: string;
    tipoCompra?: string;
    page?: number;
    pageSize?: number;
  }) {
    const token = this.getToken();
    const params = new URLSearchParams();
    if (filters?.proyectoId) params.append("proyectoId", filters.proyectoId);
    if (filters?.cotizacionId) params.append("cotizacionId", filters.cotizacionId);
    if (filters?.sku) params.append("sku", filters.sku);
    if (filters?.nivelCriticidad) params.append("nivelCriticidad", filters.nivelCriticidad);
    if (filters?.tipoCompra) params.append("tipoCompra", filters.tipoCompra);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos?${params}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar productos");
    return response.json();
  },

  async getEstadoProductoById(id: string) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar detalle");
    return response.json();
  },

  async getTimeline(id: string) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/timeline`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar timeline");
    return response.json();
  },

  async avanzarEstado(id: string, data: { observacion?: string; evidenciaUrl?: string; noAplicaEvidencia?: boolean }) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/avanzar`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al avanzar estado");
    }
    return response.json();
  },

  async uploadEvidencia(file: File, cotizacionId: string, sku: string, proveedor: string, estado: string) {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cotizacionId', cotizacionId);
    formData.append('sku', sku);
    formData.append('proveedorNombre', proveedor || 'sin-proveedor');
    formData.append('tipo', `evidencia_${estado}`);

    const response = await fetch(`${API_BASE_URL}/api/v1/storage/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    return response.json();
  },

  async generateNoAplica() {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/storage/no-aplica`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error al generar comprobante');
    return response.json();
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getEstadosAplicables = (tipoCompra?: string): string[] => {
  return tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
};

const getCriticidadColor = (nivel: string) => {
  const colores: Record<string, string> = {
    BAJO: "text-green-600 dark:text-green-400",
    MEDIO: "text-yellow-600 dark:text-yellow-400",
    ALTO: "text-red-600 dark:text-red-400",
  };
  return colores[nivel] || "text-gray-600";
};

const getCriticidadBadge = (nivel: string) => {
  const badges: Record<string, string> = {
    BAJO: "🟢 Bajo",
    MEDIO: "🟡 Medio",
    ALTO: "🔴 Alto",
  };
  return badges[nivel] || nivel;
};

const getCriticidadBg = (nivel: string) => {
  const bgs: Record<string, string> = {
    BAJO: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
    MEDIO: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800",
    ALTO: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800",
  };
  return bgs[nivel] || "bg-gray-50 border-gray-200";
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ShoppingFollowUps() {
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();

  // Estados principales
  const [productos, setProductos] = useState<EstadoProducto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<EstadoProducto | null>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [filtroTipoCompra, setFiltroTipoCompra] = useState<string>("");
  const [verCompletados, setVerCompletados] = useState<boolean>(false);

  // UI States
  const [showAvanzarModal, setShowAvanzarModal] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [noAplicaEvidencia, setNoAplicaEvidencia] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efectos
  useEffect(() => {
    cargarProductos();
  }, [filtroNivel, filtroTipoCompra]);

  useEffect(() => {
    const productoId = searchParams.get("producto");
    if (productoId) {
      seleccionarProducto(productoId);
    }
  }, [searchParams]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const filters: any = { pageSize: 50 };
      if (filtroNivel) filters.nivelCriticidad = filtroNivel;
      if (filtroTipoCompra) filters.tipoCompra = filtroTipoCompra;
      
      const data = await api.getEstadosProductos(filters);
      setProductos(data.items || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      addNotification("danger", "Error", "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarProducto = async (id: string) => {
    try {
      setLoadingDetalle(true);
      const [detalle, timelineData] = await Promise.all([
        api.getEstadoProductoById(id),
        api.getTimeline(id)
      ]);
      setProductoSeleccionado(detalle);
      setTimeline(timelineData);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      addNotification("danger", "Error", "Error al cargar detalle del producto");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleAvanzarEstado = async () => {
    if (!productoSeleccionado) return;

    // Validar que tenga evidencia o "No aplica"
    if (!archivoEvidencia && !noAplicaEvidencia) {
      addNotification("warn", "Advertencia", "Debe subir un archivo de evidencia o marcar 'No aplica'");
      return;
    }

    try {
      setLoadingAccion(true);
      let evidenciaUrl: string | undefined;

      // Subir archivo si existe
      if (archivoEvidencia && productoSeleccionado.cotizacion) {
        const uploadResult = await api.uploadEvidencia(
          archivoEvidencia,
          productoSeleccionado.cotizacion.id,
          productoSeleccionado.sku,
          productoSeleccionado.proveedor || 'sin-proveedor',
          productoSeleccionado.siguienteEstado || 'estado'
        );
        evidenciaUrl = uploadResult.url || uploadResult.fileName;
      }

      // Avanzar estado
      await api.avanzarEstado(productoSeleccionado.id, {
        observacion: observacion || undefined,
        evidenciaUrl,
        noAplicaEvidencia: noAplicaEvidencia && !archivoEvidencia
      });

      addNotification("success", "Éxito", "Estado avanzado correctamente");
      
      // Limpiar y recargar
      setShowAvanzarModal(false);
      setObservacion("");
      setArchivoEvidencia(null);
      setNoAplicaEvidencia(false);
      
      await seleccionarProducto(productoSeleccionado.id);
      await cargarProductos();
    } catch (error: any) {
      console.error("Error al avanzar estado:", error);
      addNotification("danger", "Error", error.message || "Error al avanzar estado");
    } finally {
      setLoadingAccion(false);
    }
  };

  const abrirModalAvanzar = () => {
    setObservacion("");
    setArchivoEvidencia(null);
    setNoAplicaEvidencia(false);
    setShowAvanzarModal(true);
  };

  // Filtrar productos por búsqueda y estado de completado
  const productosFiltrados = productos.filter(p => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchQuery = (
        p.sku.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        p.proveedor?.toLowerCase().includes(query)
      );
      if (!matchQuery) return false;
    }
    
    // Filtro por estado de completado (100% = completado)
    const estaCompletado = p.progreso === 100;
    if (verCompletados) {
      return estaCompletado; // Solo mostrar completados
    } else {
      return !estaCompletado; // Solo mostrar pendientes
    }
  });

  // Contadores para los badges
  const totalPendientes = productos.filter(p => p.progreso !== 100).length;
  const totalCompletados = productos.filter(p => p.progreso === 100).length;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <PageMeta title="Seguimiento de Compras" description="Tracking de productos en proceso" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Seguimiento de Compras
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tracking detallado de productos aprobados
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Toggle Pendientes / Completados */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setVerCompletados(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                !verCompletados
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              📋 En Proceso ({totalPendientes})
            </button>
            <button
              onClick={() => setVerCompletados(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                verCompletados
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              ✅ Completados ({totalCompletados})
            </button>
          </div>

          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por SKU, descripción o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Filtro Tipo Compra */}
          <select
            value={filtroTipoCompra}
            onChange={(e) => setFiltroTipoCompra(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los tipos</option>
            <option value="NACIONAL">🇭🇳 Nacional (5 etapas)</option>
            <option value="INTERNACIONAL">🌍 Internacional (10 etapas)</option>
          </select>

          {/* Filtro Criticidad */}
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todas las criticidades</option>
            <option value="BAJO">🟢 Bajo</option>
            <option value="MEDIO">🟡 Medio</option>
            <option value="ALTO">🔴 Alto</option>
          </select>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lista de productos */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {verCompletados ? "✅ Completados" : "📋 En Proceso"} ({productosFiltrados.length})
                </h3>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    {verCompletados 
                      ? "No hay productos completados" 
                      : "No hay productos en proceso"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productosFiltrados.map((producto) => (
                      <button
                        key={producto.id}
                        onClick={() => seleccionarProducto(producto.id)}
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          productoSeleccionado?.id === producto.id
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                {producto.sku}
                              </span>
                              <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getCriticidadBg(producto.nivelCriticidad)}`}>
                                {getCriticidadBadge(producto.nivelCriticidad)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                              {producto.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {/* Badge completado */}
                              {producto.progreso === 100 && (
                                <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  ✅ Completado
                                </span>
                              )}
                              {/* Badge tipo compra */}
                              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                producto.tipoCompra === 'NACIONAL' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {producto.tipoCompra === 'NACIONAL' ? '🇭🇳 Nacional' : '🌍 Internacional'}
                              </span>
                              {/* Estado actual */}
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {ESTADOS_ICONOS[producto.estadoActual || 'cotizado']} {ESTADOS_LABELS[producto.estadoActual || 'cotizado']}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${
                              producto.progreso === 100 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {producto.progreso}%
                            </span>
                          </div>
                        </div>
                        {/* Barra de progreso */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full rounded-full transition-all ${
                              producto.progreso === 100
                                ? "bg-green-600"
                                : producto.nivelCriticidad === "ALTO"
                                ? "bg-red-600"
                                : producto.nivelCriticidad === "MEDIO"
                                ? "bg-yellow-500"
                                : "bg-green-600"
                            }`}
                            style={{ width: `${producto.progreso}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalle del producto */}
          <div className="lg:col-span-2">
            {loadingDetalle ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : productoSeleccionado ? (
              <div className="space-y-4">
                {/* Info del producto */}
                <div className={`rounded-xl border p-6 ${getCriticidadBg(productoSeleccionado.nivelCriticidad)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {productoSeleccionado.sku}
                        </h2>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCriticidadBg(productoSeleccionado.nivelCriticidad)}`}>
                          {getCriticidadBadge(productoSeleccionado.nivelCriticidad)}
                        </span>
                        <span className={`rounded px-2 py-1 text-xs font-medium ${
                          productoSeleccionado.tipoCompra === 'NACIONAL'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {productoSeleccionado.tipoCompra === 'NACIONAL' ? '🇭🇳 Nacional' : '🌍 Internacional'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {productoSeleccionado.descripcion}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {productoSeleccionado.proveedor && (
                          <span>🏢 {productoSeleccionado.proveedor}</span>
                        )}
                        {productoSeleccionado.cantidad && (
                          <span>📦 Cantidad: {productoSeleccionado.cantidad}</span>
                        )}
                        {productoSeleccionado.precioTotal && (
                          <span>💰 Total: L. {Number(productoSeleccionado.precioTotal).toFixed(2)}</span>
                        )}
                        {productoSeleccionado.paisOrigen && (
                          <span>🌍 {productoSeleccionado.paisOrigen.nombre}</span>
                        )}
                        {productoSeleccionado.medioTransporte && (
                          <span>
                            {productoSeleccionado.medioTransporte === "MARITIMO" && "🚢 Marítimo"}
                            {productoSeleccionado.medioTransporte === "AEREO" && "✈️ Aéreo"}
                            {productoSeleccionado.medioTransporte === "TERRESTRE" && "🚛 Terrestre"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {productoSeleccionado.progreso}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progreso</p>
                    </div>
                  </div>
                </div>

                {/* Botón Avanzar Estado */}
                {productoSeleccionado.siguienteEstado && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                          Siguiente paso: {ESTADOS_ICONOS[productoSeleccionado.siguienteEstado]} {ESTADOS_LABELS[productoSeleccionado.siguienteEstado]}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Se requiere evidencia o marcar "No aplica"
                        </p>
                      </div>
                      <button
                        onClick={abrirModalAvanzar}
                        disabled={loadingAccion}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Avanzar Estado
                      </button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {timeline && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h4 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                      Timeline del Proceso ({productoSeleccionado.tipoCompra === 'NACIONAL' ? '5' : '10'} Etapas)
                    </h4>

                    <div className="space-y-4">
                      {timeline.timeline?.map((item: TimelineItem, index: number) => {
                        const diasRetraso = item.diasRetraso || 0;
                        const isRetrasado = diasRetraso > 0;
                        const isCompletado = item.completado;

                        return (
                          <div
                            key={index}
                            className={`relative rounded-lg border p-4 ${
                              isCompletado
                                ? isRetrasado
                                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                                  : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                                    isCompletado
                                      ? isRetrasado
                                        ? "bg-red-200 dark:bg-red-800"
                                        : "bg-green-200 dark:bg-green-800"
                                      : "bg-gray-200 dark:bg-gray-700"
                                  }`}
                                >
                                  {ESTADOS_ICONOS[item.estado] || "📌"}
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {item.label || ESTADOS_LABELS[item.estado] || item.estado}
                                  </h5>
                                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    {item.fecha && (
                                      <span>✅ {formatDate(item.fecha)}</span>
                                    )}
                                    {item.fechaLimite && (
                                      <span>🎯 Límite: {formatDate(item.fechaLimite)}</span>
                                    )}
                                    {item.tieneEvidencia && (
                                      <span className={item.esNoAplica ? "text-gray-500" : "text-blue-600 dark:text-blue-400"}>
                                        {item.esNoAplica ? "➖ No aplica" : "📎 Con evidencia"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                {isCompletado ? (
                                  isRetrasado ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                                      ⏰ {diasRetraso} días retraso
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                                      ✅ En tiempo
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-300 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                    ⏳ Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen */}
                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Criticidad</p>
                          <p className={`mt-1 text-lg font-semibold ${getCriticidadColor(timeline.nivelCriticidad)}`}>
                            {timeline.criticidad}/10
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Progreso</p>
                          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {timeline.progreso}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Retraso Total</p>
                          <p className={`mt-1 text-lg font-semibold ${timeline.diasRetrasoTotal > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {timeline.diasRetrasoTotal} días
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Selecciona un producto para ver su detalle
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Avanzar Estado */}
        {showAvanzarModal && productoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Avanzar al siguiente estado
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {ESTADOS_ICONOS[productoSeleccionado.siguienteEstado || '']} {ESTADOS_LABELS[productoSeleccionado.siguienteEstado || '']}
              </p>

              <div className="mt-6 space-y-4">
                {/* Subir evidencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Evidencia (archivo)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setArchivoEvidencia(file);
                        setNoAplicaEvidencia(false);
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {archivoEvidencia && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      ✓ Archivo seleccionado: {archivoEvidencia.name}
                    </p>
                  )}
                </div>

                {/* O marcar No aplica */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">— o —</span>
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-gray-300 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={noAplicaEvidencia}
                    onChange={(e) => {
                      setNoAplicaEvidencia(e.target.checked);
                      if (e.target.checked) {
                        setArchivoEvidencia(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    No aplica evidencia para este estado
                  </span>
                </label>

                {/* Observación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Observación (opcional)
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Agrega una observación..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowAvanzarModal(false);
                    setObservacion("");
                    setArchivoEvidencia(null);
                    setNoAplicaEvidencia(false);
                  }}
                  disabled={loadingAccion}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAvanzarEstado}
                  disabled={loadingAccion || (!archivoEvidencia && !noAplicaEvidencia)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingAccion ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Procesando...
                    </span>
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}