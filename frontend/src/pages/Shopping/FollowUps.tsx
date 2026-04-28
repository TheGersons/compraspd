import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import toast from "react-hot-toast";
import ChatPanel from "../../components/chat/ChatPanel";
import { Download, Eye, X, FileText, MoreVertical, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import TimelineItem from "./components/TimeLineItem";
import { matchesSearch } from "../../utils/utils";
import { SearchableSelect } from "../../components/ui/searchable-select";
import { SplitOrdenCompraModal } from "../../components/ordenes-compra/SplitOrdenCompraModal";
import { MoverProductosOCModal } from "../../components/ordenes-compra/MoverProductosOCModal";
import { ApelarResponsableModal } from "../../components/estado-producto/ApelarResponsableModal";
import { MonedaBadge } from "../../components/moneda/MonedaBadge";

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
  ordenCompraId?: string | null;
  ordenCompra?: { id: string; nombre: string; numeroOC?: string | null; estado: string } | null;

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
  cotizacionId?: string;
  proyecto?: {
    id: string;
    nombre: string;
    criticidad: number;
  };
  cotizacion?: {
    id: string;
    nombreCotizacion: string;
    tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
    chatId?: string | null;
    ordenCompra?: string | null;
    monedaId?: string | null;
    moneda?: { id: string; codigo: string; nombre: string; simbolo: string; decimales: number } | null;
    solicitante?: { id: string; nombre: string; email?: string } | null;
    tipo?: { nombre: string; area: { nombreArea: string } } | null;
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

  async avanzarEstadoMasivo(ids: string[], data: { observacion?: string; tipoEntrega?: string }) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/avanzar-masivo`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids, ...data }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al avanzar masivo"); }
    return response.json();
  },

  async actualizarSku(id: string, sku: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/${id}/datos`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sku }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al actualizar SKU"); }
    return response.json();
  },

  async actualizarNombreCotizacion(id: string, nombreCotizacion: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ nombreCotizacion }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al actualizar nombre"); }
    return response.json();
  },

  async setOrdenCompra(cotizacionId: string, ordenCompra: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${cotizacionId}/orden-compra`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ordenCompra }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al asignar OC"); }
    return response.json();
  },

  async asignarResponsableMasivo(ids: string[], responsableId: string | null) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/asignar-responsable-masivo`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids, responsableId }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al asignar"); }
    return response.json();
  },

  async actualizarPrecioMasivo(items: { id: string; precioUnitario?: number | null; precioTotal?: number | null }[]) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/precio-masivo`, {
      method: "PATCH", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || "Error al actualizar precios"); }
    return response.json();
  },

  async getCotizacionDetalle(id: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${id}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar detalle de cotización");
    return response.json();
  },

  async getChatMessages(chatId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar mensajes");
    return response.json();
  },

  async sendMessage(chatId: string, contenido: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`, {
      method: "POST", credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, contenido }),
    });
    if (!response.ok) throw new Error("Error al enviar mensaje");
    return response.json();
  },

  async sendMessageWithFile(chatId: string, file: File, contenido?: string) {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    if (contenido?.trim()) formData.append("contenido", contenido);
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/upload`, {
      method: "POST", credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.message || "Error al enviar archivo"); }
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
  const { user } = useAuth();
  const isComercial = user?.rol?.nombre?.toUpperCase() === 'COMERCIAL';
  const canAsignarResponsable = ['JEFE_COMPRAS', 'ADMIN'].includes(user?.rol?.nombre?.toUpperCase() || '');
  const canDividirOC = ['JEFE_COMPRAS', 'ADMIN', 'SUPERVISOR'].includes(user?.rol?.nombre?.toUpperCase() || '');
  const [splitOcGrupo, setSplitOcGrupo] = useState<{ cotizacionId: string; nombre: string } | null>(null);
  const [moverOcGrupo, setMoverOcGrupo] = useState<{ cotizacionId: string; ordenCompraId: string } | null>(null);
  const [apelarOpen, setApelarOpen] = useState(false);
  const [apelarCotId, setApelarCotId] = useState("");
  const [apelarCotNombre, setApelarCotNombre] = useState("");
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
  const [filtroResponsable, setFiltroResponsable] = useState<string>("");
  const [filtroSolicitante, setFiltroSolicitante] = useState<string>("");
  const [filtroArea, setFiltroArea] = useState<string>("");
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null); // id del producto con menú abierto

  // Vista agrupada por cotización
  const [grupoExpandido, setGrupoExpandido] = useState<string | null>(null);

  // Avance masivo
  const [showAvanceMasivoModal, setShowAvanceMasivoModal] = useState(false);
  const [productosParaAvance, setProductosParaAvance] = useState<string[]>([]);
  const [cotizacionParaAvance, setCotizacionParaAvance] = useState<string | null>(null);
  const [loadingAvanceMasivo, setLoadingAvanceMasivo] = useState(false);
  const [observacionMasiva, setObservacionMasiva] = useState("");
  const [verificacionMasiva, setVerificacionMasiva] = useState<Record<string, { completo: boolean; faltantes: string[] }>>({});
  const [loadingVerificacionMasiva, setLoadingVerificacionMasiva] = useState(false);

  // Modal editar precios
  const [editPrecioGrupoId, setEditPrecioGrupoId] = useState<string | null>(null);
  const [preciosEnEdicion, setPreciosEnEdicion] = useState<{ id: string; sku: string; descripcion: string; precioUnitario: string; cantidad: number | null; precioTotal: string }[]>([]);
  const [savingPrecios, setSavingPrecios] = useState(false);

  // Edición inline
  const [editandoSku, setEditandoSku] = useState<string | null>(null);
  const [skuEditado, setSkuEditado] = useState("");
  const [editandoCotizacion, setEditandoCotizacion] = useState<string | null>(null);
  const [nombreCotEditado, setNombreCotEditado] = useState("");
  const [menuGrupoAbierto, setMenuGrupoAbierto] = useState<string | null>(null);

  // Modal para asignar # Orden de Compra a una cotización INTERNACIONAL
  const [ocCotizacionId, setOcCotizacionId] = useState<string | null>(null);
  const [ocValue, setOcValue] = useState("");
  const [ocSaving, setOcSaving] = useState(false);
  const [ocError, setOcError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat
  const [chatIdActivo, setChatIdActivo] = useState<string | null>(null);
  const currentUserId = user?.id || '';
  // Promise que resuelve cuando el usuario queda registrado como participante del chat activo
  const participanteListoRef = useRef<Promise<void> | null>(null);

  // Vista activa del acordeón expandido
  const [vistaActivaGrupo, setVistaActivaGrupo] = useState<'productos' | 'chat'>('productos');
  const acordeonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => { setMenuAbierto(null); setMenuGrupoAbierto(null); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Efectos
  useEffect(() => {
    cargarProductos();
    api.getSupervisores().then(setSupervisores).catch(() => { });
  }, [filtroNivel, filtroTipoCompra]);

  const handledProductoParamRef = useRef<string | null>(null);
  useEffect(() => {
    const productoId = searchParams.get("producto");
    if (!productoId) return;
    if (loading) return; // esperar a que cargue la lista para poder expandir el grupo correcto
    if (handledProductoParamRef.current === productoId) return;
    handledProductoParamRef.current = productoId;
    (async () => {
      const detalle = await seleccionarProducto(productoId);
      if (!detalle) return;
      const ocId = detalle.ordenCompraId || null;
      const cotId = detalle.cotizacionId || detalle.cotizacion?.id || 'sin-cotizacion';
      const groupKey = ocId ? `oc:${ocId}` : `cot:${cotId}`;
      setGrupoExpandido(groupKey);
      setTimeout(() => {
        acordeonRefs.current[groupKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    })();
  }, [searchParams, loading]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const filters: any = { pageSize: 2000 };
      if (filtroNivel) filters.nivelCriticidad = filtroNivel;
      if (filtroTipoCompra) filters.tipoCompra = filtroTipoCompra;

      const data = await api.getEstadosProductos(filters);
      // Enriquecer con siguienteEstado calculado si no viene del backend
      const items = (data.items || [])
        .filter((p: any) => p.cotizacion?.tipo?.nombre?.toLowerCase() !== 'logistica')
        .map((p: EstadoProducto) => {
          if (!p.siguienteEstado && p.estadoActual && p.estadosAplicables) {
            const idx = p.estadosAplicables.indexOf(p.estadoActual);
            if (idx >= 0 && idx < p.estadosAplicables.length - 1) {
              p.siguienteEstado = p.estadosAplicables[idx + 1];
            }
          }
          return p;
        });
      setProductos(items);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      addNotification("danger", "Error", "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarProducto = async (id: string): Promise<EstadoProducto | null> => {
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
      return detalle;
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      addNotification("danger", "Error", "Error al cargar detalle del producto");
      return null;
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
    // Ocultar rechazados del flujo
    if (p.rechazado) return false;

    if (searchQuery) {
      const matchQuery = matchesSearch(
        searchQuery,
        p.sku,
        p.descripcion,
        p.proveedor,
        p.cotizacion?.nombreCotizacion,
        p.cotizacion?.solicitante?.nombre,
      );
      if (!matchQuery) return false;
    }

    // Filtro por responsable
    if (filtroResponsable) {
      if (p.responsableSeguimiento?.id !== filtroResponsable) return false;
    }

    // Filtro por solicitante
    if (filtroSolicitante) {
      if (p.cotizacion?.solicitante?.id !== filtroSolicitante) return false;
    }

    // Filtro por área
    if (filtroArea) {
      if (p.cotizacion?.tipo?.area?.nombreArea !== filtroArea) return false;
    }

    const estaCompletado = p.progreso === 100;
    if (verCompletados) {
      return estaCompletado;
    } else {
      return !estaCompletado;
    }
  });

  const productosActivos = productos.filter(p => !p.rechazado);
  const totalPendientes = productosActivos.filter(p => p.progreso !== 100).length;
  const totalCompletados = productosActivos.filter(p => p.progreso === 100).length;

  // Solicitantes únicos derivados de los productos cargados
  const solicitantesUnicos = (() => {
    const map = new Map<string, string>();
    productos.forEach(p => {
      const sol = p.cotizacion?.solicitante;
      if (sol?.id) map.set(sol.id, sol.nombre || sol.id);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  })();

  // Áreas únicas derivadas de los productos cargados
  const areasUnicas = Array.from(
    new Set(
      productos
        .map(p => p.cotizacion?.tipo?.area?.nombreArea)
        .filter((n): n is string => !!n)
    )
  ).sort().map(n => ({ id: n, nombre: n }));

  const handleAsignarResponsable = async (productoId: string, responsableId: string | null) => {
    try {
      await api.asignarResponsable(productoId, responsableId);
      toast.success(responsableId ? "Responsable asignado" : "Responsable removido");
      setMenuAbierto(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
  };

  // Agrupar productos por OrdenCompra (si existe) o por cotización
  const productosAgrupados = productosFiltrados.reduce((acc, p) => {
    const cotId = p.cotizacionId || p.cotizacion?.id || 'sin-cotizacion';
    const ocId = p.ordenCompraId || null;
    const key = ocId ? `oc:${ocId}` : `cot:${cotId}`;
    const cotNombre = p.cotizacion?.nombreCotizacion || 'Sin cotización';
    const nombre = p.ordenCompra
      ? `${cotNombre} → ${p.ordenCompra.nombre}`
      : cotNombre;
    if (!acc[key]) {
      acc[key] = {
        groupKey: key,
        cotizacionId: cotId,
        ordenCompraId: ocId,
        nombre,
        tipoCompra: p.cotizacion?.tipoCompra || p.tipoCompra,
        chatId: p.cotizacion?.chatId || null,
        ordenCompra: p.ordenCompra?.numeroOC || p.cotizacion?.ordenCompra || null,
        monedaId: p.cotizacion?.monedaId || null,
        solicitante: p.cotizacion?.solicitante || null,
        tipo: p.cotizacion?.tipo || null,
        productos: [],
      };
    }
    acc[key].productos.push(p);
    return acc;
  }, {} as Record<string, { groupKey: string; cotizacionId: string; ordenCompraId: string | null; nombre: string; tipoCompra: string; chatId: string | null; ordenCompra: string | null; monedaId: string | null; solicitante: { id: string; nombre: string } | null; tipo: { nombre: string; area: { nombreArea: string } } | null; productos: EstadoProducto[] }>);

  const gruposOrdenados = Object.values(productosAgrupados).sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Abrir modal de avance masivo para un grupo de cotización
  const abrirAvanceMasivo = async (cotizacionId: string, productosDelGrupo: EstadoProducto[]) => {
    const elegibles = productosDelGrupo.filter(p => p.progreso < 100 && p.siguienteEstado);
    if (elegibles.length === 0) {
      toast.error("No hay productos elegibles para avanzar en este grupo");
      return;
    }
    setCotizacionParaAvance(cotizacionId);
    setProductosParaAvance(elegibles.map(p => p.id));
    setObservacionMasiva("");
    setVerificacionMasiva({});
    setShowAvanceMasivoModal(true);

    // Verificar documentos para cada producto elegible
    setLoadingVerificacionMasiva(true);
    const verificaciones: Record<string, { completo: boolean; faltantes: string[] }> = {};
    for (const p of elegibles) {
      try {
        const result = await api.verificarDocumentos(p.id, p.siguienteEstado || '');
        verificaciones[p.id] = result;
      } catch {
        verificaciones[p.id] = { completo: true, faltantes: [] };
      }
    }
    setVerificacionMasiva(verificaciones);
    setLoadingVerificacionMasiva(false);
  };

  // Obtener productos elegibles agrupados por estado actual
  const getElegiblesPorEstado = () => {
    const grupo = Object.values(productosAgrupados).find(g => g.cotizacionId === cotizacionParaAvance);
    const elegibles = grupo?.productos.filter(p => p.progreso < 100 && p.siguienteEstado) || [];
    const porEstado: Record<string, EstadoProducto[]> = {};
    for (const p of elegibles) {
      const key = p.estadoActual || 'desconocido';
      if (!porEstado[key]) porEstado[key] = [];
      porEstado[key].push(p);
    }
    return porEstado;
  };

  const handleAvanceMasivo = async () => {
    if (productosParaAvance.length === 0) return;

    // Verificar que todos los seleccionados tienen documentos completos
    const conDocsFaltantes = productosParaAvance.filter(id => verificacionMasiva[id] && !verificacionMasiva[id].completo);
    if (conDocsFaltantes.length > 0) {
      toast.error(`${conDocsFaltantes.length} producto(s) tienen documentos pendientes. Desmarque los que faltan o suba los documentos.`);
      return;
    }

    try {
      setLoadingAvanceMasivo(true);
      const result = await api.avanzarEstadoMasivo(productosParaAvance, {
        observacion: observacionMasiva || undefined,
      });
      toast.success(`${result.exitosos} productos avanzados${result.fallidos > 0 ? `, ${result.fallidos} con errores` : ''}`);
      if (result.fallidos > 0) {
        const errores = result.resultados.filter((r: any) => !r.ok);
        errores.forEach((e: any) => toast.error(e.mensaje, { duration: 5000 }));
      }
      setShowAvanceMasivoModal(false);
      await cargarProductos();
      if (productoSeleccionado) await seleccionarProducto(productoSeleccionado.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingAvanceMasivo(false);
    }
  };

  // Determinar si el siguiente estado requiere selección FOB/CIF
  const handleGuardarSku = async (productoId: string) => {
    if (!skuEditado.trim()) return;
    try {
      await api.actualizarSku(productoId, skuEditado.trim());
      toast.success("SKU actualizado");
      setEditandoSku(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleGuardarNombreCotizacion = async (cotizacionId: string) => {
    if (!nombreCotEditado.trim()) return;
    try {
      await api.actualizarNombreCotizacion(cotizacionId, nombreCotEditado.trim());
      toast.success("Nombre actualizado");
      setEditandoCotizacion(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
  };

  // Abrir modal para asignar # Orden de Compra a una cotización INTERNACIONAL
  const abrirModalOC = (cotizacionId: string, ocActual: string | null) => {
    setOcCotizacionId(cotizacionId);
    setOcValue(ocActual || "");
    setOcError(null);
  };

  const cerrarModalOC = () => {
    setOcCotizacionId(null);
    setOcValue("");
    setOcError(null);
  };

  const handleGuardarOC = async () => {
    if (!ocCotizacionId) return;
    const oc = ocValue.trim();
    if (!oc) {
      setOcError("El # de Orden de Compra es obligatorio");
      return;
    }
    try {
      setOcSaving(true);
      setOcError(null);
      await api.setOrdenCompra(ocCotizacionId, oc);
      toast.success("# Orden de Compra asignada");
      cerrarModalOC();
      await cargarProductos();
      // Refrescar el producto seleccionado para que la OC se vea de inmediato sin recargar la página
      if (productoSeleccionado) {
        await seleccionarProducto(productoSeleccionado.id);
      }
    } catch (e: any) {
      setOcError(e.message || "Error al asignar OC");
    } finally {
      setOcSaving(false);
    }
  };

  const abrirEditarPrecios = (groupKey: string) => {
    const grupo = productosAgrupados[groupKey];
    if (!grupo) return;
    setPreciosEnEdicion(grupo.productos.map(p => ({
      id: p.id,
      sku: p.sku,
      descripcion: p.descripcion,
      precioUnitario: p.precioUnitario != null ? String(p.precioUnitario) : "",
      cantidad: p.cantidad ?? null,
      precioTotal: p.precioTotal != null ? String(p.precioTotal) : "",
    })));
    setEditPrecioGrupoId(groupKey);
  };

  const handleGuardarPrecios = async () => {
    const items = preciosEnEdicion.map(p => ({
      id: p.id,
      precioUnitario: p.precioUnitario !== "" ? parseFloat(p.precioUnitario) : null,
      precioTotal: p.precioTotal !== "" ? parseFloat(p.precioTotal) : null,
    }));
    setSavingPrecios(true);
    try {
      await api.actualizarPrecioMasivo(items);
      toast.success("Precios actualizados");
      setEditPrecioGrupoId(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingPrecios(false); }
  };

  const handleAsignarResponsableGrupo = async (groupKey: string, responsableId: string | null) => {
    const grupo = productosAgrupados[groupKey];
    if (!grupo) return;
    const ids = grupo.productos.map(p => p.id);
    try {
      await api.asignarResponsableMasivo(ids, responsableId);
      toast.success(responsableId ? `Responsable asignado a ${ids.length} productos` : `Responsable removido de ${ids.length} productos`);
      setMenuGrupoAbierto(null);
      await cargarProductos();
    } catch (e: any) { toast.error(e.message); }
  };

  const requiereSeleccionFobCif = productoSeleccionado?.siguienteEstado === 'enFOB';

  // Handler para expandir/colapsar grupo en el acordeón
  const handleToggleGrupo = (groupKey: string) => {
    if (grupoExpandido === groupKey) {
      setGrupoExpandido(null);
      setChatIdActivo(null);
      setProductoSeleccionado(null);
      setTimeline(null);
      participanteListoRef.current = null;
      return;
    }
    // Establecer chatId inmediatamente (mismo chat que Cotizaciones, sin esperar)
    const chatIdDelGrupo = productosAgrupados[groupKey]?.chatId || null;
    setGrupoExpandido(groupKey);
    setVistaActivaGrupo('productos');
    setProductoSeleccionado(null);
    setTimeline(null);
    setChatIdActivo(chatIdDelGrupo);
    // Registrar participante en background
    const cotId = productosAgrupados[groupKey]?.cotizacionId;
    participanteListoRef.current = chatIdDelGrupo && cotId
      ? api.getCotizacionDetalle(cotId).then(() => { }).catch(() => { })
      : Promise.resolve();
  };

  // Cuando se activa la vista de chat
  const handleActivarChat = async () => {
    setVistaActivaGrupo('chat');
  };

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
        <div className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {/* Toggle + Búsqueda */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shrink-0">
              <button
                onClick={() => setVerCompletados(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${!verCompletados
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                En Proceso ({totalPendientes})
              </button>
              <button
                onClick={() => setVerCompletados(true)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${verCompletados
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                Completados ({totalCompletados})
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por SKU, descripción o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {/* Filtros en fila */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Solicitante */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <label className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">Solicitante:</label>
              <SearchableSelect
                value={filtroSolicitante}
                onChange={setFiltroSolicitante}
                options={solicitantesUnicos}
                allLabel="Todos los solicitantes"
                allValue=""
              />
            </div>
            {/* Responsable */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <label className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">Responsable:</label>
              <SearchableSelect
                value={filtroResponsable}
                onChange={setFiltroResponsable}
                options={supervisores}
                allLabel="Todos los responsables"
                allValue=""
              />
            </div>
            {/* Área */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <label className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">Área:</label>
              <SearchableSelect
                value={filtroArea}
                onChange={setFiltroArea}
                options={areasUnicas}
                allLabel="Todas las áreas"
                allValue=""
              />
            </div>
            {/* Tipo de compra */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <label className="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</label>
              <select
                value={filtroTipoCompra}
                onChange={(e) => setFiltroTipoCompra(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              >
                <option value="">Todos los tipos</option>
                <option value="NACIONAL">Nacional</option>
                <option value="INTERNACIONAL">Internacional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de compras — acordeón */}
        <div className="rounded-lg border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {verCompletados ? "✅ Completados" : "📋 En Proceso"} ({gruposOrdenados.length} compra{gruposOrdenados.length !== 1 ? 's' : ''}, {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''})
            </h3>
          </div>
          {/* Accordion */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : gruposOrdenados.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {verCompletados ? 'No hay compras completadas' : 'No hay compras en proceso'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {gruposOrdenados.map((grupo) => {
                const estaExpandido = grupoExpandido === grupo.groupKey;
                const progresoPromedio = grupo.productos.length > 0
                  ? Math.round(grupo.productos.reduce((sum, p) => sum + (p.progreso || 0), 0) / grupo.productos.length)
                  : 0;
                return (
                  <div
                    key={grupo.groupKey}
                    ref={(el) => { acordeonRefs.current[grupo.groupKey] = el; }}
                    className={`transition-all ${estaExpandido ? 'border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => handleToggleGrupo(grupo.groupKey)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {editandoCotizacion === grupo.cotizacionId ? (
                            <input type="text" value={nombreCotEditado} autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setNombreCotEditado(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleGuardarNombreCotizacion(grupo.cotizacionId);
                                if (e.key === 'Escape') setEditandoCotizacion(null);
                              }}
                              onBlur={() => setEditandoCotizacion(null)}
                              className="text-sm font-semibold border-b border-blue-500 bg-transparent text-gray-900 dark:text-white outline-none" />
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{grupo.nombre}</p>
                              {!isComercial && (
                                <button onClick={(e) => { e.stopPropagation(); setEditandoCotizacion(grupo.cotizacionId); setNombreCotEditado(grupo.nombre); }}
                                  className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" title="Editar nombre">
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                              )}
                              {grupo.tipo && (
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                  {grupo.tipo.area.nombreArea} - {grupo.tipo.nombre}
                                </span>
                              )}
                            </div>
                          )}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${grupo.tipoCompra === 'NACIONAL'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {grupo.tipoCompra === 'NACIONAL' ? 'Nacional' : 'Internacional'}
                          </span>
                          <span onClick={(e) => e.stopPropagation()}>
                            <MonedaBadge
                              cotizacionId={grupo.cotizacionId}
                              monedaId={grupo.monedaId}
                              tipoCompra={grupo.tipoCompra as any}
                              onChange={() => cargarProductos()}
                            />
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <span>{grupo.productos.length} producto{grupo.productos.length !== 1 ? 's' : ''}</span>
                          {grupo.solicitante && <span>• {grupo.solicitante.nombre}</span>}
                          <span>• {progresoPromedio}% promedio</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hidden sm:block">
                          <div
                            className={`h-full rounded-full ${progresoPromedio === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progresoPromedio}%` }}
                          />
                        </div>
                        {/* Botón editar precios */}
                        <button
                          onClick={(e) => { e.stopPropagation(); abrirEditarPrecios(grupo.groupKey); }}
                          className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors"
                          title="Editar precio(s)"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {grupo.productos.length > 1 ? "Precios" : "Precio"}
                        </button>
                        {canDividirOC && !grupo.ordenCompraId && (() => {
                          const totalProductosCot = productos.filter(p => p.cotizacionId === grupo.cotizacionId).length;
                          if (totalProductosCot < 2) return null;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSplitOcGrupo({ cotizacionId: grupo.cotizacionId, nombre: grupo.nombre });
                              }}
                              title="Dividir en nueva Orden de Compra"
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              Dividir OC
                            </button>
                          );
                        })()}
                        {canDividirOC && grupo.ordenCompraId && (() => {
                          const otrasOCs = productos.filter(
                            (p) => p.cotizacionId === grupo.cotizacionId && p.ordenCompra && p.ordenCompra.id !== grupo.ordenCompraId,
                          ).length;
                          const hayBase = productos.some(
                            (p) => p.cotizacionId === grupo.cotizacionId && !p.ordenCompraId,
                          );
                          if (otrasOCs === 0 && !hayBase) return null;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoverOcGrupo({ cotizacionId: grupo.cotizacionId, ordenCompraId: grupo.ordenCompraId! });
                              }}
                              title="Mover productos a otra OC"
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              Mover
                            </button>
                          );
                        })()}
                        {canAsignarResponsable && (
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setMenuGrupoAbierto(menuGrupoAbierto === grupo.cotizacionId ? null : grupo.cotizacionId)}
                              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                              title="Asignar responsable al grupo"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {menuGrupoAbierto === grupo.cotizacionId && (
                              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                <div className="p-1.5">
                                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Asignar a todo el grupo:</p>
                                  {supervisores.map(sup => (
                                    <button key={sup.id}
                                      onClick={() => handleAsignarResponsableGrupo(grupo.groupKey, sup.id)}
                                      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                                      {sup.nombre}
                                    </button>
                                  ))}
                                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                  <button
                                    onClick={() => handleAsignarResponsableGrupo(grupo.groupKey, null)}
                                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    Quitar responsable de todos
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <svg
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${estaExpandido ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded body */}
                    {estaExpandido && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {/* Tabs */}
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
                          <div className="flex">
                            <button
                              onClick={() => setVistaActivaGrupo('productos')}
                              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${vistaActivaGrupo === 'productos'
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                              Productos ({grupo.productos.length})
                            </button>
                            <button
                              onClick={handleActivarChat}
                              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${vistaActivaGrupo === 'chat'
                                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                              Chat
                            </button>
                          </div>
                          {(() => {
                            const esResponsable = grupo.productos.some(
                              p => p.responsableSeguimiento?.id === currentUserId,
                            );
                            const noPasoPagado = !grupo.productos.some(
                              p => p.enFOB || p.enCIF || p.conBL || p.recibido,
                            );
                            if (!esResponsable || !noPasoPagado) return null;
                            return (
                              <button
                                onClick={() => {
                                  setApelarCotId(grupo.cotizacionId);
                                  setApelarCotNombre(grupo.nombre);
                                  setApelarOpen(true);
                                }}
                                title="Rechazar mi asignación como responsable"
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Apelar asignación
                              </button>
                            );
                          })()}
                        </div>

                        {/* Tab: Productos */}
                        {vistaActivaGrupo === 'productos' && (
                          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {grupo.productos.map((producto) => {
                              const esProdExpandido = productoSeleccionado?.id === producto.id;
                              return (
                                <div key={producto.id} className={`transition-colors ${esProdExpandido ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                  {/* Product row */}
                                  <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                    onClick={() => esProdExpandido ? setProductoSeleccionado(null) : seleccionarProducto(producto.id)}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        {editandoSku === producto.id ? (
                                          <input type="text" value={skuEditado} autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setSkuEditado(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleGuardarSku(producto.id);
                                              if (e.key === 'Escape') setEditandoSku(null);
                                            }}
                                            onBlur={() => setEditandoSku(null)}
                                            className="text-sm font-medium font-mono border-b border-blue-500 bg-transparent text-gray-900 dark:text-white outline-none w-24" />
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{producto.sku}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setEditandoSku(producto.id); setSkuEditado(producto.sku); }}
                                              className="text-gray-400 hover:text-blue-500 transition-colors" title="Editar SKU">
                                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                          </div>
                                        )}
                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getCriticidadBg(producto.nivelCriticidad)}`}>
                                          {getCriticidadBadge(producto.nivelCriticidad)}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">{producto.descripcion}</p>
                                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                                        {ESTADOS_ICONOS[producto.estadoActual || 'cotizado']} {ESTADOS_LABELS[producto.estadoActual || 'cotizado']}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {canAsignarResponsable && (
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                          <button onClick={() => setMenuAbierto(menuAbierto === producto.id ? null : producto.id)}
                                            className="rounded p-0.5 text-gray-400 hover:text-blue-500 transition-colors" title="Asignar responsable">
                                            {producto.responsableSeguimiento ? (
                                              <span className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                                                <UserCheck size={10} />{producto.responsableSeguimiento.nombre.split(' ')[0]}
                                              </span>
                                            ) : <MoreVertical size={12} />}
                                          </button>
                                          {menuAbierto === producto.id && (
                                            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                              onClick={(e) => e.stopPropagation()}>
                                              <div className="p-1.5">
                                                <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Asignar a:</p>
                                                {supervisores.map(sup => (
                                                  <button key={sup.id}
                                                    onClick={() => handleAsignarResponsable(producto.id, sup.id)}
                                                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors ${producto.responsableSeguimiento?.id === sup.id
                                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                                      }`}>
                                                    {sup.nombre}
                                                  </button>
                                                ))}
                                                {producto.responsableSeguimiento && (
                                                  <>
                                                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                                    <button onClick={() => handleAsignarResponsable(producto.id, null)}
                                                      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                      Quitar responsable
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <span className={`text-sm font-bold ${producto.progreso === 100 ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {producto.progreso}%
                                      </span>
                                      <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${esProdExpandido ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Product detail inline */}
                                  {esProdExpandido && (
                                    <div className="px-4 pb-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/30">
                                      {loadingDetalle ? (
                                        <div className="flex h-20 items-center justify-center">
                                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                                        </div>
                                      ) : productoSeleccionado && (
                                        <>
                                          <div className="pt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                                            {productoSeleccionado.proveedor && <span>🏢 {productoSeleccionado.proveedor}</span>}
                                            {productoSeleccionado.proyecto && <span>📁 {productoSeleccionado.proyecto.nombre}</span>}
                                            {productoSeleccionado.paisOrigen && <span>🌍 {productoSeleccionado.paisOrigen.nombre}</span>}
                                            {productoSeleccionado.tipoEntrega && (
                                              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                {productoSeleccionado.tipoEntrega === 'FOB' ? '🚢 FOB' : '📦 CIF'}
                                              </span>
                                            )}
                                            <Button asChild size="sm" className="bg-[#4169E1] hover:bg-[#3154B8] text-white rounded-lg text-xs">
                                              <Link to={`/shopping/documents?producto=${productoSeleccionado.id}`}>📄 Ver Documentos</Link>
                                            </Button>
                                          </div>

                                          {productoSeleccionado.siguienteEstado && productoSeleccionado.progreso !== 100 && (() => {
                                            const esInternacional = (productoSeleccionado.cotizacion?.tipoCompra || productoSeleccionado.tipoCompra) === 'INTERNACIONAL';
                                            const estadoActualEsComprado = productoSeleccionado.estadoActual === 'comprado';
                                            const ocActual = productoSeleccionado.cotizacion?.ordenCompra || null;
                                            const requiereOC = esInternacional && estadoActualEsComprado;
                                            const ocFaltante = requiereOC && !ocActual;
                                            return (
                                              <div className={`rounded-lg border p-3 ${ocFaltante ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'}`}>
                                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                                  <div>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Siguiente estado</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                      {ESTADOS_ICONOS[productoSeleccionado.siguienteEstado]} {ESTADOS_LABELS[productoSeleccionado.siguienteEstado]}
                                                    </p>
                                                    {requiereOC && (
                                                      <p className={`mt-1 text-xs ${ocFaltante ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>
                                                        {ocActual ? `# OC: ${ocActual}` : 'Orden de Compra pendiente (obligatoria para avanzar)'}
                                                      </p>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                                    {requiereOC && productoSeleccionado.cotizacionId && (
                                                      <button
                                                        onClick={() => abrirModalOC(productoSeleccionado.cotizacionId!, ocActual)}
                                                        disabled={loadingAccion}
                                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 whitespace-nowrap ${ocFaltante ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                                        title={ocActual ? 'Editar # Orden de Compra' : 'Agregar # Orden de Compra (obligatorio)'}
                                                      >
                                                        {ocActual ? `Editar # OC` : 'Agregar # Orden de Compra'}
                                                      </button>
                                                    )}
                                                    <button
                                                      onClick={abrirModalAvanzar}
                                                      disabled={loadingAccion || ocFaltante}
                                                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                                                      title={ocFaltante ? 'Debes asignar el # de Orden de Compra primero' : 'Avanzar al siguiente estado'}
                                                    >
                                                      Avanzar Estado
                                                    </button>
                                                    {productoSeleccionado.cotizacionId && (() => {
                                                      const grupoProductos = productos.filter(p => p.cotizacionId === productoSeleccionado.cotizacionId);
                                                      const eligiblesAvance = grupoProductos.filter(p => p.progreso < 100 && p.siguienteEstado && !p.rechazado);
                                                      return eligiblesAvance.length > 1 ? (
                                                        <button
                                                          onClick={() => abrirAvanceMasivo(productoSeleccionado.cotizacionId!, grupoProductos)}
                                                          disabled={loadingAccion || ocFaltante}
                                                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                                                          title={ocFaltante ? 'Debes asignar el # de Orden de Compra primero' : 'Avanzar todos los productos de esta compra al siguiente estado'}
                                                        >
                                                          Avanzar todos ({eligiblesAvance.length})
                                                        </button>
                                                      ) : null;
                                                    })()}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })()}

                                          {timeline && (
                                            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                Timeline ({productoSeleccionado.tipoCompra === 'NACIONAL' ? '5' : '11'} Etapas)
                                              </h4>
                                              <div className="space-y-2">
                                                {timeline.timeline?.map((item: TimelineItemType, index: number) => {
                                                  const diasRetraso = item.diasRetraso || 0;
                                                  const isRetrasado = diasRetraso > 0;
                                                  const isCompletado = item.completado;
                                                  return (
                                                    <div key={index} className={`relative rounded-lg border p-3 ${isCompletado
                                                      ? isRetrasado
                                                        ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                                        : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                                                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                                                      }`}>
                                                      <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isCompletado
                                                            ? isRetrasado ? 'bg-red-200 dark:bg-red-800' : 'bg-green-200 dark:bg-green-800'
                                                            : 'bg-gray-200 dark:bg-gray-700'
                                                            }`}>
                                                            {ESTADOS_ICONOS[item.estado] || '📌'}
                                                          </div>
                                                          <TimelineItem
                                                            item={item}
                                                            producto={productoSeleccionado}
                                                            sku={productoSeleccionado.sku}
                                                            onRefresh={() => seleccionarProducto(productoSeleccionado.id)}
                                                          />
                                                        </div>
                                                        <div className="text-right shrink-0 ml-2">
                                                          {isCompletado ? (
                                                            isRetrasado ? (
                                                              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                ⏰ {diasRetraso}d retraso
                                                              </span>
                                                            ) : (
                                                              <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                ✅ En tiempo
                                                              </span>
                                                            )
                                                          ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-300 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                              ⏳ Pendiente
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                                  <div>
                                                    <p className="text-xs text-gray-500">Criticidad</p>
                                                    <p className={`mt-0.5 font-semibold ${getCriticidadColor(timeline.nivelCriticidad)}`}>{timeline.criticidad}/10</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500">Progreso</p>
                                                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{timeline.progreso}%</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-gray-500">Retraso</p>
                                                    <p className={`mt-0.5 font-semibold ${timeline.diasRetrasoTotal > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                      {timeline.diasRetrasoTotal}d
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Tab: Chat */}
                        {vistaActivaGrupo === 'chat' && (
                          <ChatPanel
                            chatId={chatIdActivo}
                            currentUserId={currentUserId}
                            userRole={user?.rol?.nombre?.toUpperCase() || ''}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

      {/* Modal Avance Masivo */}
      {/* ── Modal Editar Precios ── */}
      {editPrecioGrupoId && (
        <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Editar {preciosEnEdicion.length === 1 ? "precio" : "precios"} — {productosAgrupados[editPrecioGrupoId]?.nombre}
              </h3>
              <button onClick={() => setEditPrecioGrupoId(null)} className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">SKU</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500">Cant.</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500">Precio Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {preciosEnEdicion.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2 pr-3 font-mono text-xs text-gray-600 dark:text-gray-400 align-middle">{p.sku}</td>
                      <td className="py-2 pr-3 text-xs text-gray-700 dark:text-gray-300 max-w-[180px] truncate align-middle" title={p.descripcion}>{p.descripcion}</td>
                      <td className="py-2 pr-2 align-middle">
                        <input
                          type="number" min="0" step="0.01"
                          value={p.precioUnitario}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPreciosEnEdicion(prev => prev.map((item, idx) => {
                              if (idx !== i) return item;
                              const newPU = val;
                              const cant = item.cantidad ?? 1;
                              const newTotal = val !== "" ? String(parseFloat(val) * cant) : item.precioTotal;
                              return { ...item, precioUnitario: newPU, precioTotal: newTotal };
                            }));
                          }}
                          className="w-24 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-right text-xs outline-none focus:border-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="py-2 pr-2 text-right text-xs text-gray-500 align-middle">{p.cantidad ?? "—"}</td>
                      <td className="py-2 align-middle">
                        <input
                          type="number" min="0" step="0.01"
                          value={p.precioTotal}
                          onChange={(e) => setPreciosEnEdicion(prev => prev.map((item, idx) => idx === i ? { ...item, precioTotal: e.target.value } : item))}
                          className="w-28 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-right text-xs outline-none focus:border-amber-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
              <button onClick={() => setEditPrecioGrupoId(null)} className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
                Cancelar
              </button>
              <button
                onClick={handleGuardarPrecios}
                disabled={savingPrecios}
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {savingPrecios ? "Guardando..." : "Guardar precios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAvanceMasivoModal && cotizacionParaAvance && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">▶▶ Avanzar todos los productos de esta compra</h3>
              <button onClick={() => setShowAvanceMasivoModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Los productos están agrupados por su estado actual. Seleccioná cuáles avanzar:
            </p>

            {loadingVerificacionMasiva && (
              <div className="flex items-center gap-2 mb-4 text-sm text-blue-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Verificando documentos...
              </div>
            )}

            {/* Productos agrupados por estado actual */}
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
              {Object.entries(getElegiblesPorEstado()).map(([estadoActual, prods]) => {
                const todosSeleccionados = prods.every(p => productosParaAvance.includes(p.id));
                const siguienteLabel = ESTADOS_LABELS[prods[0]?.siguienteEstado || ''] || 'Siguiente';
                return (
                  <div key={estadoActual} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header del sub-grupo por estado */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={todosSeleccionados}
                          onChange={() => {
                            if (todosSeleccionados) {
                              setProductosParaAvance(prev => prev.filter(id => !prods.some(p => p.id === id)));
                            } else {
                              setProductosParaAvance(prev => [...new Set([...prev, ...prods.map(p => p.id)])]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {ESTADOS_ICONOS[estadoActual]} {ESTADOS_LABELS[estadoActual] || estadoActual}
                        </span>
                      </label>
                      <span className="text-[10px] text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                        → {siguienteLabel} ({prods.length})
                      </span>
                    </div>
                    {/* Productos del sub-grupo */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {prods.map(p => {
                        const isSelected = productosParaAvance.includes(p.id);
                        const verif = verificacionMasiva[p.id];
                        const docsFaltantes = verif && !verif.completo;
                        return (
                          <label key={p.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''} ${docsFaltantes ? 'opacity-80' : ''}`}>
                            <input type="checkbox" checked={isSelected}
                              onChange={() => setProductosParaAvance(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                              className="rounded border-gray-300 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{p.sku} — <span className="font-normal text-gray-600 dark:text-gray-400">{p.descripcion}</span></p>
                              {docsFaltantes && (
                                <p className="text-[10px] text-red-500 mt-0.5">⚠️ Docs faltantes: {verif.faltantes.join(', ')}</p>
                              )}
                              {verif && verif.completo && (
                                <p className="text-[10px] text-green-600 mt-0.5">✅ Documentos completos</p>
                              )}
                            </div>
                            <span className="text-xs font-bold text-gray-500">{p.progreso}%</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen de selección */}
            {(() => {
              const selConFaltantes = productosParaAvance.filter(id => verificacionMasiva[id] && !verificacionMasiva[id].completo);
              return selConFaltantes.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    ⚠️ {selConFaltantes.length} producto(s) seleccionado(s) tienen documentos pendientes. No podrán avanzar hasta completarlos.
                  </p>
                </div>
              );
            })()}

            {/* Seleccionar todos / ninguno */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => {
                const todos = Object.values(getElegiblesPorEstado()).flat().map(p => p.id);
                setProductosParaAvance(todos);
              }} className="text-xs text-blue-600 hover:underline">Seleccionar todos</button>
              <button onClick={() => setProductosParaAvance([])} className="text-xs text-gray-500 hover:underline">Deseleccionar todos</button>
            </div>

            {/* Observación opcional */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observación (opcional)</label>
              <input type="text" value={observacionMasiva} onChange={(e) => setObservacionMasiva(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Ej: Lote completo avanzado a comprado" />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAvanceMasivoModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
              <button onClick={handleAvanceMasivo}
                disabled={loadingAvanceMasivo || productosParaAvance.length === 0 || loadingVerificacionMasiva}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {loadingAvanceMasivo ? "Avanzando..." : `Avanzar ${productosParaAvance.length} producto(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar # Orden de Compra */}
      {ocCotizacionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              # Orden de Compra
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Esta OC aplica a todos los productos de la cotización y es obligatoria
              antes de avanzar del estado "Comprado" en compras internacionales.
            </p>
            <input
              type="text"
              value={ocValue}
              onChange={(e) => setOcValue(e.target.value)}
              placeholder="Ej: OC-2026-00123"
              autoFocus
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {ocError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{ocError}</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={cerrarModalOC}
                disabled={ocSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarOC}
                disabled={ocSaving || !ocValue.trim()}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {ocSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: mover productos a otra OC */}
      {moverOcGrupo && (() => {
        const productosDeOC = productos.filter(
          (p) => p.ordenCompraId === moverOcGrupo.ordenCompraId,
        );
        const ordenOrigen = productosDeOC[0]?.ordenCompra;
        if (!ordenOrigen) return null;
        const ordenesDestino = Array.from(
          new Map(
            productos
              .filter(
                (p) =>
                  p.cotizacionId === moverOcGrupo.cotizacionId &&
                  p.ordenCompra &&
                  p.ordenCompra.id !== moverOcGrupo.ordenCompraId,
              )
              .map((p) => [p.ordenCompra!.id, p.ordenCompra!]),
          ).values(),
        );
        return (
          <MoverProductosOCModal
            open={!!moverOcGrupo}
            onClose={() => setMoverOcGrupo(null)}
            ordenOrigen={ordenOrigen}
            ordenesDestino={ordenesDestino}
            productos={productosDeOC.map((p: any) => ({
              id: p.id,
              sku: p.sku,
              descripcion: p.descripcion,
              comprado: p.comprado,
              pagado: p.pagado,
              enFOB: p.enFOB,
              enCIF: p.enCIF,
              recibido: p.recibido,
              conBL: p.conBL,
            }))}
            onSuccess={() => { cargarProductos(); }}
          />
        );
      })()}

      {/* Modal: apelar asignación de responsable */}
      <ApelarResponsableModal
        open={apelarOpen}
        onClose={() => setApelarOpen(false)}
        cotizacionId={apelarCotId}
        cotizacionNombre={apelarCotNombre}
        onSuccess={() => cargarProductos()}
      />

      {/* Modal: dividir en nueva OC */}
      {splitOcGrupo && (() => {
        const grupoSel = productosAgrupados[`cot:${splitOcGrupo.cotizacionId}`];
        const productosGrupo = grupoSel?.productos || [];
        const ordenesDelGrupo = Array.from(
          new Map(
            productos
              .filter(p => p.cotizacionId === splitOcGrupo.cotizacionId && p.ordenCompra)
              .map(p => [p.ordenCompra!.id, p.ordenCompra!])
          ).values()
        );
        return (
          <SplitOrdenCompraModal
            open={!!splitOcGrupo}
            onClose={() => setSplitOcGrupo(null)}
            cotizacionId={splitOcGrupo.cotizacionId}
            cotizacionNombre={splitOcGrupo.nombre}
            productos={productosGrupo.map((p: any) => ({
              id: p.id,
              sku: p.sku,
              descripcion: p.descripcion,
              comprado: p.comprado,
              pagado: p.pagado,
              enFOB: p.enFOB,
              enCIF: p.enCIF,
              recibido: p.recibido,
              conBL: p.conBL,
              ordenCompraId: p.ordenCompraId,
            }))}
            ordenesExistentes={ordenesDelGrupo}
            onSuccess={() => { cargarProductos(); }}
          />
        );
      })()}
    </>
  );
}