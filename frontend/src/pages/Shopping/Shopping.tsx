import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";

// ============================================================================
// TYPES
// ============================================================================

type EstadoProducto = {
  id: string;
  sku: string;
  descripcion: string;
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
  criticidad: number;
  nivelCriticidad: string;
  diasRetrasoActual: number;
  estadoGeneral: string;
  progreso?: number;
  estadoActual?: string;
  tipoCompra?: 'NACIONAL' | 'INTERNACIONAL';
  proyecto?: {
    id: string;
    nombre: string;
  };
  cotizacion?: {
    id: string;
    nombreCotizacion: string;
    tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
    solicitante?: {
      id: string;
      nombre: string;
      email: string;
      departamento?: {
        id: string;
        nombre: string;
      };
    };
  };
  paisOrigen?: {
    nombre: string;
  };
  medioTransporte?: string;
  proveedor?: string;
  cantidad?: number;
  precioTotal?: number;
  precioUnitario?: number;
};

type Stats = {
  total: number;
  enProceso: number;
  completados: number;
  porTipoCompra: {
    nacional: number;
    internacional: number;
  };
  porEstado: {
    cotizado: number;
    conDescuento: number;
    comprado: number;
    pagado: number;
    primerSeguimiento: number;
    enFOB: number;
    conBL: number;
    segundoSeguimiento: number;
    enCIF: number;
    recibido: number;
  };
  criticos: number;
  enTiempo: number;
  conRetraso: number;
  valorTotal: number;
};

// ============================================================================
// CONSTANTS
// ============================================================================

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

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = {
  getToken: () => getToken(),

  async getEstadosProductos(filters?: {
    proyectoId?: string;
    nivelCriticidad?: string;
    tipoCompra?: string;
    page?: number;
    pageSize?: number;
  }) {
    const token = this.getToken();
    const params = new URLSearchParams();
    if (filters?.proyectoId) params.append("proyectoId", filters.proyectoId);
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

  async getProductosCriticos() {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos/criticos`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar productos críticos");
    return response.json();
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getEstadoActual = (producto: EstadoProducto): string => {
  if (producto.estadoActual) return producto.estadoActual;
  
  const estados = [
    { key: "recibido", label: "recibido" },
    { key: "enCIF", label: "enCIF" },
    { key: "segundoSeguimiento", label: "segundoSeguimiento" },
    { key: "conBL", label: "conBL" },
    { key: "enFOB", label: "enFOB" },
    { key: "primerSeguimiento", label: "primerSeguimiento" },
    { key: "pagado", label: "pagado" },
    { key: "comprado", label: "comprado" },
    { key: "conDescuento", label: "conDescuento" },
    { key: "cotizado", label: "cotizado" },
  ];

  for (const estado of estados) {
    if (producto[estado.key as keyof EstadoProducto]) {
      return estado.label;
    }
  }
  return "cotizado";
};

const calcularProgreso = (producto: EstadoProducto): number => {
  if (producto.progreso !== undefined) return producto.progreso;
  
  const tipoCompra = producto.cotizacion?.tipoCompra || producto.tipoCompra || 'INTERNACIONAL';
  
  if (tipoCompra === 'NACIONAL') {
    const estados = [
      producto.cotizado,
      producto.conDescuento,
      producto.comprado,
      producto.pagado,
      producto.recibido,
    ];
    const completados = estados.filter(Boolean).length;
    return Math.round((completados / 5) * 100);
  } else {
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
  }
};

const getTipoCompra = (producto: EstadoProducto): 'NACIONAL' | 'INTERNACIONAL' => {
  return producto.cotizacion?.tipoCompra || producto.tipoCompra || 'INTERNACIONAL';
};

const getCriticidadColor = (nivel: string) => {
  const colores: Record<string, string> = {
    BAJO: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    MEDIO: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    ALTO: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  };
  return colores[nivel] || "text-gray-600 bg-gray-50";
};

const getCriticidadBadge = (nivel: string) => {
  const badges: Record<string, string> = {
    BAJO: "🟢 Bajo",
    MEDIO: "🟡 Medio",
    ALTO: "🔴 Alto",
  };
  return badges[nivel] || nivel;
};

const calcularStats = (productos: EstadoProducto[]): Stats => {
  const stats: Stats = {
    total: productos.length,
    enProceso: 0,
    completados: 0,
    porTipoCompra: {
      nacional: 0,
      internacional: 0,
    },
    porEstado: {
      cotizado: 0,
      conDescuento: 0,
      comprado: 0,
      pagado: 0,
      primerSeguimiento: 0,
      enFOB: 0,
      conBL: 0,
      segundoSeguimiento: 0,
      enCIF: 0,
      recibido: 0,
    },
    criticos: 0,
    enTiempo: 0,
    conRetraso: 0,
    valorTotal: 0,
  };

  productos.forEach((p) => {
    const progreso = calcularProgreso(p);
    const tipoCompra = getTipoCompra(p);
    const estadoActual = getEstadoActual(p);

    // Contar completados vs en proceso
    if (progreso === 100) {
      stats.completados++;
    } else {
      stats.enProceso++;
    }

    // Contar por tipo de compra
    if (tipoCompra === 'NACIONAL') {
      stats.porTipoCompra.nacional++;
    } else {
      stats.porTipoCompra.internacional++;
    }

    // Contar por estado actual
    if (estadoActual in stats.porEstado) {
      stats.porEstado[estadoActual as keyof typeof stats.porEstado]++;
    }

    // Contar críticos y retrasos
    if (p.nivelCriticidad === "ALTO") stats.criticos++;
    if (p.diasRetrasoActual > 0) stats.conRetraso++;
    else stats.enTiempo++;

    // Sumar valor total
    if (p.precioTotal) {
      stats.valorTotal += Number(p.precioTotal);
    }
  });

  return stats;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(value);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Shopping() {
  const { addNotification } = useNotifications();

  const [productos, setProductos] = useState<EstadoProducto[]>([]);
  const [productosCriticos, setProductosCriticos] = useState<EstadoProducto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [filtroTipoCompra, setFiltroTipoCompra] = useState<string>("");
  const [verCompletados, setVerCompletados] = useState<boolean>(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    cargarDatos();
  }, [filtroNivel, filtroTipoCompra]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const filters: any = { pageSize: 50 };
      if (filtroNivel) filters.nivelCriticidad = filtroNivel;
      if (filtroTipoCompra) filters.tipoCompra = filtroTipoCompra;

      const [dataProductos, dataCriticos] = await Promise.all([
        api.getEstadosProductos(filters),
        api.getProductosCriticos(),
      ]);
      setProductos(dataProductos.items || []);
      setProductosCriticos(dataCriticos.slice(0, 5) || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      addNotification("danger", "Error", "Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const stats = calcularStats(productos);

  // Filtrar productos por estado de completado
  const productosFiltrados = productos.filter(p => {
    const progreso = calcularProgreso(p);
    if (verCompletados) {
      return progreso === 100;
    }
    return progreso < 100;
  });

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
      <PageMeta description="Dashboard de compras y seguimiento" title="Shopping Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Dashboard de Compras
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Seguimiento de productos en proceso logístico
              </p>
            </div>
            {/* Toggle Pendientes/Completados */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setVerCompletados(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !verCompletados
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                📋 En Proceso ({stats.enProceso})
              </button>
              <button
                onClick={() => setVerCompletados(true)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  verCompletados
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                ✅ Completados ({stats.completados})
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {/* Total Productos */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Nacional */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Nacional</p>
                <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                  {stats.porTipoCompra.nacional}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <span className="text-lg">🇭🇳</span>
              </div>
            </div>
          </div>

          {/* Internacional */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Internacional</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {stats.porTipoCompra.internacional}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <span className="text-lg">🌍</span>
              </div>
            </div>
          </div>

          {/* Críticos */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Críticos</p>
                <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                  {stats.criticos}
                </p>
              </div>
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* En Tiempo */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">En Tiempo</p>
                <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                  {stats.enTiempo}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white truncate" title={formatCurrency(stats.valorTotal)}>
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Críticos */}
        {productosCriticos.length > 0 && !verCompletados && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Productos Críticos ({productosCriticos.length})
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {productosCriticos.map((producto) => (
                <Link
                  key={producto.id}
                  to={`/shopping/follow-ups?producto=${producto.id}`}
                  className="rounded-lg border border-red-200 bg-white p-4 transition-all hover:border-red-400 hover:shadow-md dark:border-red-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {producto.sku}
                      </span>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {producto.descripcion}
                      </p>
                    </div>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      ⏰ {producto.diasRetrasoActual}d
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span className={`rounded px-1 py-0.5 text-xs ${
                      getTipoCompra(producto) === 'NACIONAL'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {getTipoCompra(producto) === 'NACIONAL' ? '🇭🇳' : '🌍'}
                    </span>
                    <span>{ESTADOS_ICONOS[getEstadoActual(producto)]} {ESTADOS_LABELS[getEstadoActual(producto)]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filtroTipoCompra}
            onChange={(e) => setFiltroTipoCompra(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">Todos los tipos</option>
            <option value="NACIONAL">🇭🇳 Nacional (5 etapas)</option>
            <option value="INTERNACIONAL">🌍 Internacional (10 etapas)</option>
          </select>

          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">Todas las criticidades</option>
            <option value="BAJO">🟢 Bajo</option>
            <option value="MEDIO">🟡 Medio</option>
            <option value="ALTO">🔴 Alto</option>
          </select>
        </div>

        {/* Lista de Productos */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {verCompletados ? "✅ Productos Completados" : "📋 Productos en Proceso"} ({productosFiltrados.length})
            </h3>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {verCompletados ? "No hay productos completados" : "No hay productos en proceso"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {productosFiltrados.slice(0, 10).map((producto) => {
                const tipoCompra = getTipoCompra(producto);
                const progreso = calcularProgreso(producto);
                const estadoActual = getEstadoActual(producto);

                return (
                  <div
                    key={producto.id}
                    className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                      progreso === 100
                        ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
                        : "border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {producto.sku}
                          </span>
                          {/* Badge completado */}
                          {progreso === 100 && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              ✅ Completado
                            </span>
                          )}
                          {/* Badge tipo compra */}
                          <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                            tipoCompra === 'NACIONAL'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {tipoCompra === 'NACIONAL' ? '🇭🇳 Nacional' : '🌍 Internacional'}
                          </span>
                          {/* Badge criticidad */}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCriticidadColor(producto.nivelCriticidad)}`}>
                            {getCriticidadBadge(producto.nivelCriticidad)}
                          </span>
                          {/* Badge estado */}
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {ESTADOS_ICONOS[estadoActual]} {ESTADOS_LABELS[estadoActual]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {producto.descripcion}
                        </p>
                        
                        {/* Info adicional */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {producto.proveedor && (
                            <span className="flex items-center gap-1">
                              <span>🏢</span> {producto.proveedor}
                            </span>
                          )}
                          {producto.proyecto && (
                            <span className="flex items-center gap-1">
                              <span>📋</span> {producto.proyecto.nombre}
                            </span>
                          )}
                          {producto.cotizacion?.solicitante && (
                            <span className="flex items-center gap-1">
                              <span>👤</span> {producto.cotizacion.solicitante.nombre}
                              {producto.cotizacion.solicitante.departamento && (
                                <span className="text-gray-400">
                                  ({producto.cotizacion.solicitante.departamento.nombre})
                                </span>
                              )}
                            </span>
                          )}
                          {producto.paisOrigen && (
                            <span className="flex items-center gap-1">
                              <span>🌍</span> {producto.paisOrigen.nombre}
                            </span>
                          )}
                          {producto.medioTransporte && (
                            <span className="flex items-center gap-1">
                              {producto.medioTransporte === "MARITIMO" && "🚢"}
                              {producto.medioTransporte === "AEREO" && "✈️"}
                              {producto.medioTransporte === "TERRESTRE" && "🚛"}
                              <span>{producto.medioTransporte}</span>
                            </span>
                          )}
                          {producto.precioTotal && (
                            <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                              <span>💰</span> {formatCurrency(Number(producto.precioTotal))}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/shopping/follow-ups?producto=${producto.id}`}
                        className="ml-4 shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Ver Detalle
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Progreso ({tipoCompra === 'NACIONAL' ? '5' : '10'} etapas)</span>
                        <span className={progreso === 100 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                          {progreso}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progreso === 100
                              ? "bg-green-600"
                              : producto.nivelCriticidad === "ALTO"
                              ? "bg-red-600"
                              : producto.nivelCriticidad === "MEDIO"
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {productosFiltrados.length > 10 && (
            <div className="mt-6 text-center">
              <Link
                to="/shopping/follow-ups"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Ver Todos los Productos
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/shopping/follow-ups"
            className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Seguimiento Detallado
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tracking completo por producto
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/shopping/history"
            className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Historial
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ver cambios y eventos
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/shopping/assignment"
            className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Configuración
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Timeline y ajustes
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}