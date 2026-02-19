import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
    FileText, Upload, Trash2, Eye, Download, ChevronDown, ChevronRight,
    Plus, X, Settings, CheckCircle2, AlertCircle, Ban, FolderOpen, Lock, MessageSquare,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================
type DocumentoRequerido = {
    id: string; estado: string; nombre: string; descripcion?: string;
    obligatorio: boolean; orden: number;
};
type DocumentoAdjunto = {
    id: string; estadoProductoId: string; documentoRequeridoId?: string;
    estado: string; nombreDocumento: string; nombreArchivo: string;
    urlArchivo: string; tipoArchivo?: string; tamanoBytes?: number;
    noAplica?: boolean;
    subidoPor: { id: string; nombre: string; email?: string }; creado: string;
};
type EstadoDocumentos = {
    estado: string;
    estadoCompletado: boolean;
    justificacionNoAplica: { id: string; justificacion: string; creadoPor: { id: string; nombre: string } } | null;
    requeridos: {
        id: string; nombre: string; descripcion?: string;
        obligatorio: boolean; noAplica: boolean; adjuntos: DocumentoAdjunto[];
    }[];
    extras: DocumentoAdjunto[];
};
type Producto = {
    id: string; sku: string; descripcion: string; proveedor?: string;
    tipoCompra: "NACIONAL" | "INTERNACIONAL"; estadoActual?: string;
    progreso?: number; nivelCriticidad: string;
    cotizacion?: { id: string; nombreCotizacion: string; tipoCompra: "NACIONAL" | "INTERNACIONAL" };
};

// ============================================================================
// CONSTANTS
// ============================================================================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const ORDEN_ESTADOS_KEYS = [
    "aprobacionCompra",
    "comprado",
    "pagado",
    "aprobacionPlanos",
    "primerSeguimiento",
    "enFOB",
    "cotizacionFleteInternacional",
    "conBL",
    "segundoSeguimiento",
    "enCIF",
    "recibido"
];

const ESTADOS_LABELS: Record<string, string> = {
    aprobacionCompra: "Aprobacion de compra",
    comprado: "Comprado",
    pagado: "Pagado",
    aprobacionPlanos: "Aprobacion de planos",
    primerSeguimiento: "1er seguimiento/estado de producto",
    enFOB: "Incoterms",
    cotizacionFleteInternacional: "Cotizacion de flete internacional",
    conBL: "Documentos de importacion",
    segundoSeguimiento: "2do seguimiento",
    enCIF: "Proceso de aduana",
    recibido: "Recibido",
};
const ESTADOS_ICONOS: Record<string, string> = {
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

// ============================================================================
// API
// ============================================================================
const api = {
    getToken: () => getToken(),
    async getProductos(filters?: { tipoCompra?: string; pageSize?: number }) {
        const token = this.getToken();
        const params = new URLSearchParams();
        if (filters?.tipoCompra) params.append("tipoCompra", filters.tipoCompra);
        params.append("pageSize", String(filters?.pageSize || 50));
        const response = await fetch(`${API_BASE_URL}/api/v1/estado-productos?${params}`,
            { credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Error al cargar productos");
        return response.json();
    },
    async getDocumentosProducto(estadoProductoId: string) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/producto/${estadoProductoId}`,
            { credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Error al cargar documentos");
        return response.json();
    },
    async getRequeridos() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/requeridos`,
            { credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Error al cargar requeridos");
        return response.json();
    },
    async uploadDocumento(file: File, data: { estadoProductoId: string; documentoRequeridoId?: string; estado: string; nombreDocumento: string }) {
        const token = this.getToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("estadoProductoId", data.estadoProductoId);
        if (data.documentoRequeridoId) formData.append("documentoRequeridoId", data.documentoRequeridoId);
        formData.append("estado", data.estado);
        formData.append("nombreDocumento", data.nombreDocumento);
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/upload`, {
            method: "POST", credentials: "include",
            headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.message || "Error al subir documento"); }
        return response.json();
    },
    async deleteDocumento(id: string) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/adjunto/${id}`,
            { method: "DELETE", credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Error al eliminar documento");
        return response.json();
    },
    async toggleNoAplicaDocumento(data: { estadoProductoId: string; documentoRequeridoId: string; estado: string; noAplica: boolean }) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/no-aplica-documento`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar");
        return response.json();
    },
    async guardarJustificacion(data: { estadoProductoId: string; estado: string; justificacion: string }) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/justificacion`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al guardar justificación");
        return response.json();
    },
    async createRequerido(data: { estado: string; nombre: string; descripcion?: string; obligatorio?: boolean; orden?: number }) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/requeridos`, {
            method: "POST", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) { const err = await response.json(); throw new Error(err.message || "Error al crear requerimiento"); }
        return response.json();
    },
    async deleteRequerido(id: string) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/v1/documentos/requeridos/${id}`,
            { method: "DELETE", credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error("Error al eliminar requerimiento");
        return response.json();
    },
};

// ============================================================================
// HELPERS
// ============================================================================
const formatDate = (date: string) => new Date(date).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" });
const formatFileSize = (bytes?: number) => { if (!bytes) return ""; if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1048576).toFixed(1)} MB`; };
const getFileIcon = (tipo?: string) => { switch (tipo) { case "pdf": return "📕"; case "png": case "jpg": case "jpeg": case "webp": return "🖼️"; default: return "📎"; } };
const getCriticidadBadge = (nivel: string) => ({ BAJO: "🟢 Bajo", MEDIO: "🟡 Medio", ALTO: "🔴 Alto" }[nivel] || nivel);
const getCriticidadBg = (nivel: string) => ({ BAJO: "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800", MEDIO: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800", ALTO: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" }[nivel] || "bg-gray-50 border-gray-200");

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Documents() {
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const esSupervisorOAdmin = user?.rol?.nombre.toLowerCase().includes("supervisor") || user?.rol?.nombre.toLowerCase().includes("admin");

    const [productos, setProductos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [documentos, setDocumentos] = useState<Record<string, EstadoDocumentos>>({});
    const [loading, setLoading] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filtroTipoCompra, setFiltroTipoCompra] = useState<string>("");
    const [estadosExpandidos, setEstadosExpandidos] = useState<Record<string, boolean>>({});
    const [uploadingFor, setUploadingFor] = useState<{ estado: string; requeridoId?: string; requeridoNombre: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configEstado, setConfigEstado] = useState<string>("");
    const [requeridosGlobal, setRequeridosGlobal] = useState<Record<string, DocumentoRequerido[]>>({});
    const [nuevoReqNombre, setNuevoReqNombre] = useState("");
    const [nuevoReqDescripcion, setNuevoReqDescripcion] = useState("");
    const [justificacionEstado, setJustificacionEstado] = useState<string | null>(null);
    const [justificacionTexto, setJustificacionTexto] = useState("");

    useEffect(() => { cargarProductos(); }, [filtroTipoCompra]);
    useEffect(() => {
        const productoId = searchParams.get("producto");
        if (productoId && productos.length > 0) {
            const producto = productos.find((p) => p.id === productoId);
            if (producto) seleccionarProducto(producto);
        }
    }, [searchParams, productos]);

    const cargarProductos = async () => {
        try { setLoading(true); const filters: any = { pageSize: 50 }; if (filtroTipoCompra) filters.tipoCompra = filtroTipoCompra; const data = await api.getProductos(filters); setProductos(data.items || []); }
        catch (error) { addNotification("danger", "Error", "Error al cargar productos"); }
        finally { setLoading(false); }
    };
    const seleccionarProducto = async (producto: Producto) => {
        setProductoSeleccionado(producto); setLoadingDocs(true);
        try { const docs = await api.getDocumentosProducto(producto.id); setDocumentos(docs); const primerEstado = Object.keys(docs)[0]; if (primerEstado) setEstadosExpandidos({ [primerEstado]: true }); }
        catch (error) { addNotification("danger", "Error", "Error al cargar documentos"); }
        finally { setLoadingDocs(false); }
    };
    const recargarDocumentos = async () => { if (!productoSeleccionado) return; const docs = await api.getDocumentosProducto(productoSeleccionado.id); setDocumentos(docs); };
    const toggleEstado = (estado: string) => { setEstadosExpandidos((prev) => ({ ...prev, [estado]: !prev[estado] })); };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file || !productoSeleccionado || !uploadingFor) return;
        const toastId = toast.loading("Subiendo documento...");
        try { await api.uploadDocumento(file, { estadoProductoId: productoSeleccionado.id, documentoRequeridoId: uploadingFor.requeridoId, estado: uploadingFor.estado, nombreDocumento: uploadingFor.requeridoNombre }); toast.success("Documento subido correctamente", { id: toastId }); await recargarDocumentos(); }
        catch (error: any) { toast.error(error.message || "Error al subir documento", { id: toastId }); }
        finally { setUploadingFor(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };
    const triggerUpload = (estado: string, requeridoId?: string, requeridoNombre?: string) => {
        setUploadingFor({ estado, requeridoId, requeridoNombre: requeridoNombre || "Documento extra" });
        setTimeout(() => fileInputRef.current?.click(), 100);
    };
    const handleDeleteDocumento = async (docId: string) => {
        if (!confirm("¿Eliminar este documento?")) return;
        const toastId = toast.loading("Eliminando...");
        try { await api.deleteDocumento(docId); toast.success("Documento eliminado", { id: toastId }); await recargarDocumentos(); }
        catch (error: any) { toast.error(error.message || "Error al eliminar", { id: toastId }); }
    };
    const handleToggleNoAplicaDoc = async (estado: string, requeridoId: string, noAplica: boolean) => {
        if (!productoSeleccionado) return;
        try {
            await api.toggleNoAplicaDocumento({ estadoProductoId: productoSeleccionado.id, documentoRequeridoId: requeridoId, estado, noAplica });
            toast.success(noAplica ? 'Marcado como "No aplica"' : '"No aplica" removido');
            await recargarDocumentos();
            if (noAplica) { setJustificacionEstado(estado); setJustificacionTexto(documentos[estado]?.justificacionNoAplica?.justificacion || ""); }
        } catch (error: any) { toast.error(error.message || "Error al actualizar"); }
    };
    const handleGuardarJustificacion = async () => {
        if (!productoSeleccionado || !justificacionEstado) return;
        if (!justificacionTexto.trim()) { toast.error("La justificación es requerida"); return; }
        const toastId = toast.loading("Guardando justificación...");
        try { await api.guardarJustificacion({ estadoProductoId: productoSeleccionado.id, estado: justificacionEstado, justificacion: justificacionTexto.trim() }); toast.success("Justificación guardada", { id: toastId }); setJustificacionEstado(null); setJustificacionTexto(""); await recargarDocumentos(); }
        catch (error: any) { toast.error(error.message || "Error", { id: toastId }); }
    };
    const handleViewFile = (url: string) => { if (url.startsWith("http")) window.open(url, "_blank"); else toast.error("Archivo no disponible para vista previa"); };
    const handleDownloadFile = (url: string) => { if (url.startsWith("http")) { const downloadUrl = url.endsWith("/download") ? url : `${url.replace(/\/$/, "")}/download`; window.open(downloadUrl, "_blank"); } };
    const abrirConfig = async () => { try { const data = await api.getRequeridos(); setRequeridosGlobal(data); setShowConfigModal(true); } catch { toast.error("Error al cargar configuración"); } };
    const handleAddRequerido = async () => {
        if (!nuevoReqNombre.trim() || !configEstado) return;
        const toastId = toast.loading("Creando requerimiento...");
        try { await api.createRequerido({ estado: configEstado, nombre: nuevoReqNombre.trim(), descripcion: nuevoReqDescripcion.trim() || undefined, obligatorio: true, orden: (requeridosGlobal[configEstado]?.length || 0) + 1 }); toast.success("Requerimiento creado", { id: toastId }); setNuevoReqNombre(""); setNuevoReqDescripcion(""); const data = await api.getRequeridos(); setRequeridosGlobal(data); }
        catch (error: any) { toast.error(error.message || "Error al crear", { id: toastId }); }
    };
    const handleDeleteRequerido = async (id: string) => {
        if (!confirm("¿Desactivar este requerimiento?")) return;
        try { await api.deleteRequerido(id); toast.success("Requerimiento desactivado"); const data = await api.getRequeridos(); setRequeridosGlobal(data); }
        catch (error: any) { toast.error(error.message || "Error al eliminar"); }
    };

    const productosFiltrados = productos.filter((p) => {
        if (!searchQuery) return true; const q = searchQuery.toLowerCase();
        return p.sku.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.proveedor?.toLowerCase().includes(q);
    });
    const calcularCompletitud = (docs: Record<string, EstadoDocumentos>) => {
        let total = 0, completados = 0;
        Object.values(docs).forEach((ed) => { ed.requeridos.forEach((req) => { if (req.obligatorio) { total++; if (req.adjuntos.length > 0 || req.noAplica) completados++; } }); });
        return { total, completados };
    };
    const completitud = calcularCompletitud(documentos);

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <>
            <PageMeta title="Documentos de Compra" description="Gestión de documentos por estado" />
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp" onChange={handleFileUpload} className="hidden" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Documentos de Compra</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Gestión de documentos requeridos por estado de compra</p>
                    </div>
                    {esSupervisorOAdmin && (
                        <button onClick={abrirConfig} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                            <Settings size={16} /> Configurar Requerimientos
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <input type="text" placeholder="Buscar por SKU, descripción o proveedor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <select value={filtroTipoCompra} onChange={(e) => setFiltroTipoCompra(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                        <option value="">Todos los tipos</option>
                        <option value="NACIONAL">🇭🇳 Nacional</option>
                        <option value="INTERNACIONAL">🌍 Internacional</option>
                    </select>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Lista de productos */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white">📦 Productos ({productosFiltrados.length})</h3>
                            </div>
                            <div className="max-h-[650px] overflow-y-auto">
                                {loading ? (
                                    <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
                                ) : productosFiltrados.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">No hay productos disponibles</div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {productosFiltrados.map((producto) => (
                                            <button key={producto.id} onClick={() => seleccionarProducto(producto)}
                                                className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${productoSeleccionado?.id === producto.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{producto.sku}</span>
                                                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getCriticidadBg(producto.nivelCriticidad)}`}>{getCriticidadBadge(producto.nivelCriticidad)}</span>
                                                        </div>
                                                        <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">{producto.descripcion}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${(producto.cotizacion?.tipoCompra || producto.tipoCompra) === "NACIONAL" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                                                {(producto.cotizacion?.tipoCompra || producto.tipoCompra) === "NACIONAL" ? "🇭🇳 Nacional" : "🌍 Internacional"}
                                                            </span>
                                                            {producto.estadoActual && <span className="text-xs text-gray-500">{ESTADOS_ICONOS[producto.estadoActual]} {ESTADOS_LABELS[producto.estadoActual]}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel de documentos */}
                    <div className="lg:col-span-2">
                        {productoSeleccionado ? (
                            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{productoSeleccionado.sku} — {productoSeleccionado.descripcion}</h3>
                                            {productoSeleccionado.proveedor && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Proveedor: {productoSeleccionado.proveedor}</p>}
                                        </div>
                                        {completitud.total > 0 && (
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${completitud.completados === completitud.total ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                                                {completitud.completados === completitud.total ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                {completitud.completados}/{completitud.total} docs
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {loadingDocs ? (
                                        <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
                                    ) : Object.keys(documentos).length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
                                            <p>No hay documentos configurados para este producto</p>
                                            {esSupervisorOAdmin && <button onClick={abrirConfig} className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400">Configurar requerimientos →</button>}
                                        </div>
                                    ) : (
                                        [
                                            "aprobacionCompra",
                                            "comprado",
                                            "pagado",
                                            "aprobacionPlanos",
                                            "primerSeguimiento",
                                            "enFOB",
                                            "cotizacionFleteInternacional",
                                            "conBL",
                                            "segundoSeguimiento",
                                            "enCIF",
                                            "recibido"
                                        ].filter(estado => documentos[estado]).map((estado) => {
                                            const estadoDoc = documentos[estado];
                                            const isExpanded = estadosExpandidos[estado] || false;
                                            const totalReq = estadoDoc.requeridos.filter((r) => r.obligatorio).length;
                                            const completadosReq = estadoDoc.requeridos.filter((r) => r.obligatorio && (r.adjuntos.length > 0 || r.noAplica)).length;
                                            const totalAdjuntos = estadoDoc.requeridos.reduce((s, r) => s + r.adjuntos.length, 0) + estadoDoc.extras.length;
                                            const esEditable = !estadoDoc.estadoCompletado;
                                            const hayAlgunNoAplica = estadoDoc.requeridos.some((r) => r.noAplica);

                                            return (
                                                <div key={estado}>
                                                    {/* Header del estado */}
                                                    <button onClick={() => toggleEstado(estado)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                                                            <span className="text-xl">{ESTADOS_ICONOS[estado] || "📌"}</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{ESTADOS_LABELS[estado] || estado}</span>
                                                            {estadoDoc.estadoCompletado && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                    <Lock size={10} /> Completado
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {totalReq > 0 && (
                                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${completadosReq === totalReq ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                                                                    {completadosReq}/{totalReq}
                                                                </span>
                                                            )}
                                                            {totalAdjuntos > 0 && (
                                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    {totalAdjuntos} archivo{totalAdjuntos !== 1 ? "s" : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Contenido expandido */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pl-14 space-y-3">
                                                            {/* Banner estado completado */}
                                                            {!esEditable && (
                                                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                                    <Lock size={14} /> Este estado ya fue completado. Los documentos son de solo lectura.
                                                                </div>
                                                            )}

                                                            {/* Documentos requeridos */}
                                                            {estadoDoc.requeridos.map((req) => (
                                                                <div key={req.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText size={16} className="text-gray-400" />
                                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{req.nombre}</span>
                                                                            {req.obligatorio && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">Requerido</span>}
                                                                            {req.noAplica && <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">N/A</span>}
                                                                        </div>
                                                                        {req.adjuntos.length > 0 ? <CheckCircle2 size={16} className="text-green-500" /> : req.noAplica ? <Ban size={16} className="text-gray-400" /> : <AlertCircle size={16} className="text-yellow-500" />}
                                                                    </div>
                                                                    {req.descripcion && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{req.descripcion}</p>}

                                                                    {/* Archivos adjuntos */}
                                                                    {req.adjuntos.length > 0 && (
                                                                        <div className="space-y-1.5 mb-2">
                                                                            {req.adjuntos.map((adj) => (
                                                                                <div key={adj.id} className="flex items-center justify-between rounded-md bg-white p-2 border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
                                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                                        <span className="text-sm">{getFileIcon(adj.tipoArchivo)}</span>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{adj.nombreArchivo}</p>
                                                                                            <p className="text-[10px] text-gray-400">{adj.subidoPor.nombre} · {formatDate(adj.creado)}{adj.tamanoBytes ? ` · ${formatFileSize(Number(adj.tamanoBytes))}` : ""}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button onClick={() => handleViewFile(adj.urlArchivo)} className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors" title="Ver"><Eye size={14} /></button>
                                                                                        <button onClick={() => handleDownloadFile(adj.urlArchivo)} className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors" title="Descargar"><Download size={14} /></button>
                                                                                        {esEditable && <button onClick={() => handleDeleteDocumento(adj.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="Eliminar"><Trash2 size={14} /></button>}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {/* Acciones: Subir / No aplica */}
                                                                    {esEditable && !req.noAplica && (
                                                                        <div className="flex items-center gap-4">
                                                                            <button onClick={() => triggerUpload(estado, req.id, req.nombre)} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"><Upload size={12} /> Subir archivo</button>
                                                                            {req.adjuntos.length === 0 && <button onClick={() => handleToggleNoAplicaDoc(estado, req.id, true)} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"><Ban size={12} /> No aplica</button>}
                                                                        </div>
                                                                    )}
                                                                    {esEditable && req.noAplica && (
                                                                        <button onClick={() => handleToggleNoAplicaDoc(estado, req.id, false)} className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 transition-colors"><X size={12} /> Quitar "No aplica"</button>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* Justificación de "No aplica" */}
                                                            {hayAlgunNoAplica && (
                                                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/10">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <MessageSquare size={14} className="text-yellow-600" />
                                                                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                                                                            Justificación de "No aplica" {estadoDoc.justificacionNoAplica ? "(guardada)" : "(requerida para avanzar)"}
                                                                        </span>
                                                                    </div>
                                                                    {estadoDoc.justificacionNoAplica ? (
                                                                        <div>
                                                                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{estadoDoc.justificacionNoAplica.justificacion}</p>
                                                                            <p className="text-[10px] text-gray-400 mt-1">— {estadoDoc.justificacionNoAplica.creadoPor.nombre}</p>
                                                                            {esEditable && (
                                                                                <button onClick={() => { setJustificacionEstado(estado); setJustificacionTexto(estadoDoc.justificacionNoAplica?.justificacion || ""); }}
                                                                                    className="mt-2 text-xs text-yellow-600 hover:underline">Editar justificación</button>
                                                                            )}
                                                                        </div>
                                                                    ) : esEditable ? (
                                                                        <div className="space-y-2">
                                                                            <textarea placeholder="Explique por qué los documentos no aplican..."
                                                                                value={justificacionEstado === estado ? justificacionTexto : ""}
                                                                                onFocus={() => setJustificacionEstado(estado)}
                                                                                onChange={(e) => { setJustificacionEstado(estado); setJustificacionTexto(e.target.value); }}
                                                                                className="w-full rounded border border-yellow-300 bg-white p-2 text-xs dark:border-yellow-700 dark:bg-gray-800 dark:text-white" rows={3} />
                                                                            <button onClick={handleGuardarJustificacion} disabled={!justificacionTexto.trim() || justificacionEstado !== estado}
                                                                                className="rounded bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors">Guardar justificación</button>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs text-red-500">Sin justificación registrada</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Documentos extras */}
                                                            {estadoDoc.extras.length > 0 && (
                                                                <div className="rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Documentos adicionales</p>
                                                                    <div className="space-y-1.5">
                                                                        {estadoDoc.extras.map((adj) => (
                                                                            <div key={adj.id} className="flex items-center justify-between rounded-md bg-white p-2 border border-gray-100 dark:bg-gray-900 dark:border-gray-700">
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <span className="text-sm">{getFileIcon(adj.tipoArchivo)}</span>
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{adj.nombreDocumento}</p>
                                                                                        <p className="text-[10px] text-gray-400">{adj.subidoPor.nombre} · {formatDate(adj.creado)}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button onClick={() => handleViewFile(adj.urlArchivo)} className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={14} /></button>
                                                                                    <button onClick={() => handleDownloadFile(adj.urlArchivo)} className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><Download size={14} /></button>
                                                                                    {esEditable && <button onClick={() => handleDeleteDocumento(adj.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Agregar extra */}
                                                            {esEditable && (
                                                                <button onClick={() => triggerUpload(estado, undefined, "Documento adicional")}
                                                                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors">
                                                                    <Plus size={12} /> Agregar documento extra
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <FolderOpen size={48} className="text-gray-300 dark:text-gray-600" />
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Selecciona un producto para ver sus documentos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal editar justificación */}
            {justificacionEstado && documentos[justificacionEstado]?.justificacionNoAplica && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Editar justificación — {ESTADOS_LABELS[justificacionEstado]}</h3>
                            <button onClick={() => { setJustificacionEstado(null); setJustificacionTexto(""); }} className="rounded-full p-1 text-gray-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <textarea value={justificacionTexto} onChange={(e) => setJustificacionTexto(e.target.value)}
                                className="w-full rounded border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" rows={4}
                                placeholder="Detalle los motivos por los que los documentos no aplican..." />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setJustificacionEstado(null); setJustificacionTexto(""); }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
                                <button onClick={handleGuardarJustificacion} disabled={!justificacionTexto.trim()}
                                    className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Config Requerimientos */}
            {showConfigModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-gray-900 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">⚙️ Configurar Documentos Requeridos</h3>
                            <button onClick={() => setShowConfigModal(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                                <select value={configEstado} onChange={(e) => setConfigEstado(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                    <option value="">Seleccionar estado...</option>
                                    {Object.entries(ESTADOS_LABELS).map(([key, label]) => (<option key={key} value={key}>{ESTADOS_ICONOS[key]} {label}</option>))}
                                </select>
                            </div>
                            {configEstado && (
                                <>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Documentos requeridos para {ESTADOS_LABELS[configEstado]}:</h4>
                                        {(requeridosGlobal[configEstado] || []).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Sin documentos configurados</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {(requeridosGlobal[configEstado] || []).map((req) => (
                                                    <div key={req.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{req.nombre}</p>
                                                            {req.descripcion && <p className="text-xs text-gray-500">{req.descripcion}</p>}
                                                        </div>
                                                        <button onClick={() => handleDeleteRequerido(req.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Desactivar"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600 space-y-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Agregar nuevo requerimiento</p>
                                        <input type="text" placeholder="Nombre del documento (ej: Factura Proforma)" value={nuevoReqNombre} onChange={(e) => setNuevoReqNombre(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                                        <input type="text" placeholder="Descripción (opcional)" value={nuevoReqDescripcion} onChange={(e) => setNuevoReqDescripcion(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                                        <button onClick={handleAddRequerido} disabled={!nuevoReqNombre.trim()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Plus size={14} /> Agregar</button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <button onClick={() => setShowConfigModal(false)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}