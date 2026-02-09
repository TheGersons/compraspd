import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

type Producto = {
    id: string;
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
    tipoCompra: string;
    lugarEntrega: string;
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
};

type ChatMessage = {
    id: string;
    contenido: string;
    creado: string;
    emisor: {
        id: string;
        nombre: string;
        email: string;
    };
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();


const api = {
    // Obtener mis cotizaciones (como solicitante)
    async getMisCotizaciones() {
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
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar usuario");
        return response.json();
    },
    // Obtener detalle de una cotización
    async getCotizacionDetalle(id: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar detalle");
        const data = await response.json();

        // Adaptar respuesta para incluir estadísticas
        const totalProductos = data.detalles?.length || 0;
        const productosAprobados = data.estadosProductos?.filter(
            (ep: any) => ep.aprobadoPorSupervisor
        ).length || 0;

        return {
            ...data,
            totalProductos,
            productosAprobados,
            productosPendientes: totalProductos - productosAprobados,
            porcentajeAprobado: totalProductos > 0
                ? Math.round((productosAprobados / totalProductos) * 100)
                : 0,
        };
    },

    // Chat - Obtener mensajes
    async getChatMessages(chatId: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar mensajes");
        return response.json();
    },

    // Chat - Enviar mensaje
    async sendMessage(chatId: string, contenido: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/messages`, {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ chatId, contenido }),
        });
        if (!response.ok) throw new Error("Error al enviar mensaje");
        return response.json();
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyQuotes() {
    const { addNotification } = useNotifications();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Estados principales
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // Estados de búsqueda y filtros
    const [searchQuery, setSearchQuery] = useState("");

    // Estados del chat
    const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [loadingChat, setLoadingChat] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const navigate = useNavigate();
    // Estados de UI
    const [showProductos, setShowProductos] = useState(false);

    const { user, isLoading } = useAuth()
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }
    const [currentUserId, setCurrentUserId] = useState<string>("");
    // 2. SIN USUARIO (ProtectedRoute redirigirá)
    if (!user) {
        return null;
    }

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        cargarMisCotizaciones();
        obtenerUsuarioActual();
    }, []);

    useEffect(() => {
        if (cotizacionSeleccionada?.chatId) {
            cargarMensajes(cotizacionSeleccionada.chatId);
        }
    }, [cotizacionSeleccionada]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // ============================================================================
    // FUNCTIONS
    // ============================================================================

    // En MyQuotes - Parte 2

    const obtenerUsuarioActual = async () => {
        setCurrentUserId(user.id);
    };

    const  cargarMisCotizaciones = async () => {
        try {
            setLoading(true);
            const data = await api.getMisCotizaciones();
            if (data === 0) {

                navigate('/quotes/new');
                toast.error('No cuentas con los permisos necesarios');
                return;
            }
            setCotizaciones(data || []);
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
        } catch (error) {
            console.error("Error al cargar detalle:", error);
            addNotification("danger", "Error", "Error al cargar detalle de cotización");
        } finally {
            setLoadingDetalle(false);
        }
    };

    const cargarMensajes = async (chatId: string) => {
        try {
            setLoadingChat(true);
            const data = await api.getChatMessages(chatId);

            // CORRECCIÓN: Ordenar por fecha ascendente (más antiguos primero)
            const mensajesOrdenados = (data.items || data || []).sort((a: ChatMessage, b: ChatMessage) => {
                return new Date(a.creado).getTime() - new Date(b.creado).getTime();
            });

            setMensajes(mensajesOrdenados);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        } finally {
            setLoadingChat(false);
        }
    };

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim() || !cotizacionSeleccionada?.chatId) {
            addNotification("warn", "Advertencia", "Escribe un mensaje");
            return;
        }

        try {
            setSendingMessage(true);
            await api.sendMessage(cotizacionSeleccionada.chatId, nuevoMensaje.trim());
            setNuevoMensaje("");
            await cargarMensajes(cotizacionSeleccionada.chatId);
            addNotification("success", "Éxito", "Mensaje enviado");
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            addNotification("danger", "Error", "Error al enviar mensaje");
        } finally {
            setSendingMessage(false);
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const filteredCotizaciones = cotizaciones.filter((cot) => {
        const matchesSearch =
            cot.nombreCotizacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cot.proyecto?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cot.tipo.nombre.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const daysLeft = cotizacionSeleccionada
        ? calculateDaysLeft(cotizacionSeleccionada.fechaLimite)
        : 0;

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
                        Realiza seguimiento a tus solicitudes de cotización
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ========================================
              PANEL IZQUIERDO - LISTA DE COTIZACIONES
          ======================================== */}
                    <div className="lg:col-span-1">
                        <div className="my-8 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
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

                            {/* Contador */}
                            <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                                Mis Solicitudes ({filteredCotizaciones.length})
                            </h3>

                            {/* Lista */}
                            {filteredCotizaciones.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {searchQuery ? "No se encontraron solicitudes." : "No tienes solicitudes aún."}
                                </p>
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
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getEstadoBadgeColor(
                                                                cot.estado
                                                            )}`}
                                                        >
                                                            {getEstadoLabel(cot.estado)}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-medium ${days < 0
                                                                ? "text-red-600 dark:text-red-400"
                                                                : days <= 3
                                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                                    : "text-green-600 dark:text-green-400"
                                                                }`}
                                                        >
                                                            {days < 0 ? `${Math.abs(days)}d vencido` : days === 0 ? "Hoy" : `${days}d`}
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
                                                            <p>👤 {cot.supervisorResponsable.nombre}</p>
                                                        )}
                                                    </div>

                                                    {/* Progreso */}
                                                    {cot.totalProductos > 0 && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Aprobados: {cot.productosAprobados}/{cot.totalProductos}
                                                                </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {cot.porcentajeAprobado || 0}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
                                                                    style={{ width: `${cot.porcentajeAprobado || 0}%` }}
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
                        <div className="my-8 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
                                Detalle de Solicitud
                            </h3>

                            {!cotizacionSeleccionada ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Selecciona una solicitud para ver los detalles.
                                </p>
                            ) : loadingDetalle ? (
                                <div className="flex h-32 items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Header con días restantes */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cotizacionSeleccionada.nombreCotizacion}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {cotizacionSeleccionada.tipo.area.nombreArea} • {cotizacionSeleccionada.tipo.nombre}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-2xl font-bold ${daysLeft < 0
                                                    ? "text-red-600 dark:text-red-400"
                                                    : daysLeft <= 3
                                                        ? "text-yellow-600 dark:text-yellow-400"
                                                        : "text-green-600 dark:text-green-400"
                                                    }`}
                                            >
                                                {daysLeft < 0 ? `${Math.abs(daysLeft)}` : daysLeft}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {daysLeft < 0 ? "días vencido" : "días restantes"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Tipo de Compra</div>
                                            <div className="font-semibold text-gray-800 dark:text-white/90">
                                                {cotizacionSeleccionada.tipoCompra === "NACIONAL" ? "Nacional" : "Internacional"}
                                            </div>
                                        </div>
                                        <div className="rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Lugar de Entrega</div>
                                            <div className="font-semibold text-gray-800 dark:text-white/90">
                                                {cotizacionSeleccionada.lugarEntrega === "ALMACEN" ? "Almacén" : cotizacionSeleccionada.lugarEntrega === "PROYECTO" ? "Proyecto" : "Oficina"}
                                            </div>
                                        </div>
                                        <div className="rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Fecha Solicitud</div>
                                            <div className="font-semibold text-gray-800 dark:text-white/90">
                                                {shortDate(cotizacionSeleccionada.fechaSolicitud)}
                                            </div>
                                        </div>
                                        <div className="rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Fecha Límite</div>
                                            <div className="font-semibold text-gray-800 dark:text-white/90">
                                                {shortDate(cotizacionSeleccionada.fechaLimite)}
                                            </div>
                                        </div>
                                        {cotizacionSeleccionada.proyecto && (
                                            <div className="col-span-2 rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Proyecto</div>
                                                <div className="font-semibold text-gray-800 dark:text-white/90">
                                                    {cotizacionSeleccionada.proyecto.nombre}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comentarios */}
                                    {cotizacionSeleccionada.comentarios && (
                                        <div className="rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Comentarios</div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {cotizacionSeleccionada.comentarios}
                                            </p>
                                        </div>
                                    )}

                                    {/* Botón ver productos */}
                                    <button
                                        onClick={() => setShowProductos(!showProductos)}
                                        className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${showProductos
                                            ? "bg-gray-400 text-gray-800 hover:bg-gray-500"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {showProductos
                                            ? "Ocultar productos"
                                            : `Ver ${cotizacionSeleccionada.totalProductos} productos solicitados`}
                                    </button>

                                    {/* Tabla de productos */}
                                    {showProductos && cotizacionSeleccionada.detalles && (
                                        <div className="overflow-hidden transition-all duration-300">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="border-b border-gray-200 dark:border-gray-700">
                                                        <tr>
                                                            <th className="pb-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                                                                Producto
                                                            </th>
                                                            <th className="pb-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                                                                Cantidad
                                                            </th>
                                                            <th className="pb-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                                                                Estado
                                                            </th>
                                                            <th className="pb-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                                                                Criticidad
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {cotizacionSeleccionada.detalles.map((prod) => (
                                                            <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="py-3">
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {prod.descripcionProducto}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                                                    {prod.cantidad} {prod.tipoUnidad.toLowerCase()}
                                                                </td>
                                                                {/* En la celda de estado/aprobación */}
                                                                <td className="py-3 text-center">
                                                                    {prod.estadoProducto?.rechazado ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                            ❌ Rechazado
                                                                        </span>
                                                                    ) : prod.estadoProducto?.aprobadoPorSupervisor ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                            ✓ Aprobado
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                            ⏳ Pendiente
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3">
                                                                    {prod.estadoProducto ? (
                                                                        <div>
                                                                            <span
                                                                                className={`font-semibold ${getCriticidadColor(
                                                                                    prod.estadoProducto.nivelCriticidad
                                                                                )}`}
                                                                            >
                                                                                {prod.estadoProducto.nivelCriticidad}
                                                                            </span>
                                                                            {prod.estadoProducto.diasRetrasoActual > 0 && (
                                                                                <div className="text-xs text-red-600 dark:text-red-400">
                                                                                    +{prod.estadoProducto.diasRetrasoActual}d retraso
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Indicador de progreso general */}
                                    {cotizacionSeleccionada.supervisorResponsable && (
                                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-blue-700 dark:text-blue-300">
                                                    👤 Supervisor asignado:
                                                </span>
                                                <span className="font-semibold text-blue-900 dark:text-blue-200">
                                                    {cotizacionSeleccionada.supervisorResponsable.nombre}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Alerta de productos rechazados */}
                        {/* 1. Asegúrate de que cotizacionSeleccionada no sea null antes de evaluar detalles */}
                        {cotizacionSeleccionada && cotizacionSeleccionada.detalles?.some(p => p.estadoProducto?.rechazado) && (
                            <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                <div className="flex items-start gap-3">
                                    <svg className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-900 dark:text-red-300">
                                            ⚠️ Productos Rechazados
                                        </h4>
                                        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                            Algunos productos de esta cotización han sido rechazados por el supervisor.
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {/* Aquí ya es seguro mapear porque entramos solo si cotizacionSeleccionada existe */}
                                            {cotizacionSeleccionada.detalles
                                                ?.filter(p => p.estadoProducto?.rechazado)
                                                .map(prod => (
                                                    <div key={prod.id} className="rounded-lg bg-white p-3 dark:bg-gray-800">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {prod.descripcionProducto}
                                                        </p>
                                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                            <strong>Motivo:</strong> {prod.estadoProducto?.motivoRechazo}
                                                        </p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CARD DE CHAT */}
                        <div className="my-8 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                                Chat con {cotizacionSeleccionada?.supervisorResponsable?.nombre || "el equipo"}
                            </h3>

                            {!cotizacionSeleccionada ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Selecciona una solicitud para iniciar el chat.
                                </p>
                            ) : !cotizacionSeleccionada.chatId ? (
                                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        ⚠️ El chat aún no está disponible para esta cotización.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex h-[420px] flex-col">
                                    {/* Mensajes */}
                                    <div className="flex-1 space-y-3 overflow-auto rounded-lg p-3 ring-1 ring-gray-200 dark:ring-gray-800">
                                        {loadingChat ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                            </div>
                                        ) : mensajes.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No hay mensajes aún. Inicia la conversación.
                                            </p>
                                        ) : (
                                            <>
                                                {mensajes.map((mensaje) => {
                                                    const esPropio = mensaje.emisor.id === currentUserId;

                                                    return (
                                                        <div
                                                            key={mensaje.id}
                                                            className={`flex ${esPropio ? "justify-end" : "justify-start"}`}
                                                        >
                                                            <div
                                                                className={`max-w-[70%] ${esPropio ? "items-end" : "items-start"
                                                                    } flex flex-col`}
                                                            >
                                                                {/* Nombre del emisor */}
                                                                {!esPropio && (
                                                                    <span className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                        {mensaje.emisor.nombre}
                                                                    </span>
                                                                )}

                                                                {/* Burbuja del mensaje */}
                                                                <div
                                                                    className={`rounded-2xl px-4 py-2 ${esPropio
                                                                        ? "bg-blue-600 text-white dark:bg-blue-500"
                                                                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                                                                        }`}
                                                                >
                                                                    <p className="whitespace-pre-wrap break-words text-sm">
                                                                        {mensaje.contenido}
                                                                    </p>
                                                                </div>

                                                                {/* Fecha */}
                                                                <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                                    {formatDate(mensaje.creado)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={chatEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* Input para enviar mensaje */}
                                    <div className="mt-2 flex items-end gap-2">
                                        <textarea
                                            value={nuevoMensaje}
                                            onChange={(e) => setNuevoMensaje(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    enviarMensaje();
                                                }
                                            }}
                                            disabled={sendingMessage}
                                            className="max-h-40 min-h-[44px] flex-1 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
                                            placeholder="Escribe un mensaje... (Enter para enviar)"
                                        />
                                        <button
                                            onClick={enviarMensaje}
                                            disabled={!nuevoMensaje.trim() || sendingMessage}
                                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {sendingMessage ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Enviando...
                                                </div>
                                            ) : (
                                                "Enviar"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}