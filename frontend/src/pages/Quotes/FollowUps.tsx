import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import Historial from "./components/Historial";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

// ============================================================================
// TYPES
// ============================================================================

type MedioTransporte = "MARITIMO" | "TERRESTRE" | "AEREO";

type Pais = {
  id: string;
  nombre: string;
  codigo: string;
};

type TimelineConfig = {
  diasCotizadoADescuento?: number;
  diasDescuentoAComprado?: number;
  diasCompradoAPagado?: number;
  diasPagadoASeguimiento1?: number;
  diasSeguimiento1AFob?: number;
  diasFobABl?: number;
  diasBlASeguimiento2?: number;
  diasSeguimiento2ACif?: number;
  diasCifARecibido?: number;
};

type TimelineSKU = {
  id: string;
  sku: string;
  paisOrigen?: Pais;
  medioTransporte: MedioTransporte;
  diasTotalesEstimados: number;
  notas?: string;
} & TimelineConfig;

type Producto = {
  id: string;
  sku: string;
  descripcionProducto: string;
  cantidad: number;
  tipoUnidad: string;
  notas?: string;
  preciosId?: string;  // ← AGREGAR ESTA LÍNEA
  estadoProducto?: {
    id: string;
    aprobadoPorSupervisor: boolean;
    fechaAprobacion?: string;
    paisOrigen?: Pais;
    medioTransporte?: MedioTransporte;
    rechazado?: boolean;
    fechaRechazo?: string;
    motivoRechazo?: string;
  };
  timelineSugerido?: TimelineSKU;
  precios?: Precio[];
};

type Cotizacion = {
  id: string;
  nombreCotizacion: string;
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  estado: string;
  fechaSolicitud: string;
  fechaLimite: string;
  aprobadaParcialmente: boolean;
  todosProductosAprobados: boolean;
  solicitante: {
    id: string;
    nombre: string;
    email: string;
    departamento?: { nombre: string };
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
  chatId: string;
  totalProductos: number;
  productosAprobados: number;
  productosPendientes: number;
  porcentajeAprobado?: number;
  detalles?: Producto[];
  estadosProductos?: Array<{
    id: string;
    sku: string;
    aprobadoPorSupervisor: boolean;
    criticidad?: number;
    nivelCriticidad?: string;
  }>;
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
  adjuntos?: any[];
};

type HistorialCambio = {
  id: string;
  accion: string;
  detalles: any;
  creado: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
};
// Types para Precios
type Proveedor = {
  id: string;
  nombre: string;
  rtn?: string;
  email?: string;
  telefono?: string;
};

type Precio = {
  id: string;
  proveedorId: string;
  proveedor: Proveedor;
  seleccionado: boolean;
  precio: number;              // ← Campo principal
  precioDescuento?: number;    // ← Precio con descuento (opcional)
  ComprobanteDescuento?: string;
  creado: string;
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


const api = {
  // Cotizaciones
  async getCotizacionesPendientes(filters?: { estado?: string; search?: string; page?: number }) {
    const token = getToken();
    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/followups?${params}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return 0
    } else {
      return response.json();
    }
  },

  async getCotizacionDetalle(id: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${id}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar detalle");
    return response.json();
  },

  async configurarTimeline(cotizacionId: string, productos: any[]) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${cotizacionId}/configurar`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productos }),
    });
    if (!response.ok) throw new Error("Error al configurar timeline");
    return response.json();
  },

  async aprobarProductos(cotizacionId: string, productos: any[]) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${cotizacionId}/aprobar`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productos }),
    });
    if (!response.ok) throw new Error("Error al aprobar productos");
    return response.json();
  },

  async getHistorial(cotizacionId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${cotizacionId}/historial`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar historial");
    return response.json();
  },

  // Chat
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

  // Países y Timeline
  async getPaises() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/paises`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar países");
    return response.json();
  },

  async getTimelineSugerido(sku: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/timeline/${sku}/sugerencia`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    return response.json();
  },

  // Obtener proveedores activos
  async getProveedores() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/proveedores`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return 0;
    } else {
      return response.json();
    }
  },

  // Obtener precios de un detalle de cotización
  async getPreciosByDetalle(detalleId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/precios/detalle/${detalleId}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar precios");
    return response.json();
  },

  // Crear nuevo precio
  async createPrecio(data: {
    cotizacionDetalleId: string;
    proveedorId: string;
    precio: number;
    precioDescuento?: number;
    comprobanteDescuento?: string;
  }) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/precios`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear precio");
    return response.json();
  },

  // Marcar precio como seleccionado (cambio de método POST)
  async selectPrecio(precioId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/precios/${precioId}/select`, {
      method: "POST",  // ← Tu backend usa POST, no PATCH
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al seleccionar precio");
    return response.json();
  },

  // Eliminar precio
  async deletePrecio(precioId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/precios/${precioId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al eliminar precio");
    return response.json();
  },

  async rechazarProducto(cotizacionId: string, estadoProductoId: string, motivoRechazo: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/followups/${cotizacionId}/rechazar`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estadoProductoId, motivoRechazo }),
    });
    if (!response.ok) throw new Error("Error al rechazar producto");
    return response.json();
  },

};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FollowUps() {
  const { addNotification } = useNotifications();

  // Estados principales
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("TODOS");

  // Estados del chat
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoading } = useAuth();
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
  } else {
    useEffect
  }


  // Estados de configuración
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [productoConfigurando, setProductoConfigurando] = useState<Producto | null>(null);
  const [paises, setPaises] = useState<Pais[]>([]);

  // Estados de historial
  const [historial, setHistorial] = useState<HistorialCambio[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);

  // Vista activa en panel derecho
  const [vistaActiva, setVistaActiva] = useState<"detalle" | "chat" | "historial" | "precios">("detalle");

  //Estados para precios
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [preciosPorProducto, setPreciosPorProducto] = useState<Record<string, Precio[]>>({});
  const [showPrecioModal, setShowPrecioModal] = useState(false);
  const [productoParaPrecio, setProductoParaPrecio] = useState<Producto | null>(null);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const navigate = useNavigate();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cargar lista de cotizaciones
  useEffect(() => {
    cargarCotizaciones();
    cargarPaises();
    asignarUsuario();
  }, [estadoFiltro]);

  // Cargar mensajes cuando cambia la cotización seleccionada
  useEffect(() => {
    if (cotizacionSeleccionada?.chatId) {
      cargarMensajes(cotizacionSeleccionada.chatId);
    }
  }, [cotizacionSeleccionada]);

  // Auto-scroll en chat
  useEffect(() => {
    if (vistaActiva === "chat") {
      scrollToBottom();
    }
  }, [mensajes, vistaActiva]);
  useEffect(() => {
    cargarProveedores();
  }, []);

  // Cargar precios cuando cambia la cotización seleccionada
  useEffect(() => {
    if (cotizacionSeleccionada && vistaActiva === "precios") {
      cargarTodosLosPrecios();
    }
  }, [cotizacionSeleccionada, vistaActiva]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const asignarUsuario = async () => {
    setCurrentUserId(user.id);
  }
  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (estadoFiltro !== "TODOS") {
        filters.estado = estadoFiltro;
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      const data = await api.getCotizacionesPendientes(filters);
      if (data === 0) {
        navigate('/quotes/new');
        return;
      }
      setCotizaciones(data.items || []);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
      addNotification("danger", "Error al cargar cotizaciones", "Error");
    } finally {
      setLoading(false);
    }
  };


  const cargarPaises = async () => {
    try {
      const data = await api.getPaises();
      setPaises(data || []);
    } catch (error) {
      console.error("Error al cargar países:", error);
    }
  };

  const seleccionarCotizacion = async (cotizacion: Cotizacion) => {
    try {
      setLoadingDetalle(true);
      const detalle = await api.getCotizacionDetalle(cotizacion.id);
      setCotizacionSeleccionada(detalle);
      setVistaActiva("detalle");
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      addNotification("danger", "Error al cargar detalle de cotización", "Error");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // En la función cargarMensajes de FollowUps.tsx
  const cargarMensajes = async (chatId: string) => {
    if (!chatId) return;

    try {
      setLoadingChat(true);
      const data = await api.getChatMessages(chatId);

      // CORRECCIÓN: Ordenar por fecha ascendente (más antiguos primero)
      const mensajesOrdenados = (data.items || data || []).sort((a: any, b: any) => {
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
    if (!nuevoMensaje.trim() || !cotizacionSeleccionada?.chatId) return;

    try {
      setSendingMessage(true);
      await api.sendMessage(cotizacionSeleccionada.chatId, nuevoMensaje);
      setNuevoMensaje("");
      await cargarMensajes(cotizacionSeleccionada.chatId);
      addNotification("success", "Mensaje enviado", "Mensaje enviado exitosamente");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      addNotification("danger", "Error al enviar mensaje", "Error");
    } finally {
      setSendingMessage(false);
    }
  };

  const configurarProducto = (producto: Producto) => {
    setProductoConfigurando(producto);
    setShowTimelineModal(true);
  };

  const guardarConfiguracion = async (config: any) => {
    if (!cotizacionSeleccionada || !productoConfigurando) return;


    try {
      if (cotizacionSeleccionada.tipoCompra === 'NACIONAL') {

        await api.configurarTimeline(cotizacionSeleccionada.id, [
          {
            sku: productoConfigurando.sku,
            paisOrigenId: '53b360e4-f5fe-4f27-beba-90bc79390f07',
            medioTransporte: config.medioTransporte,
            timeline: config.timeline,
            notas: config.notas,
          },
        ]);

      } else {

        await api.configurarTimeline(cotizacionSeleccionada.id, [
          {
            sku: productoConfigurando.sku,
            paisOrigenId: config.paisOrigenId,
            medioTransporte: config.medioTransporte,
            timeline: config.timeline,
            notas: config.notas,
          },
        ]);
      }


      addNotification("success", "Timeline configurado exitosamente", "Timeline configurado exitosamente");
      setShowTimelineModal(false);

      // Recargar detalle
      await seleccionarCotizacion(cotizacionSeleccionada);
    } catch (error) {
      console.error("Error al configurar timeline:", error);
      addNotification("danger", "Error al configurar timeline", "Error al configurar timeline");
    }
  };

  const toggleAprobarProducto = async (estadoProductoId: string, aprobar: boolean) => {
    if (!cotizacionSeleccionada) return;

    try {
      await api.aprobarProductos(cotizacionSeleccionada.id, [
        { estadoProductoId, aprobado: aprobar },
      ]);

      addNotification("success",
        aprobar ? "Producto aprobado" : "Aprobación removida",
        "success"
      );

      // Recargar detalle
      await seleccionarCotizacion(cotizacionSeleccionada);

      // Recargar lista
      await cargarCotizaciones();
    } catch (error) {
      console.error("Error al aprobar producto:", error);
      addNotification("danger", "Error al actualizar aprobación", "Error al actualizar aprobación");
    }
  };

  const cargarHistorial = async () => {
    if (!cotizacionSeleccionada) return;

    try {
      const data = await api.getHistorial(cotizacionSeleccionada.id);
      setHistorial(data || []);
      setShowHistorial(true);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      addNotification("danger", "Error al cargar historial", "Error al cargar historial");
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadgeColor = (estado: string) => {
    const colores: Record<string, string> = {
      PENDIENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      EN_CONFIGURACION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      APROBADA_PARCIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      APROBADA_COMPLETA: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return colores[estado] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      PENDIENTE: "Pendiente",
      EN_CONFIGURACION: "En Configuración",
      APROBADA_PARCIAL: "Aprobada Parcial",
      APROBADA_COMPLETA: "Aprobada Completa",
    };
    return labels[estado] || estado;
  };

  const filteredCotizaciones = cotizaciones.filter((cot) => {
    const matchesSearch =
      cot.nombreCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cot.solicitante.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });


  const cargarProveedores = async () => {
    try {
      const data = await api.getProveedores();
      if (data === 0) {
        navigate('/quotes/new');
        toast.error('No cuentas con los permisos necesarios');
        return;
      }
      setProveedores(data || []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      addNotification("danger", "Error", "Error al cargar proveedores");
    }
  };

  const cargarPreciosProducto = async (detalleId: string) => {
    try {
      const data = await api.getPreciosByDetalle(detalleId);
      setPreciosPorProducto(prev => ({
        ...prev,
        [detalleId]: data || []
      }));
    } catch (error) {
      console.error("Error al cargar precios:", error);
    }
  };

  const cargarTodosLosPrecios = async () => {
    if (!cotizacionSeleccionada?.detalles) return;

    setLoadingPrecios(true);
    try {
      const preciosPromises = cotizacionSeleccionada.detalles.map(detalle =>
        api.getPreciosByDetalle(detalle.id)
      );
      const preciosArray = await Promise.all(preciosPromises);

      const preciosMap: Record<string, Precio[]> = {};
      cotizacionSeleccionada.detalles.forEach((detalle, index) => {
        preciosMap[detalle.id] = preciosArray[index] || [];
      });

      setPreciosPorProducto(preciosMap);
    } catch (error) {
      console.error("Error al cargar precios:", error);
      addNotification("danger", "Error", "Error al cargar precios");
    } finally {
      setLoadingPrecios(false);
    }
  };

  const abrirModalPrecio = (producto: Producto) => {
    setProductoParaPrecio(producto);
    setShowPrecioModal(true);
  };

  const agregarPrecio = async (data: {
    proveedorId: string;
    precio: number;
    precioDescuento?: number;
    comprobanteDescuento?: string;
  }) => {
    if (!productoParaPrecio) return;

    try {
      await api.createPrecio({
        cotizacionDetalleId: productoParaPrecio.id,
        proveedorId: data.proveedorId,
        precio: data.precio,
        precioDescuento: data.precioDescuento,
        comprobanteDescuento: data.comprobanteDescuento
      });

      addNotification("success", "Éxito", "Precio agregado correctamente");
      setShowPrecioModal(false);
      setProductoParaPrecio(null);

      // Recargar precios de este producto
      await cargarPreciosProducto(productoParaPrecio.id);
    } catch (error) {
      console.error("Error al agregar precio:", error);
      addNotification("danger", "Error", "Error al agregar precio");
    }
  };

  const seleccionarPrecio = async (precioId: string, detalleId: string) => {
    try {
      await api.selectPrecio(precioId);
      addNotification("success", "Éxito", "Precio seleccionado");
      await cargarPreciosProducto(detalleId);
    } catch (error) {
      console.error("Error al seleccionar precio:", error);
      addNotification("danger", "Error", "Error al seleccionar precio");
    }
  };

  const eliminarPrecio = async (precioId: string, detalleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este precio?")) return;

    try {
      await api.deletePrecio(precioId);
      addNotification("success", "Éxito", "Precio eliminado");
      await cargarPreciosProducto(detalleId);
    } catch (error) {
      console.error("Error al eliminar precio:", error);
      addNotification("danger", "Error", "Error al eliminar precio");
    }
  };

  const tienePrecioSeleccionado = (detalleId: string): boolean => {
    // Verificar si el detalle tiene un preciosId asignado
    if (!cotizacionSeleccionada?.detalles) return false;

    const detalle = cotizacionSeleccionada.detalles.find(d => d.id === detalleId);
    return detalle?.preciosId != null;
  };

  // Modificar la función toggleAprobarProducto para validar precios
  const toggleAprobarProductoConValidacion = async (estadoProductoId: string, aprobar: boolean) => {
    if (aprobar && cotizacionSeleccionada?.detalles) {
      // Encontrar el estado producto para obtener el SKU
      const estadoProd = cotizacionSeleccionada.estadosProductos?.find(
        (ep: any) => ep.id === estadoProductoId
      );

      if (estadoProd) {
        // Encontrar el detalle correspondiente por SKU
        const detalle = cotizacionSeleccionada.detalles.find(
          d => d.sku === estadoProd.sku
        );

        if (detalle && !tienePrecioSeleccionado(detalle.id)) {
          addNotification("warn", "Advertencia", "Debes seleccionar un precio antes de aprobar");
          return;
        }
      }
    }

    // Llamar a la función original
    await toggleAprobarProducto(estadoProductoId, aprobar);
  };

  // ============================================================================
  // COMPONENTE: Modal para Agregar Precio
  // AGREGAR ANTES DEL RETURN PRINCIPAL DEL COMPONENTE
  // ============================================================================

  const ModalAgregarPrecio = () => {
    const [formData, setFormData] = useState({
      proveedorId: "",
      precio: "",                    // ← Campo principal
      precioDescuento: "",           // ← Precio con descuento
      comprobanteDescuento: ""       // ← Comprobante del descuento
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.proveedorId || !formData.precio) {
        addNotification("warn", "Advertencia", "Completa los campos requeridos");
        return;
      }

      agregarPrecio({
        proveedorId: formData.proveedorId,
        precio: parseFloat(formData.precio),
        precioDescuento: formData.precioDescuento ? parseFloat(formData.precioDescuento) : undefined,
        comprobanteDescuento: formData.comprobanteDescuento || undefined
      });
    };

    if (!showPrecioModal || !productoParaPrecio) return null;

    return (
      <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 pb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Agregar Precio
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {productoParaPrecio.descripcionProducto}
              </p>
            </div>
            <button
              onClick={() => {
                setShowPrecioModal(false);
                setProductoParaPrecio(null);
              }}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Proveedor */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} {prov.rtn ? `(RTN: ${prov.rtn})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio Normal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="0.00"
              />
            </div>

            {/* Precio con Descuento (Opcional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio con Descuento (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precioDescuento}
                onChange={(e) => setFormData({ ...formData, precioDescuento: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Si aplica un descuento, ingrese el precio final después del descuento
              </p>
            </div>

            {/* Comprobante de Descuento */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comprobante de Descuento
              </label>
              <input
                type="text"
                value={formData.comprobanteDescuento}
                onChange={(e) => setFormData({ ...formData, comprobanteDescuento: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Número de factura, orden, etc."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPrecioModal(false);
                  setProductoParaPrecio(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Agregar Precio
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <PageMeta description="Seguimiento de cotizaciones" title="Seguimiento de Cotizaciones" />

      <div className="flex h-[calc(100vh-4rem)] gap-4">
        {/* ========================================
            PANEL IZQUIERDO - LISTA DE COTIZACIONES
        ======================================== */}
        <div className="w-96 flex flex-col gap-4">
          {/* Header */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Seguimientos
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Cotizaciones pendientes de aprobación
            </p>
          </div>

          {/* Filtros */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            {/* Buscador */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && cargarCotizaciones()}
                placeholder="Buscar cotización o solicitante..."
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filtro por estado */}
            <div className="flex gap-2">
              {["TODOS", "PENDIENTE", "EN_CONFIGURACION", "APROBADA_PARCIAL"].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setEstadoFiltro(estado)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${estadoFiltro === estado
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                  {estado === "TODOS" ? "Todos" : getEstadoLabel(estado).split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de cotizaciones */}
          <div className="flex-1 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : filteredCotizaciones.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <svg
                  className="mb-4 h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  No hay cotizaciones {estadoFiltro !== "TODOS" && "con este estado"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCotizaciones.map((cot) => (
                  <button
                    key={cot.id}
                    onClick={() => seleccionarCotizacion(cot)}
                    className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${cotizacionSeleccionada?.id === cot.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                      }`}
                  >
                    {/* Estado y progreso */}
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getEstadoBadgeColor(
                          cot.estado
                        )}`}
                      >
                        {getEstadoLabel(cot.estado)}
                      </span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {cot.porcentajeAprobado || 0}%
                      </span>
                    </div>

                    {/* Nombre */}
                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                      {cot.nombreCotizacion}
                    </h3>

                    {/* Solicitante */}
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {cot.solicitante.nombre}
                      {cot.solicitante.departamento && (
                        <span className="text-gray-500"> • {cot.solicitante.departamento.nombre}</span>
                      )}
                    </p>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        {cot.totalProductos} productos
                      </span>
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {cot.productosAprobados} aprobados
                      </span>
                    </div>

                    {/* Progreso visual */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
                        style={{ width: `${cot.porcentajeAprobado || 0}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* ========================================
            PANEL DERECHO - DETALLE / CHAT / HISTORIAL
        ======================================== */}
        <div className="flex-1 flex flex-col gap-4">
          {cotizacionSeleccionada ? (
            <>
              {/* Header con información general */}
              <div className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cotizacionSeleccionada.nombreCotizacion}
                    </h2>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {cotizacionSeleccionada.solicitante.nombre}
                      </span>
                      {cotizacionSeleccionada.proyecto && (
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {cotizacionSeleccionada.proyecto.nombre}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Límite: {formatFecha(cotizacionSeleccionada.fechaLimite)}
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${getEstadoBadgeColor(cotizacionSeleccionada.estado)}`}>
                    {getEstadoLabel(cotizacionSeleccionada.estado)}
                  </span>
                </div>

                {/* Progreso */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Progreso de aprobación
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cotizacionSeleccionada.productosAprobados} / {cotizacionSeleccionada.totalProductos}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all dark:from-blue-600 dark:to-blue-700"
                        style={{ width: `${cotizacionSeleccionada.porcentajeAprobado || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cotizacionSeleccionada.porcentajeAprobado || 0}%
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="rounded-lg border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setVistaActiva("detalle")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${vistaActiva === "detalle"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                  >
                    📋 Detalle de Productos
                  </button>
                  <button
                    onClick={() => setVistaActiva("chat")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${vistaActiva === "chat"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => {
                      setVistaActiva("historial");
                      if (!showHistorial) cargarHistorial();
                    }}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${vistaActiva === "historial"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                  >
                    📜 Historial
                  </button>
                  <button
                    onClick={() => setVistaActiva("precios")}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${vistaActiva === "precios"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                  >
                    💰 Precios
                  </button>
                </div>

                {/* Contenido según tab activo */}
                <div className="p-6">
                  {loadingDetalle ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {/* TAB 1: DETALLE DE PRODUCTOS */}
                      {vistaActiva === "detalle" && (
                        <div className="space-y-4">
                          {cotizacionSeleccionada.detalles && cotizacionSeleccionada.detalles.length > 0 ? (
                            <>
                              {/* Tabla de productos */}
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                      <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Producto
                                      </th>
                                      <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Cantidad
                                      </th>
                                      <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        País / Transporte
                                      </th>
                                      <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Timeline
                                      </th>
                                      <th className="pb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Aprobado
                                      </th>
                                      <th className="pb-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Acciones
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {cotizacionSeleccionada.detalles.map((producto) => (
                                      <tr key={producto.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        {/* Producto */}
                                        <td className="py-4">
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            {producto.descripcionProducto}
                                          </div>

                                        </td>

                                        {/* Cantidad */}
                                        <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                                          {producto.cantidad} {producto.tipoUnidad.toLowerCase()}
                                        </td>

                                        {/* País / Transporte */}
                                        <td className="py-4">
                                          {producto.estadoProducto?.paisOrigen ? (
                                            <div className="text-sm">
                                              <div className="font-medium text-gray-900 dark:text-white">
                                                {producto.estadoProducto.paisOrigen.nombre}
                                              </div>
                                              <div className="text-gray-600 dark:text-gray-400">
                                                {producto.estadoProducto.medioTransporte === "MARITIMO" && "🚢 Marítimo"}
                                                {producto.estadoProducto.medioTransporte === "TERRESTRE" && "🚚 Terrestre"}
                                                {producto.estadoProducto.medioTransporte === "AEREO" && "✈️ Aéreo"}
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">
                                              No configurado
                                            </span>
                                          )}
                                        </td>

                                        {/* Timeline */}
                                        <td className="py-4 text-sm">
                                          {producto.timelineSugerido ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              {producto.timelineSugerido.diasTotalesEstimados} días
                                            </span>
                                          ) : (
                                            <span className="text-gray-400 dark:text-gray-500">
                                              Sin timeline
                                            </span>
                                          )}
                                        </td>

                                        {/* Aprobado */}
                                        <td className="py-4 text-center">
                                          {producto.estadoProducto ? (
                                            <input
                                              type="checkbox"
                                              checked={producto.estadoProducto.aprobadoPorSupervisor}
                                              onChange={(e) =>
                                                toggleAprobarProductoConValidacion(
                                                  producto.estadoProducto!.id,
                                                  e.target.checked
                                                )
                                              }
                                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                            />
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="py-4 text-right">
                                          <button
                                            onClick={() => configurarProducto(producto)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                          >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Configurar
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Botón aprobar todos */}
                              {cotizacionSeleccionada.productosPendientes > 0 && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      // Aprobar todos los productos pendientes
                                      const pendientes = cotizacionSeleccionada.detalles!
                                        .filter(p => p.estadoProducto && !p.estadoProducto.aprobadoPorSupervisor)
                                        .map(p => ({ estadoProductoId: p.estadoProducto!.id, aprobado: true }));

                                      if (pendientes.length > 0) {
                                        api.aprobarProductos(cotizacionSeleccionada.id, pendientes)
                                          .then(() => {
                                            addNotification("success", "Todos los productos aprobados", "Todos los productos han sido aprobados exitosamente");
                                            seleccionarCotizacion(cotizacionSeleccionada);
                                            cargarCotizaciones();
                                          })
                                          .catch(() => addNotification("danger", "Error al aprobar productos", "Error al aprobar productos"));
                                      }
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                  >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Aprobar Todos ({cotizacionSeleccionada.productosPendientes})
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex h-64 flex-col items-center justify-center text-center">
                              <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-gray-600 dark:text-gray-400">
                                No hay productos en esta cotización
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {/* TAB 2: CHAT */}
                      {vistaActiva === "chat" && (
                        <div className="flex h-[350px] flex-col">
                          {/* Mensajes */}
                          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {loadingChat ? (
                              <div className="flex h-full items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                              </div>
                            ) : mensajes.length === 0 ? (
                              <div className="flex h-full flex-col items-center justify-center text-center">
                                <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                  No hay mensajes. ¡Sé el primero en escribir!
                                </p>
                              </div>
                            ) : (
                              <>
                                {mensajes.map((mensaje) => {
                                  const esPropio = mensaje.emisor.id === currentUserId;
                                  return (
                                    <div
                                      key={mensaje.id}
                                      className={`flex ${esPropio ? "justify-end" : "justify-start"}`}
                                    >
                                      <div className={`max-w-[70%] ${esPropio ? "items-end" : "items-start"} flex flex-col`}>
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
                                          <p className="text-sm whitespace-pre-wrap break-words">
                                            {mensaje.contenido}
                                          </p>
                                        </div>

                                        {/* Fecha */}
                                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                          {formatFecha(mensaje.creado)}
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
                          <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <input
                              type="text"
                              value={nuevoMensaje}
                              onChange={(e) => setNuevoMensaje(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
                              placeholder="Escribe un mensaje..."
                              disabled={sendingMessage}
                              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                            />
                            <button
                              onClick={enviarMensaje}
                              disabled={!nuevoMensaje.trim() || sendingMessage}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                              {sendingMessage ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Enviar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Historial */}
                      {vistaActiva === "historial" && (
                        <Historial cambios={historial} />
                      )}
                      {vistaActiva === "precios" && (
                        <div className="space-y-4">
                          {loadingPrecios ? (
                            <div className="flex h-32 items-center justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                          ) : !cotizacionSeleccionada?.detalles || cotizacionSeleccionada.detalles.length === 0 ? (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                💰
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                No hay productos en esta cotización
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {cotizacionSeleccionada.detalles.map((producto) => {
                                const precios = preciosPorProducto[producto.id] || [];
                                const tienePrecio = precios.length > 0;
                                const precioSeleccionado = precios.find(p => p.seleccionado);

                                return (
                                  <div
                                    key={producto.id}
                                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                  >
                                    {/* Header del producto */}
                                    <div className="mb-4 flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {producto.sku}
                                          </h4>
                                          {!tienePrecio && (
                                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                              Sin precio
                                            </span>
                                          )}
                                          {tienePrecio && !precioSeleccionado && (
                                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                              Sin seleccionar
                                            </span>
                                          )}
                                          {precioSeleccionado && (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                              ✓ Precio seleccionado
                                            </span>
                                          )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                          {producto.descripcionProducto}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                          Cantidad: {producto.cantidad} {producto.tipoUnidad.toLowerCase()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => abrirModalPrecio(producto)}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                      >
                                        + Agregar Precio
                                      </button>
                                    </div>

                                    {/* Lista de precios */}
                                    {precios.length > 0 ? (
                                      <div className="space-y-2">
                                        {precios.map((precio) => (
                                          <div
                                            key={precio.id}
                                            className={`rounded-lg border p-3 transition-colors ${precio.seleccionado
                                              ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                                              : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                              }`}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex items-start gap-3 flex-1">
                                                {/* Radio button */}
                                                <input
                                                  type="radio"
                                                  name={`precio-${producto.id}`}
                                                  checked={precio.seleccionado}
                                                  onChange={() => seleccionarPrecio(precio.id, producto.id)}
                                                  className="mt-1 h-4 w-4 text-blue-600"
                                                />

                                                {/* Info del precio */}
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                      {precio.proveedor.nombre}
                                                    </span>
                                                    {precio.proveedor.rtn && (
                                                      <span className="text-xs text-gray-500">
                                                        RTN: {precio.proveedor.rtn}
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                                                    {/* Mostrar precio con descuento si existe, sino el precio normal */}
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                      L. {Number(precio.precioDescuento || precio.precio).toFixed(2)}
                                                    </span>

                                                    {/* Si hay descuento, mostrar el precio original tachado */}
                                                    {precio.precioDescuento && (
                                                      <span className="text-gray-500 line-through">
                                                        L. {Number(precio.precio).toFixed(2)}
                                                      </span>
                                                    )}
                                                  </div>

                                                  {precio.ComprobanteDescuento && (
                                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                      📄 Comprobante: {precio.ComprobanteDescuento}
                                                    </p>
                                                  )}

                                                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                                                    Agregado: {new Date(precio.creado).toLocaleDateString("es-HN")}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Botón eliminar */}
                                              <button
                                                onClick={() => eliminarPrecio(precio.id, producto.id)}
                                                className="ml-2 rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Eliminar precio"
                                              >
                                                X
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center dark:border-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                          No hay precios agregados. Agrega al menos uno para poder aprobar este producto.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AGREGAR ESTE COMPONENTE AL FINAL, ANTES DEL CIERRE DEL RETURN PRINCIPAL */}
                      <ModalAgregarPrecio />
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Estado vacío cuando no hay cotización seleccionada
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-center">
                <svg
                  className="mx-auto mb-4 h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Selecciona una cotización
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Haz clic en una cotización de la lista para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          MODAL DE CONFIGURACIÓN DE TIMELINE
      ======================================== */}
      {showTimelineModal && productoConfigurando && (
        <div className="fixed inset-0 z-9950 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Header del modal */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Configurar Timeline
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {productoConfigurando.descripcionProducto}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTimelineModal(false);
                    setProductoConfigurando(null);
                  }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <TimelineModalContent
              producto={productoConfigurando}
              paises={paises}
              tipoCompra={cotizacionSeleccionada?.tipoCompra || 'NACIONAL'}
              onSave={guardarConfiguracion}
              onCancel={() => {
                setShowTimelineModal(false);
                setProductoConfigurando(null);
              }}
              onReject={async (motivoRechazo) => {
                if (!cotizacionSeleccionada || !productoConfigurando?.estadoProducto?.id) return;

                try {
                  await api.rechazarProducto(
                    cotizacionSeleccionada.id,
                    productoConfigurando.estadoProducto.id,
                    motivoRechazo
                  );

                  addNotification("success", "Producto rechazado", "El solicitante será notificado");
                  setShowTimelineModal(false);
                  setProductoConfigurando(null);

                  // Recargar detalle
                  await seleccionarCotizacion(cotizacionSeleccionada);
                  await cargarCotizaciones();
                } catch (error) {
                  console.error("Error al rechazar producto:", error);
                  addNotification("danger", "Error al rechazar producto", "Intenta de nuevo");
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: MODAL CONTENT
// ============================================================================

function TimelineModalContent({
  producto,
  paises,
  tipoCompra,
  onSave,
  onCancel,
  onReject,
}: {
  producto: Producto;
  paises: Pais[];
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  onSave: (config: any) => void;
  onCancel: () => void;
  onReject: (motivoRechazo: string) => void;
}) {
  const esNacional = tipoCompra === 'NACIONAL';

  // Estados existentes
  const [paisOrigenId, setPaisOrigenId] = useState(
    producto.estadoProducto?.paisOrigen?.id || (esNacional ? '' : paises[0]?.id) || ""
  );
  const [medioTransporte, setMedioTransporte] = useState<MedioTransporte>(
    producto.estadoProducto?.medioTransporte || "TERRESTRE"
  );
  const [timeline, setTimeline] = useState<TimelineConfig>({
    diasCotizadoADescuento: producto.timelineSugerido?.diasCotizadoADescuento || 2,
    diasDescuentoAComprado: producto.timelineSugerido?.diasDescuentoAComprado || 3,
    diasCompradoAPagado: producto.timelineSugerido?.diasCompradoAPagado || 5,
    diasPagadoASeguimiento1: esNacional ? undefined : producto.timelineSugerido?.diasPagadoASeguimiento1,
    diasSeguimiento1AFob: esNacional ? undefined : producto.timelineSugerido?.diasSeguimiento1AFob,
    diasFobABl: esNacional ? undefined : producto.timelineSugerido?.diasFobABl,
    diasBlASeguimiento2: esNacional ? undefined : producto.timelineSugerido?.diasBlASeguimiento2,
    diasSeguimiento2ACif: esNacional ? undefined : producto.timelineSugerido?.diasSeguimiento2ACif,
    diasCifARecibido: esNacional
      ? (producto.timelineSugerido?.diasCifARecibido || 3)
      : (producto.timelineSugerido?.diasCifARecibido || 5),
  });
  const [notas, setNotas] = useState(producto.timelineSugerido?.notas || "");

  // NUEVOS ESTADOS para rechazo
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const diasTotales = Object.values(timeline).reduce((sum, dias) => sum + (dias || 0), 0);

  const procesosNacional = [
    { key: "diasCotizadoADescuento", label: "Cotizado → Con Descuento" },
    { key: "diasDescuentoAComprado", label: "Con Descuento → Comprado" },
    { key: "diasCompradoAPagado", label: "Comprado → Pagado" },
    { key: "diasCifARecibido", label: "Pagado → Recibido" },
  ];

  const procesosInternacional = [
    { key: "diasCotizadoADescuento", label: "Cotizado → Con Descuento" },
    { key: "diasDescuentoAComprado", label: "Con Descuento → Comprado" },
    { key: "diasCompradoAPagado", label: "Comprado → Pagado" },
    { key: "diasPagadoASeguimiento1", label: "Pagado → 1er Seguimiento" },
    { key: "diasSeguimiento1AFob", label: "1er Seg. → En FOB" },
    { key: "diasFobABl", label: "FOB → Con BL" },
    { key: "diasBlASeguimiento2", label: "BL → 2do Seguimiento" },
    { key: "diasSeguimiento2ACif", label: "2do Seg. → En CIF" },
    { key: "diasCifARecibido", label: "CIF → Recibido" },
  ];

  const procesos = esNacional ? procesosNacional : procesosInternacional;

  const handleSave = () => {
    if (!esNacional && !paisOrigenId) {
      alert("Selecciona un país de origen");
      return;
    }
    onSave({
      paisOrigenId: esNacional ? null : paisOrigenId,
      medioTransporte,
      timeline,
      notas,
      esNacional,
    });
  };

  const handleReject = () => {
    if (motivoRechazo.trim().length < 10) {
      alert("El motivo debe tener al menos 10 caracteres");
      return;
    }
    onReject(motivoRechazo.trim());
  };

  // Si está en modo rechazo, mostrar formulario de rechazo
  if (mostrarRechazo) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rechazar Producto
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {producto.sku} - {producto.descripcionProducto}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Al rechazar este producto, el solicitante será notificado y deberá corregir o justificar la solicitud antes de que pueda ser aprobada.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo del rechazo <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
              placeholder="Explica el motivo del rechazo (mínimo 10 caracteres)..."
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {motivoRechazo.length}/10 caracteres mínimos
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              onClick={() => {
                setMostrarRechazo(false);
                setMotivoRechazo("");
              }}
              className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Volver
            </button>
            <button
              onClick={handleReject}
              disabled={motivoRechazo.trim().length < 10}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista normal de configuración
  return (
    <div className="p-6">
      {/* Badge de tipo de compra */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${esNacional
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
          {esNacional ? '🏠 Compra Nacional' : '🌍 Compra Internacional'}
        </span>

        {/* Mostrar si está rechazado */}
        {producto.estadoProducto?.rechazado && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
            ⚠️ Rechazado
          </span>
        )}
      </div>

      {/* Mostrar motivo de rechazo previo si existe */}
      {producto.estadoProducto?.rechazado && producto.estadoProducto?.motivoRechazo && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-red-900 dark:text-red-300">
                Producto rechazado anteriormente
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {producto.estadoProducto.motivoRechazo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline sugerido */}
      {producto.timelineSugerido && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Timeline sugerido encontrado
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Este producto ya tiene una configuración previa. Los valores se han cargado automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* País y Transporte */}
        <div className={`grid gap-4 ${esNacional ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
          {!esNacional && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                País de Origen <span className="text-rose-500">*</span>
              </label>
              <select
                value={paisOrigenId}
                onChange={(e) => setPaisOrigenId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar país...</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.codigo} - {pais.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Medio de Transporte <span className="text-rose-500">*</span>
            </label>
            <select
              value={medioTransporte}
              onChange={(e) => setMedioTransporte(e.target.value as MedioTransporte)}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {esNacional ? (
                <option value="TERRESTRE">🚚 Terrestre</option>
              ) : (
                <>
                  <option value="MARITIMO">🚢 Marítimo</option>
                  <option value="TERRESTRE">🚚 Terrestre</option>
                  <option value="AEREO">✈️ Aéreo</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Timeline de días */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Días por Proceso {esNacional && <span className="text-sm font-normal text-gray-500">(Simplificado)</span>}
          </h4>
          <div className={`grid gap-3 ${esNacional ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {procesos.map((proceso) => (
              <div key={proceso.key}>
                <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                  {proceso.label}
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeline[proceso.key as keyof TimelineConfig] || ""}
                  onChange={(e) =>
                    setTimeline({
                      ...timeline,
                      [proceso.key]: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Días"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total de días */}
        <div className={`rounded-lg p-4 ${esNacional
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
          }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">
              Total de días estimados:
            </span>
            <span className={`text-2xl font-bold ${esNacional ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
              {diasTotales} días
            </span>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notas / Observaciones
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Información adicional sobre este producto..."
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          {/* Botón Rechazar a la izquierda */}
          <button
            onClick={() => setMostrarRechazo(true)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rechazar
          </button>

          {/* Botones Cancelar y Guardar a la derecha */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${esNacional
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}