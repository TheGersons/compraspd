import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";

// ============================================================================
// TYPES
// ============================================================================

type TimelineItem = {
  estado: string;
  completado: boolean;
  fecha?: Date | string | null;
  fechaLimite?: Date | string | null;
  diasRetraso: number;
  enTiempo: boolean;
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
  
  // Timeline calculado
  estadoActual?: string;
  progreso?: number;
  timeline?: TimelineItem[];
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();

const api = {
  async getEstadosProductos(filters?: {
    proyectoId?: string;
    cotizacionId?: string;
    sku?: string;
    nivelCriticidad?: string;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.proyectoId) params.append("proyectoId", filters.proyectoId);
    if (filters?.cotizacionId) params.append("cotizacionId", filters.cotizacionId);
    if (filters?.sku) params.append("sku", filters.sku);
    if (filters?.nivelCriticidad) params.append("nivelCriticidad", filters.nivelCriticidad);
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

  async avanzarEstado(id: string, observacion?: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/avanzar`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ observacion }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al avanzar estado");
    }
    return response.json();
  },

  async cambiarEstado(id: string, estado: string, observacion?: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/estado`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado, observacion }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al cambiar estado");
    }
    return response.json();
  },

  async actualizarFechas(id: string, fechas: any) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/fechas`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fechas),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar fechas");
    return response.json();
  },

  async actualizarFechasLimite(id: string, fechasLimite: any) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/fechas-limite`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fechasLimite),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar fechas límite");
    return response.json();
  },

  async aprobarProducto(id: string, aprobado: boolean, observaciones?: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/${id}/aprobar`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aprobado, observaciones }),
      }
    );
    if (!response.ok) throw new Error("Error al aprobar producto");
    return response.json();
  },
};

// ============================================================================
// HELPER FUNCTIONS
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

const getEstadoActual = (producto: EstadoProducto): string => {
  const estados = [
    "recibido",
    "enCIF",
    "segundoSeguimiento",
    "conBL",
    "enFOB",
    "primerSeguimiento",
    "pagado",
    "comprado",
    "conDescuento",
    "cotizado",
  ];

  for (const estado of estados) {
    if (producto[estado as keyof EstadoProducto]) {
      return estado;
    }
  }
  return "cotizado";
};

const calcularProgreso = (producto: EstadoProducto): number => {
  const estados = [
    producto.cotizado,
    producto.conDescuento,
    producto.comprado,
    producto.pagado,
    producto.primerSeguimiento,
    producto.enFOB,
    producto.conBL,
    producto.segundoSeguimiento,
    producto.enCIF,
    producto.recibido,
  ];
  const completados = estados.filter(Boolean).length;
  return Math.round((completados / 10) * 100);
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

const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calcularDiasRetraso = (
  fechaReal: string | null | undefined,
  fechaLimite: string | null | undefined
): number => {
  if (!fechaLimite) return 0;
  const fechaComparar = fechaReal ? new Date(fechaReal) : new Date();
  const limite = new Date(fechaLimite);
  const diff = fechaComparar.getTime() - limite.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ShoppingFollowUps() {
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // UI States
  const [showEditFechas, setShowEditFechas] = useState(false);
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [observacion, setObservacion] = useState("");

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    cargarProductos();
  }, [filtroNivel]);

  useEffect(() => {
    const productoId = searchParams.get("producto");
    if (productoId && productos.length > 0) {
      const producto = productos.find((p) => p.id === productoId);
      if (producto) {
        seleccionarProducto(producto);
      }
    }
  }, [searchParams, productos]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await api.getEstadosProductos({
        nivelCriticidad: filtroNivel || undefined,
        pageSize: 100,
      });
      setProductos(data.items || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      addNotification("danger", "Error", "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarProducto = async (producto: EstadoProducto) => {
    try {
      setLoadingDetalle(true);
      setProductoSeleccionado(producto);
      setSearchParams({ producto: producto.id });
      
      const [detalle, timelineData] = await Promise.all([
        api.getEstadoProductoById(producto.id),
        api.getTimeline(producto.id),
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

    try {
      setLoadingAccion(true);
      await api.avanzarEstado(productoSeleccionado.id, observacion);
      addNotification("success", "Éxito", "Estado avanzado correctamente");
      setObservacion("");
      await seleccionarProducto(productoSeleccionado);
      await cargarProductos();
    } catch (error: any) {
      console.error("Error al avanzar estado:", error);
      addNotification("danger", "Error", error.message || "Error al avanzar estado");
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!productoSeleccionado || !estadoSeleccionado) return;

    try {
      setLoadingAccion(true);
      await api.cambiarEstado(productoSeleccionado.id, estadoSeleccionado, observacion);
      addNotification("success", "Éxito", "Estado cambiado correctamente");
      setShowCambiarEstado(false);
      setEstadoSeleccionado("");
      setObservacion("");
      await seleccionarProducto(productoSeleccionado);
      await cargarProductos();
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      addNotification("danger", "Error", error.message || "Error al cambiar estado");
    } finally {
      setLoadingAccion(false);
    }
  };

  const filteredProductos = productos.filter((p) =>
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.proyecto?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta description="Seguimiento detallado de productos" title="Shopping Follow-Ups" />

      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Seguimiento de Productos
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tracking detallado de las 10 etapas del proceso logístico
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Panel Izquierdo - Lista de Productos */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              {/* Filtros */}
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Buscar por SKU, descripción o proyecto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />

                <select
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Todas las criticidades</option>
                  <option value="BAJO">🟢 Bajo</option>
                  <option value="MEDIO">🟡 Medio</option>
                  <option value="ALTO">🔴 Alto</option>
                </select>
              </div>

              {/* Lista de Productos */}
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredProductos.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No hay productos
                    </p>
                  </div>
                ) : (
                  filteredProductos.map((producto) => {
                    const estadoActual = getEstadoActual(producto);
                    const progreso = calcularProgreso(producto);
                    const isSelected = productoSeleccionado?.id === producto.id;

                    return (
                      <button
                        key={producto.id}
                        onClick={() => seleccionarProducto(producto)}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                            : "border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white truncate">
                                {producto.sku}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCriticidadColor(producto.nivelCriticidad)}`}>
                                {getCriticidadBadge(producto.nivelCriticidad)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {producto.descripcion}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {ESTADOS_ICONOS[estadoActual]} {ESTADOS_LABELS[estadoActual]}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                producto.nivelCriticidad === "ALTO"
                                  ? "bg-red-600"
                                  : producto.nivelCriticidad === "MEDIO"
                                  ? "bg-yellow-500"
                                  : "bg-green-600"
                              }`}
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Detalle del Producto */}
          <div className="lg:col-span-2">
            {!productoSeleccionado ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Selecciona un producto para ver el detalle
                </p>
              </div>
            ) : loadingDetalle ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Información General */}
                <div className={`rounded-xl border p-6 ${getCriticidadBg(productoSeleccionado.nivelCriticidad)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {productoSeleccionado.sku}
                        </h3>
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getCriticidadColor(productoSeleccionado.nivelCriticidad)}`}>
                          {getCriticidadBadge(productoSeleccionado.nivelCriticidad)}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {productoSeleccionado.descripcion}
                      </p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {productoSeleccionado.proyecto && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Proyecto:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {productoSeleccionado.proyecto.nombre}
                            </p>
                          </div>
                        )}
                        {productoSeleccionado.proveedor && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Proveedor:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {productoSeleccionado.proveedor}
                            </p>
                          </div>
                        )}
                        {productoSeleccionado.cantidad && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {productoSeleccionado.cantidad} unidades
                            </p>
                          </div>
                        )}
                        {productoSeleccionado.precioTotal && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Precio Total:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${Number(productoSeleccionado.precioTotal).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {productoSeleccionado.paisOrigen && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">País Origen:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              🌍 {productoSeleccionado.paisOrigen.nombre}
                            </p>
                          </div>
                        )}
                        {productoSeleccionado.medioTransporte && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Transporte:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {productoSeleccionado.medioTransporte === "MARITIMO" && "🚢 Marítimo"}
                              {productoSeleccionado.medioTransporte === "AEREO" && "✈️ Aéreo"}
                              {productoSeleccionado.medioTransporte === "TERRESTRE" && "🚛 Terrestre"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progreso General */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Progreso General
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {calcularProgreso(productoSeleccionado)}%
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/50 dark:bg-gray-800/50">
                      <div
                        className={`h-full rounded-full transition-all ${
                          productoSeleccionado.nivelCriticidad === "ALTO"
                            ? "bg-red-600"
                            : productoSeleccionado.nivelCriticidad === "MEDIO"
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${calcularProgreso(productoSeleccionado)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAvanzarEstado}
                    disabled={loadingAccion || productoSeleccionado.recibido}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAccion ? "Procesando..." : "⏩ Avanzar al Siguiente Estado"}
                  </button>
                  <button
                    onClick={() => setShowCambiarEstado(true)}
                    disabled={loadingAccion}
                    className="rounded-lg border border-blue-600 px-4 py-3 font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    Cambiar Estado
                  </button>
                </div>

                {/* Timeline de 10 Etapas */}
                {timeline && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h4 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                      Timeline del Proceso (10 Etapas)
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
                                    {ESTADOS_LABELS[item.estado] || item.estado}
                                  </h5>
                                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    {item.fecha && (
                                      <span>✅ {formatDate(item.fecha)}</span>
                                    )}
                                    {item.fechaLimite && (
                                      <span>🎯 Límite: {formatDate(item.fechaLimite)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                {isCompletado ? (
                                  isRetrasado ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                                      ⏰ {diasRetraso} días de retraso
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

                    {/* Resumen del Timeline */}
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

                {/* Observaciones */}
                {productoSeleccionado.observaciones && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <h5 className="font-medium text-gray-900 dark:text-white">Observaciones</h5>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {productoSeleccionado.observaciones}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Cambiar Estado */}
        {showCambiarEstado && productoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cambiar Estado del Producto
              </h3>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccionar Estado
                  </label>
                  <select
                    value={estadoSeleccionado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">Selecciona un estado...</option>
                    <option value="cotizado">📋 Cotizado</option>
                    <option value="conDescuento">💰 Con Descuento</option>
                    <option value="comprado">🛒 Comprado</option>
                    <option value="pagado">💳 Pagado</option>
                    <option value="primerSeguimiento">📞 1er Seguimiento</option>
                    <option value="enFOB">🚢 En FOB</option>
                    <option value="conBL">📄 Con BL</option>
                    <option value="segundoSeguimiento">📞 2do Seguimiento</option>
                    <option value="enCIF">🌊 En CIF</option>
                    <option value="recibido">📦 Recibido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Observación (opcional)
                  </label>
                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    placeholder="Agrega una observación sobre este cambio..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowCambiarEstado(false);
                    setEstadoSeleccionado("");
                    setObservacion("");
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarEstado}
                  disabled={!estadoSeleccionado || loadingAccion}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingAccion ? "Guardando..." : "Guardar Cambio"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}