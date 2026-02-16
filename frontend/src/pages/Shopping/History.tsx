import React, { useState, useEffect } from "react";
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
  cotizacionFleteInternacional: boolean;
  conBL: boolean;
  segundoSeguimiento: boolean;
  enCIF: boolean;
  recibido: boolean;
  fechaCotizado?: string;
  fechaConDescuento?: string;
  fechaComprado?: string;
  fechaPagado?: string;
  fechaPrimerSeguimiento?: string;
  fechaEnFOB?: string;
  fechaConBL?: string;
  fechaSegundoSeguimiento?: string;
  fechaEnCIF?: string;
  fechaRecibido?: string;
  proveedor?: string;
  precioTotal?: number;
  actualizado: string;
  proyecto?: {
    id: string;
    nombre: string;
  };
  cotizacion?: {
    id: string;
    nombreCotizacion: string;
  };
};

type EventoTimeline = {
  id: string;
  fecha: Date;
  hora: string;
  tipo: string;
  descripcion: string;
  sku: string;
  productoDescripcion: string;
  proyecto?: string;
  cotizacion?: string;
  proveedor?: string;
  monto?: number;
  producto: EstadoProducto;
};

type VistaType = "table" | "timeline";
type AgruparPor = "none" | "fecha" | "sku" | "estado" | "proyecto";

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();

const api = {
  async getEstadosProductos() {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/estado-productos?pageSize=100`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar productos");
    return response.json();
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
  }).format(value);
};

const getAccionColor = (tipo: string): string => {
  const colores: Record<string, string> = {
    cotizado: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    conDescuento: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    comprado: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    pagado: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    primerSeguimiento: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    enFOB: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
    cotizacionFleteInternacional: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",  // ← NUEVO
    conBL: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
    segundoSeguimiento: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    enCIF: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",  // ← CAMBIADO (aduana)
    recibido: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  };
  return colores[tipo] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
};

const getAccionIcon = (tipo: string): string => {
  const iconos: Record<string, string> = {
    cotizado: "📋",
    conDescuento: "💰",
    comprado: "🛒",
    pagado: "💳",
    primerSeguimiento: "📞",
    enFOB: "🚢",
    cotizacionFleteInternacional: "📊",
    conBL: "📄",
    segundoSeguimiento: "🚚",
    enCIF: "🛃",
    recibido: "📦",
  };
  return iconos[tipo] || "📝";
};

const getAccionLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    cotizado: "Cotizado",
    conDescuento: "Con Descuento",
    comprado: "Comprado",
    pagado: "Pagado",
    primerSeguimiento: "1er Seguimiento",
    enFOB: "En FOB / En CIF",
    cotizacionFleteInternacional: "Cotización Flete Int.",
    conBL: "Con BL / Póliza Seguros",
    segundoSeguimiento: "2do Seg. / En Tránsito",
    enCIF: "Proceso Aduana",
    recibido: "Recibido",
  };
  return labels[tipo] || tipo;
};

const extractEventos = (producto: EstadoProducto): EventoTimeline[] => {
  const eventos: EventoTimeline[] = [];
  const estados = [
    { key: 'cotizado', fecha: 'fechaCotizado' },
    { key: 'conDescuento', fecha: 'fechaConDescuento' },
    { key: 'comprado', fecha: 'fechaComprado' },
    { key: 'pagado', fecha: 'fechaPagado' },
    { key: 'primerSeguimiento', fecha: 'fechaPrimerSeguimiento' },
    { key: 'enFOB', fecha: 'fechaEnFOB' },
    { key: 'cotizacionFleteInternacional', fecha: 'fechaCotizacionFleteInternacional' },  // ← NUEVO
    { key: 'conBL', fecha: 'fechaConBL' },
    { key: 'segundoSeguimiento', fecha: 'fechaSegundoSeguimiento' },
    { key: 'enCIF', fecha: 'fechaEnCIF' },
    { key: 'recibido', fecha: 'fechaRecibido' },
  ];

  estados.forEach(({ key, fecha }) => {
    if (producto[key as keyof EstadoProducto] && producto[fecha as keyof EstadoProducto]) {
      const fechaEvento = new Date(producto[fecha as keyof EstadoProducto] as string);
      eventos.push({
        id: `${producto.id}-${key}`,
        fecha: fechaEvento,
        hora: formatTime(fechaEvento),
        tipo: key,
        descripcion: getAccionLabel(key),
        sku: producto.sku,
        productoDescripcion: producto.descripcion,
        proyecto: producto.proyecto?.nombre,
        cotizacion: producto.cotizacion?.nombreCotizacion,
        proveedor: producto.proveedor,
        monto: producto.precioTotal ? Number(producto.precioTotal) : undefined,
        producto,
      });
    }
  });

  return eventos;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function History() {
  const { addNotification } = useNotifications();

  // Estados principales
  const [productos, setProductos] = useState<EstadoProducto[]>([]);
  const [eventos, setEventos] = useState<EventoTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  // Vista
  const [vista, setVista] = useState<VistaType>("table");

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("");
  const [proyectoFiltro, setProyectoFiltro] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [showFiltros, setShowFiltros] = useState(false);

  // Agrupación y paginación
  const [agruparPor, setAgruparPor] = useState<AgruparPor>("none");
  const [sortBy, setSortBy] = useState<"fecha" | "sku" | "tipo">("fecha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10; // Cambiar de 50 a 10

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await api.getEstadosProductos();
      const productosData = data.items || [];
      setProductos(productosData);

      const todosEventos: EventoTimeline[] = [];
      productosData.forEach((producto: EstadoProducto) => {
        const eventosProducto = extractEventos(producto);
        todosEventos.push(...eventosProducto);
      });

      todosEventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
      setEventos(todosEventos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      addNotification("danger", "Error", "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setSearchQuery("");
    setTipoFiltro("");
    setProyectoFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(1);
  };

  const toggleSort = (column: "fecha" | "sku" | "tipo") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Aplicar filtros
  let filteredEventos = eventos.filter((evento) => {
    // Búsqueda general
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !evento.sku.toLowerCase().includes(query) &&
        !evento.productoDescripcion.toLowerCase().includes(query) &&
        !(evento.proyecto || "").toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Filtro por tipo
    if (tipoFiltro && evento.tipo !== tipoFiltro) return false;

    // Filtro por proyecto
    if (proyectoFiltro && evento.proyecto !== proyectoFiltro) return false;

    // Filtro por fecha desde
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      if (evento.fecha < desde) return false;
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      if (evento.fecha > hasta) return false;
    }

    return true;
  });

  // Aplicar ordenamiento
  filteredEventos.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "fecha") {
      comparison = a.fecha.getTime() - b.fecha.getTime();
    } else if (sortBy === "sku") {
      comparison = a.sku.localeCompare(b.sku);
    } else if (sortBy === "tipo") {
      comparison = a.tipo.localeCompare(b.tipo);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Agrupar si es necesario
  const eventosAgrupados: Record<string, EventoTimeline[]> = {};
  if (agruparPor === "none") {
    eventosAgrupados["all"] = filteredEventos;
  } else {
    filteredEventos.forEach((evento) => {
      let key = "";
      if (agruparPor === "fecha") key = formatDate(evento.fecha);
      else if (agruparPor === "sku") key = evento.sku;
      else if (agruparPor === "estado") key = evento.descripcion;
      else if (agruparPor === "proyecto") key = evento.proyecto || "Sin Proyecto";

      if (!eventosAgrupados[key]) eventosAgrupados[key] = [];
      eventosAgrupados[key].push(evento);
    });
  }

  // Paginación
  const totalEventos = filteredEventos.length;
  const totalPages = Math.ceil(totalEventos / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Obtener lista única de proyectos
  const proyectosUnicos = Array.from(new Set(eventos.map((e) => e.proyecto).filter(Boolean)));

  // Estadísticas
  const stats = {
    total: eventos.length,
    porTipo: eventos.reduce((acc, evento) => {
      acc[evento.tipo] = (acc[evento.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

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
      <PageMeta description="Historial de cambios de productos" title="Shopping History" />

      <div className="space-y-6">
        {/* Header con Toggle de Vista */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                Historial de Estados
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {totalEventos} eventos registrados en el sistema
              </p>
            </div>

            {/* Toggle de Vista */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-1 dark:border-gray-600">
              <button
                onClick={() => setVista("table")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  vista === "table"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Tabla
              </button>
              <button
                onClick={() => setVista("timeline")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  vista === "timeline"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Filtros Avanzados */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Filtros Avanzados
              </span>
              {(searchQuery || tipoFiltro || proyectoFiltro || fechaDesde || fechaHasta) && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  Activos
                </span>
              )}
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${showFiltros ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFiltros && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Búsqueda General */}
                <div className="lg:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Búsqueda General
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    placeholder="Buscar por SKU, descripción, proyecto..."
                  />
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Estado
                  </label>
                  <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">Todos los estados</option>
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

                {/* Filtro por Proyecto */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Proyecto
                  </label>
                  <select
                    value={proyectoFiltro}
                    onChange={(e) => setProyectoFiltro(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectosUnicos.map((proyecto) => (
                      <option key={proyecto} value={proyecto}>
                        {proyecto}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agrupar Por */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agrupar Por
                  </label>
                  <select
                    value={agruparPor}
                    onChange={(e) => setAgruparPor(e.target.value as AgruparPor)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="none">Sin agrupar</option>
                    <option value="fecha">📅 Por Fecha</option>
                    <option value="sku">📦 Por SKU</option>
                    <option value="estado">🔄 Por Estado</option>
                    <option value="proyecto">📁 Por Proyecto</option>
                  </select>
                </div>

                {/* Fecha Desde */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                {/* Fecha Hasta */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={limpiarFiltros}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Limpiar Filtros
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {totalEventos} eventos encontrados
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Vista de Tabla */}
        {vista === "table" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {totalEventos === 0 ? (
              <div className="py-12 text-center">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No hay eventos con los filtros seleccionados
                </p>
              </div>
            ) : (
              <>
                {/* Tabla */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <tr>
                        <th
                          onClick={() => toggleSort("fecha")}
                          className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            Fecha/Hora
                            {sortBy === "fecha" && (
                              <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort("sku")}
                          className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            SKU
                            {sortBy === "sku" && (
                              <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Producto
                        </th>
                        <th
                          onClick={() => toggleSort("tipo")}
                          className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            Estado
                            {sortBy === "tipo" && (
                              <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Proyecto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Proveedor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {agruparPor === "none" ? (
                        // Sin agrupar
                        filteredEventos.slice(startIndex, endIndex).map((evento) => (
                          <tr
                            key={evento.id}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                              <div>{formatDate(evento.fecha)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {evento.hora}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {evento.sku}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              <div className="max-w-xs truncate">
                                {evento.productoDescripcion}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getAccionColor(
                                  evento.tipo
                                )}`}
                              >
                                {getAccionIcon(evento.tipo)} {evento.descripcion}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {evento.proyecto || "-"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {evento.proveedor || "-"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {evento.monto ? formatCurrency(evento.monto) : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        // Agrupado
                        Object.entries(eventosAgrupados).map(([grupo, eventosGrupo]) => (
                          <React.Fragment key={grupo}>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                              <td
                                colSpan={7}
                                className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white"
                              >
                                <div className="flex items-center gap-2">
                                  {agruparPor === "fecha" && "📅"}
                                  {agruparPor === "sku" && "📦"}
                                  {agruparPor === "estado" && "🔄"}
                                  {agruparPor === "proyecto" && "📁"}
                                  <span>{grupo}</span>
                                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    {eventosGrupo.length} eventos
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {eventosGrupo.slice(0, 100).map((evento) => (
                              <tr
                                key={evento.id}
                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              >
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                  <div>{formatDate(evento.fecha)}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {evento.hora}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                                  {evento.sku}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                  <div className="max-w-xs truncate">
                                    {evento.productoDescripcion}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getAccionColor(
                                      evento.tipo
                                    )}`}
                                  >
                                    {getAccionIcon(evento.tipo)} {evento.descripcion}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                  {evento.proyecto || "-"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                  {evento.proveedor || "-"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                  {evento.monto ? formatCurrency(evento.monto) : "-"}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {agruparPor === "none" && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando {startIndex + 1} a {Math.min(endIndex, totalEventos)} de {totalEventos}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        ← Anterior
                      </button>

                      <span className="px-4 text-sm text-gray-700 dark:text-gray-300">
                        Página {page} de {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Vista Timeline (original) */}
        {vista === "timeline" && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {totalEventos === 0 ? (
              <div className="py-12 text-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No hay cambios registrados con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  filteredEventos.reduce((grupos, evento) => {
                    const fecha = formatDate(evento.fecha);
                    if (!grupos[fecha]) grupos[fecha] = [];
                    grupos[fecha].push(evento);
                    return grupos;
                  }, {} as Record<string, EventoTimeline[]>)
                ).map(([fecha, eventosDelDia]) => (
                  <div key={fecha}>
                    <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 bg-white dark:bg-gray-900">
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {fecha}
                      </span>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    </div>

                    <div className="relative space-y-3 pl-6">
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

                      {eventosDelDia.map((evento) => (
                        <div key={evento.id} className="relative">
                          <div className="absolute -left-[25px] top-3 h-3 w-3 rounded-full border-2 border-white bg-blue-600 dark:border-gray-900" />

                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getAccionColor(
                                      evento.tipo
                                    )}`}
                                  >
                                    {getAccionIcon(evento.tipo)} {evento.descripcion}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {evento.hora}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-1 text-sm">
                                  <p className="font-mono text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">SKU:</span> {evento.sku}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {evento.productoDescripcion}
                                  </p>
                                  {evento.proyecto && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      📁 {evento.proyecto}
                                    </p>
                                  )}
                                  {evento.proveedor && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      🏢 {evento.proveedor}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {evento.cotizacion && (
                                <div className="ml-4 text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cotización
                                  </p>
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {evento.cotizacion}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Eventos</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recibidos</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.porTipo.recibido || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/20">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprados</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.porTipo.comprado || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagados</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.porTipo.pagado || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}