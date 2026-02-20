import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import toast from "react-hot-toast";
import { Download, Eye, X, FileText, CalendarIcon, MoreVertical, UserCheck, Users, ChevronDown } from "lucide-react";

import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import TimelineItem from "./components/TimeLineItem";

// ============================================================================
// TYPES
// ============================================================================

type TimelineItemType = {
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

export type EstadoProducto = {
  id: string;
  sku: string;
  descripcion: string;
  cantidad?: number;
  precioUnitario?: number;
  precioTotal?: number;
  proveedor?: string;
  responsable?: string;
  observaciones?: string;
  responsableSeguimiento?: { id: string; nombre: string; email?: string } | null;

  // 13 estados booleanos (ACTUALIZADO)
  cotizado: boolean;
  conDescuento: boolean;
  aprobacionCompra: boolean;                         // ← NUEVO
  comprado: boolean;
  pagado: boolean;
  aprobacionPlanos: boolean;                         // ← NUEVO
  primerSeguimiento: boolean;
  enFOB: boolean;
  cotizacionFleteInternacional: boolean;
  conBL: boolean;
  segundoSeguimiento: boolean;
  enCIF: boolean;
  recibido: boolean;

  // Fechas reales (ACTUALIZADO - 13 fechas)
  fechaCotizado?: string | null;
  fechaConDescuento?: string | null;
  fechaAprobacionCompra?: string | null;             // ← NUEVO
  fechaComprado?: string | null;
  fechaPagado?: string | null;
  fechaAprobacionPlanos?: string | null;             // ← NUEVO
  fechaPrimerSeguimiento?: string | null;
  fechaEnFOB?: string | null;
  fechaCotizacionFleteInternacional?: string | null;
  fechaConBL?: string | null;
  fechaSegundoSeguimiento?: string | null;
  fechaEnCIF?: string | null;
  fechaRecibido?: string | null;

  // Fechas límite (ACTUALIZADO - 13 fechas)
  fechaLimiteCotizado?: string | null;
  fechaLimiteConDescuento?: string | null;
  fechaLimiteAprobacionCompra?: string | null;
  fechaLimiteComprado?: string | null;
  fechaLimitePagado?: string | null;
  fechaLimiteAprobacionPlanos?: string | null;
  fechaLimitePrimerSeguimiento?: string | null;
  fechaLimiteEnFOB?: string | null;
  fechaLimiteCotizacionFleteInternacional?: string | null;
  fechaLimiteConBL?: string | null;
  fechaLimiteSegundoSeguimiento?: string | null;
  fechaLimiteEnCIF?: string | null;
  fechaLimiteRecibido?: string | null;

  // Campos de Evidencia (ACTUALIZADO - 13 campos)
  evidenciaCotizado?: string | null;
  evidenciaConDescuento?: string | null;
  evidenciaAprobacionCompra?: string | null;         // ← NUEVO
  evidenciaComprado?: string | null;
  evidenciaPagado?: string | null;
  evidenciaAprobacionPlanos?: string | null;         // ← NUEVO
  evidenciaPrimerSeguimiento?: string | null;
  evidenciaEnFOB?: string | null;
  evidenciaCotizacionFleteInternacional?: string | null;
  evidenciaConBL?: string | null;
  evidenciaSegundoSeguimiento?: string | null;
  evidenciaEnCIF?: string | null;
  evidenciaRecibido?: string | null;

  // Campos de Rechazo
  rechazado: boolean;
  fechaRechazo?: string | null;
  motivoRechazo?: string | null;

  // NUEVO: Tipo de entrega seleccionado (FOB o CIF)
  tipoEntrega?: 'FOB' | 'CIF' | null;

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
  timeline?: TimelineItemType[];
};


// ============================================================================
// CONSTANTS (ACTUALIZADO - 11 ESTADOS)
// ============================================================================

const ESTADOS_LABELS: Record<string, string> = {
  cotizado: "Cotizado",
  conDescuento: "Con Descuento",
  aprobacionCompra: "Aprob. Compra",                 // ← NUEVO
  comprado: "Comprado",
  pagado: "Pagado",
  aprobacionPlanos: "Aprob. Planos",                 // ← NUEVO
  primerSeguimiento: "1er Seguimiento / Estado del producto",
  enFOB: "Incoterm",
  cotizacionFleteInternacional: "Cotización Flete Int.",
  conBL: "Documentos de importación",
  segundoSeguimiento: "2do Seg. / En Tránsito",
  enCIF: "Proceso Aduana",
  recibido: "Recibido",
};

const ESTADOS_ICONOS: Record<string, string> = {
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

const EVIDENCE_CONFIG: Record<string, { dbField: keyof EstadoProducto; storageType: string }> = {
  cotizado: { dbField: 'evidenciaCotizado', storageType: 'otros' },
  conDescuento: { dbField: 'evidenciaConDescuento', storageType: 'comprobantes_descuento' },
  aprobacionCompra: { dbField: 'evidenciaAprobacionCompra', storageType: 'evidencia_aprobacionCompra' },          // ← NUEVO
  comprado: { dbField: 'evidenciaComprado', storageType: 'evidencia_comprado' },
  pagado: { dbField: 'evidenciaPagado', storageType: 'evidencia_pagado' },
  aprobacionPlanos: { dbField: 'evidenciaAprobacionPlanos', storageType: 'evidencia_aprobacionPlanos' },          // ← NUEVO
  primerSeguimiento: { dbField: 'evidenciaPrimerSeguimiento', storageType: 'evidencia_primerSeguimiento' },
  enFOB: { dbField: 'evidenciaEnFOB', storageType: 'evidencia_enFOB' },
  cotizacionFleteInternacional: { dbField: 'evidenciaCotizacionFleteInternacional', storageType: 'evidencia_cotizacionFleteInternacional' },
  conBL: { dbField: 'evidenciaConBL', storageType: 'evidencia_conBL' },
  segundoSeguimiento: { dbField: 'evidenciaSegundoSeguimiento', storageType: 'evidencia_segundoSeguimiento' },
  enCIF: { dbField: 'evidenciaEnCIF', storageType: 'evidencia_enCIF' },
  recibido: { dbField: 'evidenciaRecibido', storageType: 'evidencia_recibido' }
};

const ESTADOS_NACIONAL = [
  'cotizado',
  'conDescuento',
  'aprobacionCompra',                                // ← NUEVO
  'comprado',
  'pagado',
  'recibido'
];
const ESTADOS_INTERNACIONAL = [
  'cotizado',
  'conDescuento',
  'aprobacionCompra',                                // ← NUEVO
  'comprado',
  'pagado',
  'aprobacionPlanos',                                // ← NUEVO
  'primerSeguimiento',
  'enFOB',
  'cotizacionFleteInternacional',
  'conBL',
  'segundoSeguimiento',
  'enCIF',
  'recibido'
];

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

  async avanzarEstado(id: string, data: {
    observacion?: string;
    tipoEntrega?: 'FOB' | 'CIF' | 'EXW' | 'FCA' | 'CIP' | 'CPT' | 'CPR' | 'DAP' | 'DDP' | string;
  }) {
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

  async verificarDocumentos(estadoProductoId: string, estado: string) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documentos/verificar/${estadoProductoId}/${estado}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return { completo: true, faltantes: [] }; // Si falla, no bloquear
    return response.json();
  },

  async getDocumentosProducto(estadoProductoId: string) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documentos/producto/${estadoProductoId}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return {};
    return response.json();
  },
  async getSupervisores() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/supervisores`, {
      credentials: "include", headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return response.json();
  },
  async asignarResponsable(id: string, responsableId: string | null) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/${id}/asignar-responsable`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ responsableId }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error"); }
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

  // Verificación de documentos para avanzar
  const [docVerificacion, setDocVerificacion] = useState<{ completo: boolean; faltantes: string[] } | null>(null);
  const [loadingVerificacion, setLoadingVerificacion] = useState(false);

  // NUEVO: Estado para selección FOB/CIF
  const [tipoEntregaSeleccionado, setTipoEntregaSeleccionado] = useState<string | null>(null);

  // Responsables / Supervisores
  const [supervisores, setSupervisores] = useState<{ id: string; nombre: string; email: string; rol: { nombre: string } }[]>([]);
  const [filtroResponsables, setFiltroResponsables] = useState<string[]>([]);
  const [showResponsableDropdown, setShowResponsableDropdown] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null); // id del producto con menú abierto

  const fileInputRef = useRef<HTMLInputElement>(null); // Se mantiene por si TimelineItem lo usa

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => { setMenuAbierto(null); setShowResponsableDropdown(false); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Efectos
  useEffect(() => {
    cargarProductos();
    api.getSupervisores().then(setSupervisores).catch(() => { });
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
      const [detalle, timelineData, documentosData] = await Promise.all([
        api.getEstadoProductoById(id),
        api.getTimeline(id),
        api.getDocumentosProducto(id),
      ]);

      // Enriquecer timeline items con info de documentos del sistema nuevo
      if (timelineData?.timeline && documentosData) {
        for (const item of timelineData.timeline) {
          const estadoDocs = documentosData[item.estado];
          if (estadoDocs && estadoDocs.requeridos?.length > 0) {
            const totalReq = estadoDocs.requeridos.filter((r: any) => r.obligatorio).length;
            const completados = estadoDocs.requeridos.filter(
              (r: any) => r.obligatorio && (r.adjuntos?.length > 0 || r.noAplica)
            ).length;
            item.documentos = {
              totalRequeridos: totalReq,
              completados,
              completo: totalReq > 0 ? completados >= totalReq : true,
            };
          }
        }
      }

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

    // NUEVO: Validar selección FOB/CIF si es el estado enFOB
    if (productoSeleccionado.siguienteEstado === 'enFOB' && !tipoEntregaSeleccionado) {
      addNotification("warn", "Advertencia", "Debe seleccionar si es FOB o CIF");
      return;
    }

    try {
      setLoadingAccion(true);

      // Avanzar estado - el backend valida documentos automáticamente
      await api.avanzarEstado(productoSeleccionado.id, {
        observacion: observacion || undefined,
        tipoEntrega: productoSeleccionado.siguienteEstado === 'enFOB' ? tipoEntregaSeleccionado || undefined : undefined
      });

      addNotification("success", "Éxito", "Estado avanzado correctamente");

      // Limpiar y recargar
      setShowAvanzarModal(false);
      setObservacion("");
      setTipoEntregaSeleccionado(null);
      setDocVerificacion(null);

      await seleccionarProducto(productoSeleccionado.id);
      await cargarProductos();
    } catch (error: any) {
      console.error("Error al avanzar estado:", error);
      addNotification("danger", "Error", error.message || "Error al avanzar estado");
    } finally {
      setLoadingAccion(false);
    }
  };

  const abrirModalAvanzar = async () => {
    setObservacion("");
    setTipoEntregaSeleccionado(null);
    setDocVerificacion(null);
    setShowAvanzarModal(true);

    // Verificar documentos del SIGUIENTE estado (al que se va a avanzar)
    const estadoAVerificar = productoSeleccionado?.siguienteEstado || productoSeleccionado?.estadoActual;
    if (estadoAVerificar) {
      setLoadingVerificacion(true);
      try {
        const result = await api.verificarDocumentos(productoSeleccionado.id, estadoAVerificar);
        setDocVerificacion(result);
      } catch {
        setDocVerificacion({ completo: true, faltantes: [] }); // No bloquear si falla
      } finally {
        setLoadingVerificacion(false);
      }
    }
  };

  // Filtrar productos por búsqueda, estado y responsable
  const productosFiltrados = productos.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchQuery = (
        p.sku.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        p.proveedor?.toLowerCase().includes(query)
      );
      if (!matchQuery) return false;
    }

    // Filtro por responsable
    if (filtroResponsables.length > 0) {
      const respId = p.responsableSeguimiento?.id;
      if (!respId || !filtroResponsables.includes(respId)) return false;
    }

    const estaCompletado = p.progreso === 100;
    if (verCompletados) {
      return estaCompletado;
    } else {
      return !estaCompletado;
    }
  });

  const totalPendientes = productos.filter(p => p.progreso !== 100).length;
  const totalCompletados = productos.filter(p => p.progreso === 100).length;

  const handleAsignarResponsable = async (productoId: string, responsableId: string | null) => {
    try {
      await api.asignarResponsable(productoId, responsableId);
      toast.success(responsableId ? "Responsable asignado" : "Responsable removido");
      setMenuAbierto(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
  };

  // Determinar si el siguiente estado requiere selección FOB/CIF
  const requiereSeleccionFobCif = productoSeleccionado?.siguienteEstado === 'enFOB';

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
              className={`px-4 py-2 text-sm font-medium transition-colors ${!verCompletados
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              📋 En Proceso ({totalPendientes})
            </button>
            <button
              onClick={() => setVerCompletados(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${verCompletados
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

          {/* Filtro Tipo Compra - ACTUALIZADO */}
          <select
            value={filtroTipoCompra}
            onChange={(e) => setFiltroTipoCompra(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los tipos</option>
            <option value="NACIONAL">🇭🇳 Nacional (6 etapas)</option>
            <option value="INTERNACIONAL">🌍 Internacional (13 etapas)</option>
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

          {/* Filtro por Responsable */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowResponsableDropdown(!showResponsableDropdown); }}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${filtroResponsables.length > 0
                ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
            >
              {/*flecha hacia abajo*/}

              <Users size={14} />
              {filtroResponsables.length === 0 ? "Todos los encargados" : `${filtroResponsables.length} seleccionado${filtroResponsables.length > 1 ? 's' : ''}`}
              <ChevronDown size={14} />
            </button>
            {showResponsableDropdown && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="max-h-60 overflow-y-auto p-2">
                  <button
                    onClick={() => { setFiltroResponsables([]); setShowResponsableDropdown(false); }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${filtroResponsables.length === 0
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                  >
                    👥 Ver todos
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                  {supervisores.map(sup => {
                    const isChecked = filtroResponsables.includes(sup.id);
                    return (
                      <label key={sup.id} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setFiltroResponsables(prev =>
                              isChecked ? prev.filter(id => id !== sup.id) : [...prev, sup.id]
                            );
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white">{sup.nombre}</span>
                        <span className="ml-auto text-xs text-gray-400">{sup.rol.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${productoSeleccionado?.id === producto.id
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
                              {producto.progreso === 100 && (
                                <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  ✅ Completado
                                </span>
                              )}
                              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${producto.tipoCompra === 'NACIONAL'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {producto.tipoCompra === 'NACIONAL' ? '🇭🇳 Nacional' : '🌍 Internacional'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {ESTADOS_ICONOS[producto.estadoActual || 'cotizado']} {ESTADOS_LABELS[producto.estadoActual || 'cotizado']}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className={`text-lg font-bold ${producto.progreso === 100
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                              }`}>
                              {producto.progreso}%
                            </span>
                            {/* Responsable badge + menú */}
                            <div className="relative">
                              <div
                                role="button"
                                onClick={(e) => { e.stopPropagation(); setMenuAbierto(menuAbierto === producto.id ? null : producto.id); }}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                title="Asignar responsable"
                              >
                                {producto.responsableSeguimiento ? (
                                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <UserCheck size={10} />
                                    {producto.responsableSeguimiento.nombre.split(' ')[0]}
                                  </span>
                                ) : (
                                  <span className="text-gray-400"><MoreVertical size={12} /></span>
                                )}
                              </div>
                              {menuAbierto === producto.id && (
                                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                  onClick={(e) => e.stopPropagation()}>
                                  <div className="p-1.5">
                                    <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Asignar a:</p>
                                    {supervisores.map(sup => (
                                      <button key={sup.id}
                                        onClick={() => handleAsignarResponsable(producto.id, sup.id)}
                                        className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors ${producto.responsableSeguimiento?.id === sup.id
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                          }`}>
                                        {sup.nombre}
                                      </button>
                                    ))}
                                    {producto.responsableSeguimiento && (
                                      <>
                                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                        <button
                                          onClick={() => handleAsignarResponsable(producto.id, null)}
                                          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                          Quitar responsable
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Barra de progreso */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full rounded-full transition-all ${producto.progreso === 100
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
              <div className="space-y-6">
                {/* Info del producto */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {productoSeleccionado.sku}
                        </h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCriticidadBg(productoSeleccionado.nivelCriticidad)}`}>
                          {getCriticidadBadge(productoSeleccionado.nivelCriticidad)}
                        </span>
                        {/* Mostrar si es FOB o CIF cuando aplique */}
                        {productoSeleccionado.tipoEntrega && (
                          <span className="rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            {productoSeleccionado.tipoEntrega === 'FOB' ? '🚢 FOB' : '📦 CIF'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {productoSeleccionado.descripcion}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        {productoSeleccionado.proveedor && (
                          <span>🏢 {productoSeleccionado.proveedor}</span>
                        )}
                        {productoSeleccionado.proyecto && (
                          <span>📁 {productoSeleccionado.proyecto.nombre}</span>
                        )}
                        {productoSeleccionado.paisOrigen && (
                          <span>🌍 {productoSeleccionado.paisOrigen.nombre}</span>
                        )}
                        {productoSeleccionado.medioTransporte && (
                          <span>
                            {productoSeleccionado.medioTransporte === 'MARITIMO' && '🚢'}
                            {productoSeleccionado.medioTransporte === 'AEREO' && '✈️'}
                            {productoSeleccionado.medioTransporte === 'TERRESTRE' && '🚛'}
                            {' '}{productoSeleccionado.medioTransporte}
                          </span>
                        )}
                        <Button
                          asChild
                          size="lg"
                          className="bg-[#4169E1] hover:bg-[#3154B8] text-white rounded-xl text-base font-semibold shadow-md transition-colors"
                        >
                          <Link to={`/shopping/documents?producto=${productoSeleccionado.id}`}>
                            📄 Ver Documentos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Siguiente estado y botón avanzar */}
                {productoSeleccionado.siguienteEstado && productoSeleccionado.progreso !== 100 && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Siguiente estado</p>
                        <p className="mt-1 text-lg font-semibold text-blue-900 dark:text-blue-100">
                          {ESTADOS_ICONOS[productoSeleccionado.siguienteEstado]} {ESTADOS_LABELS[productoSeleccionado.siguienteEstado]}
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

                {/* Timeline - ACTUALIZADO */}
                {timeline && (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <h4 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                      Timeline del Proceso ({productoSeleccionado.tipoCompra === 'NACIONAL' ? '5' : '11'} Etapas)
                    </h4>

                    <div className="space-y-4">
                      {timeline.timeline?.map((item: TimelineItemType, index: number) => {
                        const diasRetraso = item.diasRetraso || 0;
                        const isRetrasado = diasRetraso > 0;
                        const isCompletado = item.completado;

                        return (
                          <div
                            key={index}
                            className={`relative rounded-lg border p-4 ${isCompletado
                              ? isRetrasado
                                ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                                : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                              : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${isCompletado
                                    ? isRetrasado
                                      ? "bg-red-200 dark:bg-red-800"
                                      : "bg-green-200 dark:bg-green-800"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                >
                                  {ESTADOS_ICONOS[item.estado] || "📌"}
                                </div>

                                <TimelineItem
                                  item={item}
                                  producto={productoSeleccionado}
                                  sku={productoSeleccionado.sku}
                                  onRefresh={() => seleccionarProducto(productoSeleccionado.id)}
                                />

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

        {/* Modal Avanzar Estado - ACTUALIZADO con selector FOB/CIF */}
        {showAvanzarModal && productoSeleccionado && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Avanzar al siguiente estado
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {ESTADOS_ICONOS[productoSeleccionado.siguienteEstado || '']} {ESTADOS_LABELS[productoSeleccionado.siguienteEstado || '']}
              </p>

              <div className="mt-6 space-y-4">

                {/* NUEVO: Selector FOB/CIF cuando el siguiente estado es enFOB */}
                {requiereSeleccionFobCif && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Incoterm <span className="text-red-500">*</span>
                    </label>

                    {/* Grupo: Requiere cotización de flete */}
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">🚢 Requieren cotización de flete internacional</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { key: 'EXW', label: 'Ex Works', desc: 'En fábrica' },
                        { key: 'FOB', label: 'Free On Board', desc: 'Libre a bordo' },
                        { key: 'FCA', label: 'Free Carrier', desc: 'Libre transportista' },
                      ].map(inc => (
                        <button key={inc.key} type="button" onClick={() => setTipoEntregaSeleccionado(inc.key)}
                          className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all text-center ${tipoEntregaSeleccionado === inc.key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 hover:border-blue-300 dark:border-gray-600'}`}>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{inc.key}</span>
                          <span className="text-[10px] text-gray-500 leading-tight">{inc.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Grupo: Flete incluido */}
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5">📦 Flete incluido (se salta cotización de flete)</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {[
                        { key: 'CIF', desc: 'Cost, Insurance & Freight' },
                        { key: 'CIP', desc: 'Carriage & Insurance Paid' },
                        { key: 'CPT', desc: 'Carriage Paid To' },
                        { key: 'CPR', desc: 'Carriage Paid Return' },
                        { key: 'DAP', desc: 'Delivered At Place' },
                        { key: 'DDP', desc: 'Delivered Duty Paid' },
                      ].map(inc => (
                        <button key={inc.key} type="button" onClick={() => setTipoEntregaSeleccionado(inc.key)}
                          className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2.5 transition-all text-center ${tipoEntregaSeleccionado === inc.key
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                            : 'border-gray-200 hover:border-green-300 dark:border-gray-600'}`}>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{inc.key}</span>
                          <span className="text-[9px] text-gray-500 leading-tight">{inc.desc}</span>
                        </button>
                      ))}
                    </div>

                    {tipoEntregaSeleccionado && ['CIF', 'CIP', 'CPT', 'CPR', 'DAP', 'DDP'].includes(tipoEntregaSeleccionado) && (
                      <div className="mt-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ Con {tipoEntregaSeleccionado}, el estado "Cotización Flete Int." se marcará automáticamente como completado.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Estado de documentos del estado actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Documentos del estado actual
                  </label>
                  {loadingVerificacion ? (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm text-gray-500">Verificando documentos...</span>
                    </div>
                  ) : docVerificacion ? (
                    docVerificacion.completo ? (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-green-700 dark:text-green-300">Todos los documentos están completos</span>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600">⚠️</span>
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">Documentos pendientes:</span>
                        </div>
                        <ul className="ml-6 space-y-1">
                          {docVerificacion.faltantes.map((f, i) => (
                            <li key={i} className="text-xs text-red-600 dark:text-red-400">• {f}</li>
                          ))}
                        </ul>
                        <Link
                          to={`/shopping/documents?producto=${productoSeleccionado.id}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          📄 Ir a Documentos para completarlos →
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                      <span className="text-sm text-gray-500">Sin requerimientos de documentos para este estado</span>
                    </div>
                  )}
                </div>

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
                    setTipoEntregaSeleccionado(null);
                    setDocVerificacion(null);
                  }}
                  disabled={loadingAccion}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAvanzarEstado}
                  disabled={
                    loadingAccion ||
                    (docVerificacion !== null && !docVerificacion.completo) ||
                    (requiereSeleccionFobCif && !tipoEntregaSeleccionado)
                  }
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