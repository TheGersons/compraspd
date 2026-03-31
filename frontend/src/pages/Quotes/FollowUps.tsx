import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import Historial from "./components/Historial";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DescuentoActions from "./components/DescuentoActions";

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
  diasDescuentoAAprobacionCompra?: number;    // ← NUEVO
  diasAprobacionCompraAComprado?: number;     // ← NUEVO
  diasDescuentoAComprado?: number;            // mantener compatibilidad
  diasCompradoAPagado?: number;
  diasPagadoAAprobacionPlanos?: number;       // ← NUEVO
  diasAprobacionPlanosASeguimiento1?: number; // ← NUEVO
  diasPagadoASeguimiento1?: number;           // mantener compatibilidad
  diasSeguimiento1AFob?: number;
  diasFobACotizacionFlete?: number;
  diasCotizacionFleteABl?: number;
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
  preciosId?: string;
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
  tipoMensaje: string;
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
  precio: number;
  precioDescuento?: number;
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

  // Eliminar cotización completa (Usamos el endpoint de quotations que agregaste en el controller)
  async deleteCotizacion(id: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al eliminar cotización");
    return response.json();
  },

  async getSupervisores() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/supervisores`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar supervisores");
    return response.json();
  },

  async asignarResponsableMasivo(ids: string[], responsableId: string | null) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos/asignar-responsable-masivo`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ids, responsableId }),
    });
    if (!response.ok) throw new Error("Error al asignar responsable");
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

  async sendMessageWithFile(chatId: string, file: File, contenido?: string) {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    if (contenido?.trim()) formData.append("contenido", contenido);
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${chatId}/upload`, {
      method: "POST",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const e = await response.json().catch(() => ({}));
      throw new Error(e.message || "Error al enviar archivo");
    }
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
  async deselectPrecio(precioId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/precios/${precioId}/deselect`, {
      method: "POST",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al deseleccionar precio");
    return response.json();
  },
  async downloadFile(params: {
    cotizacionId: string;
    sku: string;
    proveedor: string;
    filename: string;
    mode: 'inline' | 'attachment'
  }) {
    const token = getToken();
    // Construimos los Query Params para el GET
    const query = new URLSearchParams({
      cotizacionId: params.cotizacionId,
      sku: params.sku,
      proveedor: params.proveedor,
      tipo: 'comprobantes_descuento', // Ajusta si manejas otros tipos
      filename: params.filename,
      mode: params.mode
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/storage/download?${query.toString()}`, {
      method: 'GET',
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Error al descargar archivo");

    // Retornamos el Blob para que el frontend cree la URL temporal
    return response.blob();
  },

  async actualizarNombreCotizacion(id: string, nombreCotizacion: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ nombreCotizacion }),
    });
    if (!response.ok) throw new Error("Error al actualizar nombre");
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
  const [supervisores, setSupervisores] = useState<{ id: string; nombre: string }[]>([]);
  const [menuResponsableCot, setMenuResponsableCot] = useState(false);
  const [responsableCotAsignado, setResponsableCotAsignado] = useState<{ id: string; nombre: string } | null>(null);
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
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [sendingFile, setSendingFile] = useState(false);
  const [imagenModal, setImagenModal] = useState<{ src: string; nombre: string; downloadUrl: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [notasAbiertas, setNotasAbiertas] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const isComercial = user?.rol?.nombre?.toUpperCase() === 'COMERCIAL';
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

  // Editar nombre de cotización
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");

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
    api.getSupervisores().then(setSupervisores).catch(() => { });
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

  const deseleccionarPrecio = async (precioId: string, detalleId: string) => {
    try {
      await api.deselectPrecio(precioId);
      addNotification("success", "Éxito", "Precio deseleccionado");
      await cargarPreciosProducto(detalleId);
    } catch (error) {
      console.error("Error al deseleccionar precio:", error);
      addNotification("danger", "Error", "Error al deseleccionar precio");
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
      // Detectar responsable actual del primer producto
      const primerEstado = detalle.estadosProductos?.[0];
      if (primerEstado?.responsableSeguimiento) {
        setResponsableCotAsignado({ id: primerEstado.responsableSeguimiento.id, nombre: primerEstado.responsableSeguimiento.nombre });
      } else {
        setResponsableCotAsignado(null);
      }
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      addNotification("danger", "Error al cargar detalle de cotización", "Error");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Función para eliminar cotización
  const eliminarCotizacionActual = async () => {
    if (!cotizacionSeleccionada) return;

    if (!confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR esta cotización?\n\nEsta acción borrará todos los productos, mensajes y configuraciones asociados. No se puede deshacer.")) {
      return;
    }

    try {
      setLoadingDetalle(true);
      await api.deleteCotizacion(cotizacionSeleccionada.id);

      addNotification("success", "Cotización eliminada", "La cotización ha sido eliminada correctamente");
      setCotizacionSeleccionada(null);
      await cargarCotizaciones();

    } catch (error) {
      console.error("Error al eliminar:", error);
      addNotification("danger", "Error", "No se pudo eliminar la cotización");
    } finally {
      setLoadingDetalle(false);
    }
  };

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

  const enviarArchivo = async (file: File) => {
    if (!file || !cotizacionSeleccionada?.chatId) return;
    try {
      setSendingFile(true);
      await api.sendMessageWithFile(cotizacionSeleccionada.chatId, file);
      await cargarMensajes(cotizacionSeleccionada.chatId);
      addNotification("success", "Archivo enviado", file.name);
    } catch (error: any) {
      console.error("Error al enviar archivo:", error);
      addNotification("danger", "Error", error.message || "Error al enviar archivo");
    } finally {
      setSendingFile(false);
      if (chatFileRef.current) chatFileRef.current.value = "";
    }
  };

  const handleAsignarResponsableCotizacion = async (responsableId: string | null) => {
    if (!cotizacionSeleccionada?.estadosProductos) return;
    const ids = cotizacionSeleccionada.estadosProductos.map((ep: any) => ep.id);
    if (ids.length === 0) {
      addNotification("warn", "Sin productos", "No hay productos para asignar");
      return;
    }
    try {
      await api.asignarResponsableMasivo(ids, responsableId);
      const sup = responsableId ? supervisores.find(s => s.id === responsableId) || null : null;
      setResponsableCotAsignado(sup ? { id: sup.id, nombre: sup.nombre } : null);
      addNotification("success", "Éxito", responsableId ? `Responsable asignado a ${ids.length} productos` : `Responsable removido de ${ids.length} productos`);
      setMenuResponsableCot(false);
    } catch (e: any) {
      addNotification("danger", "Error", e.message);
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
      throw error;
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
      console.error("Error al aprobar producto:", error.message);

      if (error.message === "Error al aprobar productos") {
        addNotification("danger", "Faltan datos por confirmar", "Confirmar precio final, con descuento o sin descuento");
      } else {
        addNotification("danger", "Error al actualizar aprobación", error.message);
      }
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
      setProveedores(data.items || data || []);
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
        [detalleId]: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error("Error al cargar precios:", error);
      // No limpiar los precios existentes en caso de error
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
      // Recargar cotización para actualizar preciosId y aprobadoPorSupervisor
      if (cotizacionSeleccionada) {
        const detalle = await api.getCotizacionDetalle(cotizacionSeleccionada.id);
        setCotizacionSeleccionada(detalle);
      }
    } catch (error) {
      console.error("Error al seleccionar precio:", error.message);

      //Verificar si es por el estado que se encuentra como enviada en lugar de 'EN_CONFIGURACION'
      if (error.message === "Error al seleccionar precio") {
        addNotification("danger", "Error", "Configurar primero los dias de entrega de la cotización");
        toast.error("Configurar primero los dias de entrega de la cotización");
      } else {
        addNotification("danger", "Error", "Error al seleccionar precio");
      }
    }
  };

  const eliminarPrecio = async (precioId: string, detalleId: string) => {
    if (!confirm("¿Estás seguro de eliminar este precio?")) return;

    try {
      await api.deletePrecio(precioId);
      addNotification("success", "Éxito", "Precio eliminado");
      await cargarPreciosProducto(detalleId);
      // Recargar cotización para actualizar preciosId
      if (cotizacionSeleccionada) {
        const detalle = await api.getCotizacionDetalle(cotizacionSeleccionada.id);
        setCotizacionSeleccionada(detalle);
      }
    } catch (error) {
      console.error("Error al eliminar precio:", error);
      addNotification("danger", "Error", "Error al eliminar precio");
    }
  };

  const tienePrecioSeleccionado = (detalleId: string): boolean => {
    // Verificar en los precios cargados (fuente más reciente)
    const precios = preciosPorProducto[detalleId];
    if (precios && precios.some(p => p.seleccionado)) return true;
    if (!cotizacionSeleccionada?.detalles) return false;
    // Fallback: verificar en la cotización
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

  const manejarArchivo = async (precio: Precio, sku: string, mode: 'inline' | 'attachment') => {
    if (!precio.ComprobanteDescuento) return;

    // CASO 1: Es un Link Público de Nextcloud (Lo que tienes en tu BD)
    if (precio.ComprobanteDescuento.startsWith('http')) {
      let url = precio.ComprobanteDescuento;

      // Truco Nextcloud: Si queremos forzar descarga, agregamos "/download" al final
      if (mode === 'attachment' && !url.endsWith('/download')) {
        url = `${url.replace(/\/$/, '')}/download`;
      }

      window.open(url, '_blank');
      return; // ¡Listo! No molestamos al backend
    }

    // CASO 2: Es solo un nombre de archivo (Fallback al Backend Proxy)
    // Esto se ejecuta solo si en la BD se guardó "archivo.pdf" en vez del link
    if (!cotizacionSeleccionada) return;

    const toastId = toast.loading(mode === 'inline' ? "Buscando archivo..." : "Descargando...");

    try {
      const blob = await api.downloadFile({
        cotizacionId: cotizacionSeleccionada.id,
        sku: sku,
        proveedor: precio.proveedor.nombre,
        filename: precio.ComprobanteDescuento,
        mode: mode
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      if (mode === 'attachment') {
        link.download = precio.ComprobanteDescuento;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank');
      }
      // 1. Agregar refs
      const mountedRef = useRef(true);
      const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

      // 2. Cleanup en useEffect
      useEffect(() => {
        mountedRef.current = true;
        return () => {
          mountedRef.current = false;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
      }, []);

      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.dismiss(toastId);

    } catch (error) {
      console.error(error);
      toast.error("No se pudo obtener el archivo", { id: toastId });
    }
  };

  // ============================================================================
  // COMPONENTE: Modal para Agregar Precio
  // AGREGAR ANTES DEL RETURN PRINCIPAL DEL COMPONENTE
  // ============================================================================
  const ModalAgregarPrecio = () => {
    const [formData, setFormData] = useState({
      proveedorId: "",
      precio: "",
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
      });
    };

    if (!showPrecioModal || !productoParaPrecio) return null;

    return (
      <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Agregar Precio</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{productoParaPrecio.descripcionProducto}</p>
            </div>
            <button onClick={() => { setShowPrecioModal(false); setProductoParaPrecio(null); }}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select required value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Seleccionar proveedor</option>
                {(Array.isArray(proveedores) ? proveedores : []).map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre} {prov.rtn ? `(RTN: ${prov.rtn})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio <span className="text-red-500">*</span>
              </label>
              <input type="number" step="0.01" min="0" required value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="0.00" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowPrecioModal(false); setProductoParaPrecio(null); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Agregar Precio</button>
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

      <div className="max-w-full">
        <div className="flex w-full h-[calc(100vh-4rem)] gap-4">
          {/* ========================================
            PANEL IZQUIERDO - LISTA DE COTIZACIONES
        ======================================== */}
          <div className="flex flex-col gap-4">
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
                      {editandoNombre ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && nombreEditado.trim()) {
                                try {
                                  await api.actualizarNombreCotizacion(cotizacionSeleccionada.id, nombreEditado.trim());
                                  setCotizacionSeleccionada({ ...cotizacionSeleccionada, nombreCotizacion: nombreEditado.trim() });
                                  setCotizaciones(prev => prev.map(c => c.id === cotizacionSeleccionada.id ? { ...c, nombreCotizacion: nombreEditado.trim() } : c));
                                  setEditandoNombre(false);
                                  toast.success("Nombre actualizado");
                                } catch { toast.error("Error al actualizar"); }
                              }
                              if (e.key === 'Escape') setEditandoNombre(false);
                            }}
                            autoFocus
                            className="text-2xl font-bold border-b-2 border-blue-500 bg-transparent text-gray-900 dark:text-white outline-none"
                          />
                          <button onClick={() => setEditandoNombre(false)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                        </div>
                      ) : (
                        <h2 className={`text-2xl font-bold text-gray-900 dark:text-white transition-colors ${!isComercial ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                          onClick={!isComercial ? () => { setNombreEditado(cotizacionSeleccionada.nombreCotizacion); setEditandoNombre(true); } : undefined}
                          title={!isComercial ? "Click para editar nombre" : undefined}
                        >
                          {cotizacionSeleccionada.nombreCotizacion}
                          {!isComercial && <span className="ml-2 text-xs text-gray-400">✏️</span>}
                        </h2>
                      )}
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

                    {/* ACCIONES DEL HEADER: Estado y Botón Eliminar */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${getEstadoBadgeColor(cotizacionSeleccionada.estado)}`}>
                        {getEstadoLabel(cotizacionSeleccionada.estado)}
                      </span>

                      {/* Botón de eliminar cotización */}
                      <button
                        onClick={eliminarCotizacionActual}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Eliminar cotización permanentemente"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>

                      {/* Asignar responsable de seguimiento */}
                      <div className="relative">
                        {!isComercial && (
                          <>
                          <button
                            onClick={() => setMenuResponsableCot(!menuResponsableCot)}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${responsableCotAsignado
                              ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                              : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              }`}
                            title="Asignar responsable de seguimiento a todos los productos"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {responsableCotAsignado ? responsableCotAsignado.nombre : "Asignar Responsable"}
                          </button>
                          {menuResponsableCot && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                              <div className="p-1.5">
                                <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Asignar a todos los productos:</p>
                                {supervisores.map(sup => (
                                  <button key={sup.id}
                                    onClick={() => handleAsignarResponsableCotizacion(sup.id)}
                                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors ${responsableCotAsignado?.id === sup.id
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                      }`}>
                                    {sup.nombre} {responsableCotAsignado?.id === sup.id && "✓"}
                                  </button>
                                ))}
                                {responsableCotAsignado && (
                                  <>
                                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                    <button
                                      onClick={() => handleAsignarResponsableCotizacion(null)}
                                      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                      Quitar responsable de todos
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          </>
                        )}
                      </div>
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
                            {/* Comentarios generales de la cotización */}
                            {(cotizacionSeleccionada as any).comentarios && (
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">💬 Comentarios de la solicitud:</p>
                                <p className="text-sm text-amber-800 dark:text-amber-300">{(cotizacionSeleccionada as any).comentarios}</p>
                              </div>
                            )}
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
                                      {cotizacionSeleccionada.detalles
                                        // 🔴 FILTRO: Ocultar rechazados
                                        .filter(p => !p.estadoProducto?.rechazado)
                                        .map((producto) => (
                                          <tr key={producto.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            {/* Producto */}
                                            <td className="py-4">
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                  {producto.descripcionProducto}
                                                </span>
                                                {producto.notas && (
                                                  <div className="relative">
                                                    <button onClick={() => setNotasAbiertas(notasAbiertas === producto.id ? null : producto.id)}
                                                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 text-sm" title="Ver notas">
                                                      📋
                                                    </button>
                                                    {notasAbiertas === producto.id && (
                                                      <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                                        <div className="flex justify-between items-center mb-1">
                                                          <p className="text-xs font-semibold text-gray-500 whitespace-pre-wrap break-words max-w-[300px]">Notas:</p>
                                                          <button onClick={() => setNotasAbiertas(null)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-w-[300px] break-words">{producto.notas}</p>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
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
                                              {!isComercial && (
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
                                              )}
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
                                        // 🔴 CORRECCIÓN: Filtrar rechazados para no aprobarlos
                                        const pendientes = cotizacionSeleccionada.detalles!
                                          .filter(p =>
                                            p.estadoProducto &&
                                            !p.estadoProducto.aprobadoPorSupervisor &&
                                            !p.estadoProducto.rechazado // <-- Validación crítica
                                          )
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
                                            {/* Adjuntos: preview de imagen o link de archivo */}
                                            {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                                              <div className="mb-2">
                                                {mensaje.adjuntos.map((adj: any) => {
                                                  const esImagen = adj.tipoArchivo?.startsWith('image/');
                                                  const nombre = adj.nombreArchivo || adj.direccionArchivo?.split('/').pop() || 'Archivo';
                                                  return (
                                                    <div key={adj.id}>
                                                      {esImagen && adj.previewUrl ? (
                                                        <div
                                                          className="cursor-pointer"
                                                          onClick={() => setImagenModal({ src: adj.direccionArchivo + '/download', nombre, downloadUrl: adj.direccionArchivo })}
                                                        >
                                                          <img
                                                            src={adj.previewUrl}
                                                            alt={nombre}
                                                            className="max-w-[280px] max-h-[200px] rounded-lg hover:opacity-90 transition-opacity"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                              (e.target as HTMLImageElement).style.display = 'none';
                                                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                          />
                                                          <div className="hidden mt-1">
                                                            <span className={`inline-flex items-center gap-1 text-xs underline ${esPropio ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                                                              📎 {nombre}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <a
                                                          href={adj.direccionArchivo}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${esPropio
                                                            ? 'border-blue-400 text-blue-100 hover:bg-blue-500'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                        >
                                                          <span className="text-base">
                                                            {adj.tipoArchivo?.includes('pdf') ? '📄' :
                                                              adj.tipoArchivo?.includes('sheet') || adj.tipoArchivo?.includes('excel') ? '📊' :
                                                                adj.tipoArchivo?.includes('word') || adj.tipoArchivo?.includes('document') ? '📝' :
                                                                  '📎'}
                                                          </span>
                                                          <span className="max-w-[180px] truncate">{nombre}</span>
                                                          <span className="text-[10px] opacity-70">{adj.tamanio ? `${(Number(adj.tamanio) / 1024).toFixed(0)}KB` : ''}</span>
                                                        </a>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                            {/* Texto del mensaje (no mostrar el "📎 filename" automático si hay adjuntos) */}
                                            {mensaje.contenido && !(mensaje.tipoMensaje === 'ARCHIVO' && mensaje.adjuntos?.length > 0 && mensaje.contenido.startsWith('📎')) && (
                                              <p className="text-sm whitespace-pre-wrap break-words max-w-[500px]">
                                                {mensaje.contenido}
                                              </p>
                                            )}
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
                              {/* Botón adjuntar archivo */}
                              <input
                                ref={chatFileRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) enviarArchivo(file);
                                }}
                                className="hidden"
                              />
                              <button
                                onClick={() => chatFileRef.current?.click()}
                                disabled={sendingFile || sendingMessage}
                                className="rounded-lg border-2 border-gray-300 px-3 py-2 text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
                                title="Adjuntar archivo"
                              >
                                {sendingFile ? (
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                )}
                              </button>
                              <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
                                placeholder="Escribe un mensaje..."
                                disabled={sendingMessage || sendingFile}
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
                                {cotizacionSeleccionada.detalles
                                  // 🔴 FILTRO: Ocultar rechazados en lista de precios
                                  .filter(p => !p.estadoProducto?.rechazado)
                                  .map((producto) => {
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
                                            {precios.filter(p => p && p.proveedor).map((precio) => (
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
                                                          {precio.proveedor?.nombre || 'Sin proveedor'}
                                                        </span>
                                                        {precio.proveedor?.rtn && (
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
                                                        {precio.precioDescuento != null && Number(precio.precioDescuento) !== Number(precio.precio) && (
                                                          <span className="text-gray-500 line-through">
                                                            L. {Number(precio.precio).toFixed(2)}
                                                          </span>
                                                        )}
                                                      </div>

                                                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                                                        Agregado: {new Date(precio.creado).toLocaleDateString("es-HN")}
                                                      </p>

                                                      {/* Acciones de descuento */}
                                                      <DescuentoActions
                                                        precio={precio}
                                                        productoId={producto.id}
                                                        cotizacionId={cotizacionSeleccionada!.id}
                                                        sku={producto.sku}
                                                        onUpdate={() => cargarPreciosProducto(producto.id)}
                                                        onNotification={addNotification}

                                                      />
                                                    </div>
                                                  </div>

                                                  {/* Botones de acción */}
                                                  <div className="ml-2 flex items-center gap-1">
                                                    {/* Botones de Archivo (Solo si hay comprobante) */}
                                                    {precio.ComprobanteDescuento && (
                                                      <>
                                                        <button
                                                          onClick={() => manejarArchivo(precio, producto.sku, 'inline')}
                                                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                          title="Ver comprobante"
                                                        >
                                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                          </svg>
                                                        </button>

                                                        <button
                                                          onClick={() => manejarArchivo(precio, producto.sku, 'attachment')}
                                                          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                                          title="Descargar comprobante"
                                                        >
                                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                          </svg>
                                                        </button>

                                                        {/* Separador vertical pequeño */}
                                                        <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                                                      </>
                                                    )}

                                                    {/* Botones de Acción (Seleccionar/Eliminar) */}
                                                    {precio.seleccionado ? (
                                                      <button
                                                        onClick={() => deseleccionarPrecio(precio.id, producto.id)}
                                                        className="rounded-lg px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                        title="Deseleccionar precio"
                                                      >
                                                        Deseleccionar
                                                      </button>
                                                    ) : (
                                                      <button
                                                        onClick={() => eliminarPrecio(precio.id, producto.id)}
                                                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        title="Eliminar precio"
                                                      >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                      </button>
                                                    )}
                                                  </div>
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
                  // 🟢 CORRECCIÓN: Permitir rechazar si es productoConfigurando válido
                  if (!cotizacionSeleccionada || !productoConfigurando) return;

                  try {
                    // ID híbrido: Si tiene estado, usa estado.id; si no, usa producto.id
                    const idParaRechazar = productoConfigurando.estadoProducto?.id || productoConfigurando.id;

                    await api.rechazarProducto(
                      cotizacionSeleccionada.id,
                      idParaRechazar,
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
      </div>

      {/* Modal de imagen ampliada */}
      {imagenModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagenModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botones superiores */}
            <div className="absolute -top-10 right-0 flex items-center gap-2">
              <a
                href={imagenModal.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </a>
              <button
                onClick={() => setImagenModal(null)}
                className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600 transition-colors"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Imagen */}
            <img
              src={imagenModal.src}
              alt={imagenModal.nombre}
              className="max-h-[85vh] w-auto h-auto min-w-[50vw] rounded-lg object-contain shadow-2xl"
            />

            {/* Nombre del archivo */}
            <p className="mt-2 text-sm text-gray-300">{imagenModal.nombre}</p>
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
  onSave: (config: any) => Promise<void> | void; // 🟢 Promise support
  onCancel: () => void;
  onReject: (motivoRechazo: string) => Promise<void> | void; // 🟢 Promise support
}) {

  // 🟢 ESTADO DE CARGA
  const [loading, setLoading] = useState(false);

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
    diasDescuentoAAprobacionCompra: producto.timelineSugerido?.diasDescuentoAAprobacionCompra || 2,         // ← NUEVO
    diasAprobacionCompraAComprado: producto.timelineSugerido?.diasAprobacionCompraAComprado || 1,           // ← NUEVO
    diasCompradoAPagado: producto.timelineSugerido?.diasCompradoAPagado || 5,
    diasPagadoAAprobacionPlanos: esNacional ? undefined : (producto.timelineSugerido?.diasPagadoAAprobacionPlanos || 3),     // ← NUEVO
    diasAprobacionPlanosASeguimiento1: esNacional ? undefined : (producto.timelineSugerido?.diasAprobacionPlanosASeguimiento1 || 2), // ← NUEVO
    diasSeguimiento1AFob: esNacional ? undefined : producto.timelineSugerido?.diasSeguimiento1AFob,
    diasFobACotizacionFlete: esNacional ? undefined : (producto.timelineSugerido?.diasFobACotizacionFlete || 3),
    diasCotizacionFleteABl: esNacional ? undefined : (producto.timelineSugerido?.diasCotizacionFleteABl || 2),
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
    { key: "diasDescuentoAAprobacionCompra", label: "Con Descuento → Aprob. Compra" },    // ← NUEVO
    { key: "diasAprobacionCompraAComprado", label: "Aprob. Compra → Comprado" },          // ← NUEVO
    { key: "diasCompradoAPagado", label: "Comprado → Pagado" },
    { key: "diasCifARecibido", label: "Pagado → Recibido" },
  ];

  const procesosInternacional = [
    { key: "diasCotizadoADescuento", label: "Cotizado → Con Descuento" },
    { key: "diasDescuentoAAprobacionCompra", label: "Con Descuento → Aprob. Compra" },              // ← NUEVO
    { key: "diasAprobacionCompraAComprado", label: "Aprob. Compra → Comprado" },                    // ← NUEVO
    { key: "diasCompradoAPagado", label: "Comprado → Pagado" },
    { key: "diasPagadoAAprobacionPlanos", label: "Pagado → Aprob. Planos" },                        // ← NUEVO
    { key: "diasAprobacionPlanosASeguimiento1", label: "Aprob. Planos → 1er Seguimiento" },         // ← NUEVO
    { key: "diasSeguimiento1AFob", label: "1er Seg. → En FOB / En CIF" },
    { key: "diasFobACotizacionFlete", label: "FOB/CIF → Cotización Flete Int." },
    { key: "diasCotizacionFleteABl", label: "Cotización Flete → BL / Póliza Seguros" },
    { key: "diasBlASeguimiento2", label: "BL/Póliza → 2do Seg. / En Tránsito" },
    { key: "diasSeguimiento2ACif", label: "2do Seg./Tránsito → Proceso Aduana" },
    { key: "diasCifARecibido", label: "Proceso Aduana → Recibido" },
  ];

  const procesos = esNacional ? procesosNacional : procesosInternacional;

  const handleSave = async () => {
    if (!esNacional && !paisOrigenId) {
      alert("Selecciona un país de origen");
      return;
    }

    try {
      setLoading(true); // 🔒 Bloqueo
      await onSave({
        paisOrigenId,
        medioTransporte,
        timeline,
        notas,
      });
      // No desbloqueamos porque el modal se cierra
    } catch (error) {
      console.error(error);
      setLoading(false); // 🔓 Desbloqueo error
    }
  };

  const handleReject = async () => {
    if (motivoRechazo.trim().length < 10) return;

    try {
      setLoading(true); // 🔒 Bloqueo
      await onReject(motivoRechazo.trim());
    } catch (error) {
      setLoading(false); // 🔓 Desbloqueo error
    }
  };

  if (mostrarRechazo) {
    return (
      <div className="p-6">
        <h4 className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
          Rechazar Producto
        </h4>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="mb-4 text-sm text-red-800 dark:text-red-200">
            Al rechazar este producto, el solicitante será notificado y deberá corregir o justificar la solicitud antes de que pueda ser aprobada.
          </p>

          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full rounded-lg border-2 border-red-200 bg-white p-3 text-sm focus:border-red-500 focus:outline-none dark:border-red-800 dark:bg-gray-800 dark:text-white"
            rows={4}
            placeholder="Explica por qué se rechaza este producto..."
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            disabled={loading} // Deshabilitar
          />
          <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {motivoRechazo.length}/10 caracteres mínimos
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setMostrarRechazo(false);
                setMotivoRechazo("");
              }}
              disabled={loading}
              className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleReject}
              disabled={motivoRechazo.trim().length < 10 || loading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              {loading ? "Rechazando..." : "Confirmar Rechazo"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Aviso si ya fue rechazado antes */}
      {producto.estadoProducto?.rechazado && producto.estadoProducto?.motivoRechazo && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Producto Previamente Rechazado</h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Motivo: {producto.estadoProducto.motivoRechazo}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna Izquierda: Configuración Básica */}
        <div className="space-y-4">
          <h4 className="border-b border-gray-200 pb-2 font-semibold text-gray-800 dark:border-gray-700 dark:text-white">
            Datos Logísticos
          </h4>

          {/* País de Origen */}
          {!esNacional && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                País de Origen
              </label>
              <select
                value={paisOrigenId}
                onChange={(e) => setPaisOrigenId(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar país...</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.codigo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Medio de Transporte */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Medio de Transporte
            </label>
            <div className="flex gap-2">
              {(["MARITIMO", "AEREO", "TERRESTRE"] as MedioTransporte[]).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setMedioTransporte(tipo)}
                  disabled={loading}
                  className={`flex-1 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-colors ${medioTransporte === tipo
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tipo === "MARITIMO" && "🚢 Marítimo"}
                  {tipo === "AEREO" && "✈️ Aéreo"}
                  {tipo === "TERRESTRE" && "🚚 Terrestre"}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notas Adicionales
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Notas sobre el proveedor, ruta, etc..."
            />
          </div>
        </div>

        {/* Columna Derecha: Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Tiempos Estimados
            </h4>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Total: {diasTotales} días
            </span>
          </div>

          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {procesos.map((proc) => (
              <div key={proc.key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {proc.label}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={(timeline as any)[proc.key] || 0}
                    onChange={(e) =>
                      setTimeline({
                        ...timeline,
                        [proc.key]: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={loading}
                    className="w-16 rounded-lg border-2 border-gray-200 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-xs text-gray-400">días</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          onClick={() => setMostrarRechazo(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rechazar
        </button>

        {/* Botones Cancelar y Guardar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            )}
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}