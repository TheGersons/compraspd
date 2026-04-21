import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import ChatPanel from "../../components/chat/ChatPanel";

// ============================================================================
// TYPES
// ============================================================================

type EstadoProductoCompra = {
    id: string;
    sku: string;
    descripcion: string;
    cantidad?: number;
    precioUnitario?: number;
    precioTotal?: number;
    proveedor?: string;

    // Estados booleanos
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

    // Fechas
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

    // Criticidad
    criticidad: number;
    nivelCriticidad: string;
    diasRetrasoActual: number;
    estadoGeneral: string;

    // Calculados
    estadoActual?: string;
    progreso?: number;
    tipoCompra?: 'NACIONAL' | 'INTERNACIONAL';
};

type Producto = {
    id: string;
    sku?: string;
    descripcionProducto: string;
    cantidad: number;
    tipoUnidad: string;
    estadoProducto?: {
        id: string;
        aprobadoPorSupervisor: boolean;
        criticidad: number;
        nivelCriticidad: string;
        diasRetrasoActual: number;
        paisOrigen?: { nombre: string };
        medioTransporte?: string;
        rechazado?: boolean;
        fechaRechazo?: string;
        motivoRechazo?: string;
        // Precio cotizado
        precioUnitario?: number | null;
        precioTotal?: number | null;
        proveedor?: string | null;
        // Estados de compra
        cotizado?: boolean;
        conDescuento?: boolean;
        comprado?: boolean;
        pagado?: boolean;
        primerSeguimiento?: boolean;
        enFOB?: boolean;
        conBL?: boolean;
        segundoSeguimiento?: boolean;
        enCIF?: boolean;
        recibido?: boolean;
        progreso?: number;
        estadoActual?: string;
        // Fechas de compra
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
    };
};

type Cotizacion = {
    id: string;
    nombreCotizacion: string;
    estado: string;
    fechaSolicitud: string;
    fechaLimite: string;
    aprobadaParcialmente: boolean;
    todosProductosAprobados: boolean;
    comentarios?: string;
    tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
    lugarEntrega: string;
    fechaEntregaNacional?: string;
    solicitante: {
        id: string;
        nombre: string;
        email: string;
    };
    supervisorResponsable?: {
        id: string;
        nombre: string;
        email: string;
    };
    proyecto?: {
        id: string;
        nombre: string;
    };
    tipo: {
        nombre: string;
        area: { nombreArea: string };
    };
    chatId?: string;
    totalProductos: number;
    productosAprobados: number;
    productosPendientes: number;
    productosRechazados?: number;
    porcentajeAprobado?: number;
    detalles?: Producto[];
    // Nuevos campos para tracking de compras
    productosEnCompra?: number;
    productosRecibidos?: number;
    progresoCompraTotal?: number;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const ESTADOS_COMPRA_ICONOS: Record<string, string> = {
    cotizado: "📋",
    conDescuento: "💰",
    aprobacionCompra: "✅",
    comprado: "🛒",
    pagado: "💳",
    aprobacionPlanos: "📐",
    primerSeguimiento: "📞",
    enFOB: "🚢",
    cotizacionFleteInternacional: "📊",
    conBL: "📄",
    segundoSeguimiento: "🚚",
    enCIF: "🛃",
    recibido: "📦",
};

const ESTADOS_COMPRA_LABELS: Record<string, string> = {
    cotizado: "Cotizado",
    conDescuento: "Con Descuento",
    aprobacionCompra: "Aprobación de Compra",
    comprado: "Comprado",
    pagado: "Pagado",
    aprobacionPlanos: "Aprobación de Planos",
    primerSeguimiento: "1er Seguimiento / Estado de producto",
    enFOB: "Incoterms",
    cotizacionFleteInternacional: "Cotización Flete Int.",
    conBL: "Documentos de importación",
    segundoSeguimiento: "2do Seg. / En Tránsito",
    enCIF: "Proceso de aduana",
    recibido: "Recibido",
};

// NACIONAL: cotizado → conDescuento → aprobacionCompra → comprado → pagado → recibido
const ESTADOS_NACIONAL = ['cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'recibido'];
// INTERNACIONAL: 13 etapas completas
const ESTADOS_INTERNACIONAL = ['cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'aprobacionPlanos', 'primerSeguimiento', 'enFOB', 'cotizacionFleteInternacional', 'conBL', 'segundoSeguimiento', 'enCIF', 'recibido'];

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = {
    getToken: () => getToken(),

    // Obtener mis cotizaciones (como solicitante)
    async getMisCotizaciones() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/quotations/my-quotations`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            return 0;
        } else {
            return response.json();
        }
    },

    async getMe() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar usuario");
        return response.json();
    },

    // Obtener detalle de una cotización
    async getCotizacionDetalle(id: string) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar detalle");
        const data = await response.json();

        // Adaptar respuesta para incluir estadísticas
        const totalProductos = data.detalles?.length || 0;
        const estadosProductos = data.estadosProductos || [];

        const productosAprobados = estadosProductos.filter(
            (ep: any) => ep.aprobadoPorSupervisor && !ep.rechazado
        ).length;

        const productosRechazados = estadosProductos.filter(
            (ep: any) => ep.rechazado
        ).length;

        // Calcular progreso de compras
        let productosEnCompra = 0;
        let productosRecibidos = 0;
        let sumaProgreso = 0;

        estadosProductos.forEach((ep: any) => {
            if (ep.rechazado) return;
            // Contar en compra: cualquier producto que tenga al menos cotizado=true
            if (ep.cotizado) {
                productosEnCompra++;
                if (ep.recibido) {
                    productosRecibidos++;
                }
                // Calcular progreso individual
                const tipoCompra = data.tipoCompra || 'INTERNACIONAL';
                const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
                let completados = 0;
                estados.forEach(estado => {
                    if (ep[estado]) completados++;
                });
                sumaProgreso += (completados / estados.length) * 100;
            }
        });

        const progresoCompraTotal = productosEnCompra > 0
            ? Math.round(sumaProgreso / productosEnCompra)
            : 0;

        return {
            ...data,
            totalProductos,
            productosAprobados,
            productosPendientes: totalProductos - productosAprobados - productosRechazados,
            productosRechazados,
            porcentajeAprobado: totalProductos > 0
                ? Math.round((productosAprobados / totalProductos) * 100)
                : 0,
            productosEnCompra,
            productosRecibidos,
            progresoCompraTotal,
            // Join de detalles con sus estadosProductos (para tener datos de precio y progreso)
            detalles: (data.detalles || []).map((detalle: any) => {
                const ep = estadosProductos.find(
                    (e: any) => e.cotizacionDetalleId === detalle.id
                );
                return {
                    ...detalle,
                    estadoProducto: ep || detalle.estadoProducto || null,
                };
            }),
        };
    },

    // Obtener estados de productos de mis cotizaciones (para vista de compras)
    async getMisProductosEnCompra() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/mis-productos`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            // Si el endpoint no existe, retornar array vacío
            console.warn("Endpoint mis-productos no disponible");
            return [];
        }
        const data = await response.json();
        return data.items || data || [];
    },

};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const shortDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
};

const calculateDaysLeft = (fechaLimite: string | null | undefined): number => {
    if (!fechaLimite) return 99999;
    const deadline = new Date(fechaLimite);
    if (isNaN(deadline.getTime())) return 99999;
    const diff = deadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getEstadoBadgeColor = (estado: string) => {
    const colores: Record<string, string> = {
        PENDIENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        ENVIADA: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        EN_REVISION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        EN_CONFIGURACION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        APROBADA_PARCIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        APROBADA: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        APROBADA_COMPLETA: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        RECHAZADA: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        CANCELADA: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return colores[estado] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
        PENDIENTE: "Pendiente",
        ENVIADA: "Enviada",
        EN_REVISION: "En Revisión",
        EN_CONFIGURACION: "En Configuración",
        APROBADA_PARCIAL: "Aprobada Parcial",
        APROBADA: "Aprobada",
        APROBADA_COMPLETA: "Aprobada Completa",
        RECHAZADA: "Rechazada",
        CANCELADA: "Cancelada",
    };
    return labels[estado] || estado;
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
        BAJO: "🟢",
        MEDIO: "🟡",
        ALTO: "🔴",
    };
    return badges[nivel] || "⚪";
};

const calcularProgresoProducto = (producto: any, tipoCompra: string): number => {
    if (producto.progreso !== undefined) return producto.progreso;

    const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    let completados = 0;
    estados.forEach(estado => {
        if (producto[estado]) completados++;
    });
    return Math.round((completados / estados.length) * 100);
};

const getEstadoActualProducto = (producto: any, tipoCompra: string): string => {
    if (producto.estadoActual) return producto.estadoActual;

    const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    for (let i = estados.length - 1; i >= 0; i--) {
        if (producto[estados[i]]) {
            return estados[i];
        }
    }
    return estados[0];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyQuotes() {
    const { addNotification } = useNotifications();

    // Estados principales
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [responsableSeguimiento, setResponsableSeguimiento] = useState<{ id: string; nombre: string } | null>(null);

    // Estados de búsqueda y filtros
    const [searchQuery, setSearchQuery] = useState("");
    const [vistaActual, setVistaActual] = useState<'cotizaciones' | 'enCompras' | 'completadas'>('cotizaciones');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Estados de UI
    const [showProductos, setShowProductos] = useState(false);
    const [productoExpandido, setProductoExpandido] = useState<string | null>(null);

    const { user, isLoading } = useAuth();

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

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        cargarMisCotizaciones();
    }, []);

    // ============================================================================
    // FUNCTIONS
    // ============================================================================

    const cargarMisCotizaciones = async () => {
        try {
            setLoading(true);
            const data = await api.getMisCotizaciones();
            if (data === 0) {
                navigate('/quotes/new');
                toast.error('No cuentas con los permisos necesarios');
                return;
            }
            const items = data || [];
            setCotizaciones(items);

            // Auto-seleccionar cotización indicada en el query param ?cotizacion=ID
            const targetId = searchParams.get('cotizacion');
            if (targetId) {
                const target = items.find((c: Cotizacion) => c.id === targetId);
                if (target) seleccionarCotizacion(target);
            }
        } catch (error) {
            console.error("Error al cargar cotizaciones:", error);
            addNotification("danger", "Error", "Error al cargar tus cotizaciones");
        } finally {
            setLoading(false);
        }
    };

    const seleccionarCotizacion = async (cotizacion: Cotizacion) => {
        try {
            setLoadingDetalle(true);
            const detalle = await api.getCotizacionDetalle(cotizacion.id);
            setCotizacionSeleccionada(detalle);
            setShowProductos(false);
            setProductoExpandido(null);
            // Detectar responsable del primer estadoProducto (igual que FollowUps)
            const primerEstado = detalle.estadosProductos?.[0];
            if (primerEstado?.responsableSeguimiento) {
                setResponsableSeguimiento({ id: primerEstado.responsableSeguimiento.id, nombre: primerEstado.responsableSeguimiento.nombre });
            } else {
                setResponsableSeguimiento(null);
            }
        } catch (error) {
            console.error("Error al cargar detalle:", error);
            addNotification("danger", "Error", "Error al cargar detalle de cotización");
        } finally {
            setLoadingDetalle(false);
        }
    };

    // Filtrar cotizaciones según la vista
    const filteredCotizaciones = cotizaciones.filter((cot) => {
        const matchesSearch =
            cot.nombreCotizacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cot.proyecto?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cot.tipo.nombre.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // Filtrar por vista
        if (vistaActual === 'cotizaciones') {
            // Mostrar cotizaciones que aún no están todas aprobadas o no tienen productos en compra
            return !cot.todosProductosAprobados || cot.productosAprobados === 0;
        } else if (vistaActual === 'enCompras') {
            // En compras: hay productos en compra y ninguno ha sido recibido aún
            return cot.productosEnCompra > 0 && (cot.productosRecibidos || 0) === 0;
        } else if (vistaActual === 'completadas') {
            // Recibidos: al menos un producto ya fue recibido
            return cot.productosEnCompra > 0 && (cot.productosRecibidos || 0) > 0;
        }

        return true;
    });

    // Contar por vista
    const countCotizaciones = cotizaciones.filter(c => !c.todosProductosAprobados || c.productosAprobados === 0).length;
    const countEnCompras = cotizaciones.filter(c => c.productosEnCompra > 0 && (c.productosRecibidos || 0) === 0).length;
    const countCompletadas = cotizaciones.filter(c => c.productosEnCompra > 0 && (c.productosRecibidos || 0) > 0).length;

    const daysLeft = cotizacionSeleccionada
        ? calculateDaysLeft(cotizacionSeleccionada.fechaLimite)
        : 0;

    // ============================================================================
    // RENDER - Timeline de producto
    // ============================================================================

    const renderTimelineProducto = (producto: Producto, tipoCompra: 'NACIONAL' | 'INTERNACIONAL') => {
        if (!producto.estadoProducto?.aprobadoPorSupervisor) return null;

        const ep = producto.estadoProducto;
        const estados = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
        const progreso = calcularProgresoProducto(ep, tipoCompra);
        const estadoActual = getEstadoActualProducto(ep, tipoCompra);

        return (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        🛒 Proceso de Compra
                    </span>
                    <span className={`text-sm font-bold ${progreso === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {progreso}%
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                    <div
                        className={`h-full rounded-full transition-all ${progreso === 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                        style={{ width: `${progreso}%` }}
                    />
                </div>

                {/* Timeline compacto */}
                <div className="flex flex-wrap gap-1">
                    {estados.map((estado, index) => {
                        const completado = ep[estado as keyof typeof ep];
                        const esActual = estado === estadoActual;

                        return (
                            <div
                                key={estado}
                                className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${completado
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : esActual
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                    }`}
                                title={ESTADOS_COMPRA_LABELS[estado]}
                            >
                                <span>{ESTADOS_COMPRA_ICONOS[estado]}</span>
                                {completado && <span>✓</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Estado actual */}
                <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                        Estado actual: <span className="font-medium text-gray-900 dark:text-white">
                            {ESTADOS_COMPRA_ICONOS[estadoActual]} {ESTADOS_COMPRA_LABELS[estadoActual]}
                        </span>
                    </span>
                    {ep.diasRetrasoActual > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                            ⏰ {ep.diasRetrasoActual} días de retraso
                        </span>
                    )}
                </div>

                {/* Info adicional si está expandido */}
                {productoExpandido === producto.id && (
                    <div className="mt-3 space-y-2 border-t border-blue-200 pt-3 dark:border-blue-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {ep.paisOrigen && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">País origen:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                        🌍 {ep.paisOrigen.nombre}
                                    </span>
                                </div>
                            )}
                            {ep.medioTransporte && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Transporte:</span>
                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                        {ep.medioTransporte === 'MARITIMO' && '🚢'}
                                        {ep.medioTransporte === 'AEREO' && '✈️'}
                                        {ep.medioTransporte === 'TERRESTRE' && '🚛'}
                                        {' '}{ep.medioTransporte}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Fechas */}
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {ep.fechaCotizado && <div>📋 Cotizado: {shortDate(String(ep.fechaCotizado))}</div>}
                            {ep.fechaConDescuento && <div>💰 Descuento: {shortDate(String(ep.fechaConDescuento))}</div>}
                            {ep.fechaComprado && <div>🛒 Comprado: {shortDate(String(ep.fechaComprado))}</div>}
                            {ep.fechaPagado && <div>💳 Pagado: {shortDate(String(ep.fechaPagado))}</div>}
                            {ep.fechaRecibido && <div>📦 Recibido: {shortDate(String(ep.fechaRecibido))}</div>}
                        </div>
                    </div>
                )}

                {/* Botón expandir/colapsar */}
                <button
                    onClick={() => setProductoExpandido(productoExpandido === producto.id ? null : producto.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {productoExpandido === producto.id ? '▲ Ver menos' : '▼ Ver más detalles'}
                </button>
            </div>
        );
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
            <PageMeta description="Mis cotizaciones" title="Mis Cotizaciones" />

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Mis Cotizaciones
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Realiza seguimiento completo a tus solicitudes - desde cotización hasta recepción
                    </p>
                </div>

                {/* Toggle de vistas */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => { setVistaActual('cotizaciones'); setCotizacionSeleccionada(null); }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${vistaActual === 'cotizaciones'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        📝 Cotizaciones
                        <span className={`rounded-full px-2 py-0.5 text-xs ${vistaActual === 'cotizaciones' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                            {countCotizaciones}
                        </span>
                    </button>
                    <button
                        onClick={() => { setVistaActual('enCompras'); setCotizacionSeleccionada(null); }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${vistaActual === 'enCompras'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        🛒 En Compras
                        <span className={`rounded-full px-2 py-0.5 text-xs ${vistaActual === 'enCompras' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                            {countEnCompras}
                        </span>
                    </button>
                    <button
                        onClick={() => { setVistaActual('completadas'); setCotizacionSeleccionada(null); }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${vistaActual === 'completadas'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        ✅ Recibidas
                        <span className={`rounded-full px-2 py-0.5 text-xs ${vistaActual === 'completadas' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                            {countCompletadas}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ========================================
                        PANEL IZQUIERDO - LISTA DE COTIZACIONES
                    ======================================== */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            {/* Buscador */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o proyecto..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            {/* Título según vista */}
                            <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                                {vistaActual === 'cotizaciones' && `📝 Mis Solicitudes (${filteredCotizaciones.length})`}
                                {vistaActual === 'enCompras' && `🛒 En Proceso de Compra (${filteredCotizaciones.length})`}
                                {vistaActual === 'completadas' && `✅ Pedidos Recibidos (${filteredCotizaciones.length})`}
                            </h3>

                            {/* Lista */}
                            {filteredCotizaciones.length === 0 ? (
                                <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {vistaActual === 'cotizaciones' && "No tienes cotizaciones pendientes"}
                                        {vistaActual === 'enCompras' && "No tienes productos en proceso de compra"}
                                        {vistaActual === 'completadas' && "No tienes pedidos completados aún"}
                                    </p>
                                </div>
                            ) : (
                                <ul className="max-h-[600px] space-y-2 overflow-y-auto">
                                    {filteredCotizaciones.map((cot) => {
                                        const isSelected = cotizacionSeleccionada?.id === cot.id;
                                        const days = calculateDaysLeft(cot.fechaLimite);

                                        return (
                                            <li key={cot.id}>
                                                <button
                                                    onClick={() => seleccionarCotizacion(cot)}
                                                    className={`w-full rounded-lg border p-3 text-left transition-all ${isSelected
                                                        ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                                        }`}
                                                >
                                                    {/* Header con estado */}
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEstadoBadgeColor(cot.estado)}`}
                                                        >
                                                            {getEstadoLabel(cot.estado)}
                                                        </span>
                                                        {/* Badge tipo compra */}
                                                        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cot.tipoCompra === 'NACIONAL'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {cot.tipoCompra === 'NACIONAL' ? '🇭🇳' : '🌍'}
                                                        </span>
                                                    </div>

                                                    {/* Nombre */}
                                                    <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                        {cot.nombreCotizacion}
                                                    </h4>

                                                    {/* Info adicional */}
                                                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                        <p>📦 {cot.totalProductos} productos</p>
                                                        {cot.proyecto && <p>🏗️ {cot.proyecto.nombre}</p>}
                                                        {cot.supervisorResponsable && (
                                                            <p className="text-blue-600 dark:text-blue-400">👤 {cot.supervisorResponsable.nombre}</p>
                                                        )}
                                                    </div>

                                                    {/* Progreso según vista */}
                                                    {vistaActual === 'cotizaciones' && cot.totalProductos > 0 && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Aprobados: {cot.productosAprobados}/{cot.totalProductos}
                                                                </span>
                                                                <span className="font-medium">{cot.porcentajeAprobado || 0}%</span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className="h-full rounded-full bg-blue-600"
                                                                    style={{ width: `${cot.porcentajeAprobado || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(vistaActual === 'enCompras' || vistaActual === 'completadas') && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Recibidos: {cot.productosRecibidos || 0}/{cot.productosAprobados}
                                                                </span>
                                                                <span className={`font-medium ${cot.progresoCompraTotal === 100 ? 'text-green-600 dark:text-green-400' : ''
                                                                    }`}>
                                                                    {cot.progresoCompraTotal || 0}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className={`h-full rounded-full ${cot.progresoCompraTotal === 100 ? 'bg-green-600' : 'bg-orange-500'
                                                                        }`}
                                                                    style={{ width: `${cot.progresoCompraTotal || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* ========================================
                        PANEL DERECHO - DETALLE Y CHAT
                    ======================================== */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* CARD DE DETALLE */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                                    {vistaActual === 'cotizaciones' && 'Detalle de Solicitud'}
                                    {vistaActual === 'enCompras' && 'Seguimiento de Compra'}
                                    {vistaActual === 'completadas' && 'Pedido Completado'}
                                </h3>
                                {cotizacionSeleccionada && (
                                    responsableSeguimiento ? (
                                        <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 dark:border-blue-800 dark:bg-blue-900/20">
                                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                            <span className="text-xs text-blue-700 dark:text-blue-400">
                                                Asignado a <span className="font-semibold">{responsableSeguimiento.nombre}</span>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-700/50">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400"></div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                En revisión por <span className="font-medium text-gray-700 dark:text-gray-300">Dept. de Compras</span>
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            {!cotizacionSeleccionada ? (
                                <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-900">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Selecciona una solicitud para ver los detalles
                                    </p>
                                </div>
                            ) : loadingDetalle ? (
                                <div className="flex h-32 items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cotizacionSeleccionada.nombreCotizacion}
                                            </h4>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEstadoBadgeColor(cotizacionSeleccionada.estado)}`}>
                                                    {getEstadoLabel(cotizacionSeleccionada.estado)}
                                                </span>
                                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${cotizacionSeleccionada.tipoCompra === 'NACIONAL'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {cotizacionSeleccionada.tipoCompra === 'NACIONAL' ? '🇭🇳 Nacional' : '🌍 Internacional'}
                                                </span>
                                            </div>
                                        </div>
                                        {daysLeft !== 99999 && (
                                            <div className={`text-right ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                <p className="text-2xl font-bold">{Math.abs(daysLeft)}</p>
                                                <p className="text-xs">{daysLeft < 0 ? 'días vencido' : 'días restantes'}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Área:</span>
                                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                {cotizacionSeleccionada.tipo.area.nombreArea}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                {cotizacionSeleccionada.tipo.nombre}
                                            </span>
                                        </div>
                                        {cotizacionSeleccionada.proyecto && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Proyecto:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                    {cotizacionSeleccionada.proyecto.nombre}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Entrega:</span>
                                            <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                {cotizacionSeleccionada.lugarEntrega}
                                            </span>
                                        </div>
                                        {cotizacionSeleccionada.supervisorResponsable && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">Supervisor:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                    👤 {cotizacionSeleccionada.supervisorResponsable.nombre}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fecha estimada de entrega - solo compras nacionales */}
                                    {cotizacionSeleccionada.tipoCompra === 'NACIONAL' && cotizacionSeleccionada.fechaEntregaNacional && (
                                        <div className="flex items-center gap-3 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 dark:border-blue-700 dark:from-blue-900/30 dark:to-blue-900/20">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-lg shadow">
                                                📅
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Entrega Estimada</p>
                                                <p className="text-base font-bold text-blue-800 dark:text-blue-200">
                                                    {new Date(cotizacionSeleccionada.fechaEntregaNacional).toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resumen de progreso - calculado dinámicamente */}
                                    {(vistaActual === 'enCompras' || vistaActual === 'completadas') && (() => {
                                        const detalles = cotizacionSeleccionada.detalles || [];
                                        const tipoCompra = cotizacionSeleccionada.tipoCompra || 'INTERNACIONAL';
                                        const estadosList = tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;

                                        const aprobados = detalles.filter(
                                            (p: any) => p.estadoProducto?.aprobadoPorSupervisor && !p.estadoProducto?.rechazado
                                        );
                                        const recibidos = aprobados.filter((p: any) => p.estadoProducto?.recibido);
                                        const comprados = aprobados.filter((p: any) => p.estadoProducto?.comprado);

                                        let sumaProgreso = 0;
                                        aprobados.forEach((p: any) => {
                                            const ep = p.estadoProducto;
                                            let completados = 0;
                                            estadosList.forEach((e: string) => { if (ep?.[e]) completados++; });
                                            sumaProgreso += (completados / estadosList.length) * 100;
                                        });
                                        const progresoReal = aprobados.length > 0
                                            ? Math.round(sumaProgreso / aprobados.length)
                                            : 0;

                                        const precioTotal = aprobados.reduce((sum: number, p: any) => {
                                            return sum + (p.estadoProducto?.precioTotal ? Number(p.estadoProducto.precioTotal) : 0);
                                        }, 0);

                                        return (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                <h5 className="mb-3 font-medium text-blue-800 dark:text-blue-200">
                                                    📊 Resumen de Compra
                                                </h5>
                                                <div className="mb-3 grid grid-cols-4 gap-2 text-center">
                                                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{aprobados.length}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">En compra</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                                                        <p className="text-xl font-bold text-orange-500 dark:text-orange-400">{comprados.length}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Comprados</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{recibidos.length}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Recibidos</p>
                                                    </div>
                                                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                                                        <p className={`text-xl font-bold ${progresoReal === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>{progresoReal}%</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Progreso</p>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${progresoReal === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                            style={{ width: `${progresoReal}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                {precioTotal > 0 && (
                                                    <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm dark:bg-gray-800">
                                                        <span className="text-gray-500 dark:text-gray-400">💵 Valor total del pedido:</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            ${precioTotal.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Lista de productos con timeline */}
                                    <div>
                                        <button
                                            onClick={() => setShowProductos(!showProductos)}
                                            className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                                        >
                                            <span>
                                                📦 Productos ({cotizacionSeleccionada.totalProductos})
                                                {(vistaActual === 'enCompras' || vistaActual === 'completadas') && (
                                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                                        - Click para ver estado de cada producto
                                                    </span>
                                                )}
                                            </span>
                                            <span>{showProductos ? '▲' : '▼'}</span>
                                        </button>

                                        {showProductos && (
                                            <div className="mt-2 max-h-[400px] space-y-3 overflow-y-auto">
                                                {cotizacionSeleccionada.detalles?.map((producto) => (
                                                    <div
                                                        key={producto.id}
                                                        className={`rounded-lg border p-3 ${producto.estadoProducto?.rechazado
                                                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                                                            : producto.estadoProducto?.aprobadoPorSupervisor
                                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                                                                : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    {producto.sku && (
                                                                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                                            {producto.sku}
                                                                        </span>
                                                                    )}
                                                                    {producto.estadoProducto?.rechazado && (
                                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                            ❌ Rechazado
                                                                        </span>
                                                                    )}
                                                                    {producto.estadoProducto?.aprobadoPorSupervisor && !producto.estadoProducto?.rechazado && (
                                                                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                            ✅ Aprobado
                                                                        </span>
                                                                    )}
                                                                    {producto.estadoProducto && (
                                                                        <span className="text-xs">
                                                                            {getCriticidadBadge(producto.estadoProducto.nivelCriticidad)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                                                    {producto.descripcionProducto}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {producto.cantidad} {producto.tipoUnidad}
                                                                </p>

                                                                {/* Precio cotizado - Tab Cotizaciones */}
                                                                {vistaActual === 'cotizaciones' && (() => {
                                                                    const ep = producto.estadoProducto;
                                                                    const tienePrecio = ep?.precioUnitario && Number(ep.precioUnitario) > 0;
                                                                    // También revisar precio del detalle (precios seleccionados desde el backend)
                                                                    const precioDetalle = (producto as any).precios;
                                                                    const tienePrecioDetalle = precioDetalle?.precio && Number(precioDetalle.precio) > 0;

                                                                    if (!tienePrecio && !tienePrecioDetalle) {
                                                                        return (
                                                                            <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                                ⏳ Sin precio cotizado aún
                                                                            </div>
                                                                        );
                                                                    }

                                                                    const precioUnit = tienePrecio
                                                                        ? Number(ep!.precioUnitario)
                                                                        : Number(precioDetalle.precio);
                                                                    const precioTot = tienePrecio
                                                                        ? Number(ep!.precioTotal)
                                                                        : precioUnit * producto.cantidad;
                                                                    const nombreProveedor = tienePrecio
                                                                        ? ep!.proveedor
                                                                        : precioDetalle?.proveedor?.nombre;
                                                                    const tieneDescuento = tienePrecio && ep?.conDescuento && precioDetalle?.precioDescuento;

                                                                    return (
                                                                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                                                                            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                                                                                💰 {tieneDescuento ? 'Precio con descuento' : 'Último precio cotizado'}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                <div>
                                                                                    <span className="text-gray-500 dark:text-gray-400">Unit:</span>
                                                                                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                                                                        ${precioUnit.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                                                                    <span className="ml-1 font-semibold text-green-700 dark:text-green-400">
                                                                                        ${precioTot.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                    </span>
                                                                                </div>
                                                                                {nombreProveedor && (
                                                                                    <div className="col-span-2">
                                                                                        <span className="text-gray-500 dark:text-gray-400">Proveedor:</span>
                                                                                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                                                            🏭 {nombreProveedor}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Motivo de rechazo */}
                                                        {producto.estadoProducto?.rechazado && producto.estadoProducto?.motivoRechazo && (
                                                            <div className="mt-2 rounded bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                <strong>Motivo:</strong> {producto.estadoProducto.motivoRechazo}
                                                            </div>
                                                        )}

                                                        {/* Timeline de compra (solo si está aprobado y en vista de compras) */}
                                                        {(vistaActual === 'enCompras' || vistaActual === 'completadas') &&
                                                            producto.estadoProducto?.aprobadoPorSupervisor &&
                                                            !producto.estadoProducto?.rechazado && (
                                                                renderTimelineProducto(producto, cotizacionSeleccionada.tipoCompra)
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Productos rechazados alert */}
                                    {cotizacionSeleccionada.detalles?.some(p => p.estadoProducto?.rechazado) && (
                                        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">⚠️</span>
                                                <div>
                                                    <h4 className="font-semibold text-red-900 dark:text-red-300">
                                                        Productos Rechazados
                                                    </h4>
                                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                                        {cotizacionSeleccionada.detalles?.filter(p => p.estadoProducto?.rechazado).length} producto(s)
                                                        han sido rechazados. Revisa los detalles arriba.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CARD DE CHAT */}
                        {cotizacionSeleccionada && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                                    💬 Chat con {cotizacionSeleccionada.supervisorResponsable?.nombre || "el equipo"}
                                </h3>
                                <ChatPanel
                                    chatId={cotizacionSeleccionada.chatId}
                                    currentUserId={user.id}
                                    userRole={user.rol?.nombre || 'USUARIO'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
}