import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
    Search, CheckCircle2, Eye, ChevronDown, ChevronRight,
    Package, Building2, FileText, ShieldCheck,
    Clock, ShoppingCart, ThumbsUp, ThumbsDown, Undo2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

type PrecioOferta = {
    id: string;
    precio: number;
    precioDescuento?: number;
    fechaConsulta: string;
    ComprobanteDescuento?: string;
    proveedor: { id: string; nombre: string };
};

type ProductoDetalle = {
    id: string;
    sku: string;
    descripcionProducto: string;
    cantidad: number;
    tipoUnidad: string;
    notas?: string;
    preciosId?: string;
    precios?: PrecioOferta;
    preciosOfertas: PrecioOferta[];
};

type Cotizacion = {
    id: string;
    nombreCotizacion: string;
    tipoCompra: string;
    estado: string;
    fechaSolicitud: string;
    fechaLimite: string;
    comentarios?: string;
    solicitante: { id: string; nombre: string; email: string };
    proyecto?: { id: string; nombre: string };
    detalles: ProductoDetalle[];
};

type ProductoResumen = {
    id: string;
    sku: string;
    descripcion: string;
    proveedor?: string;
    estadoActual: string;
    aprobacionCompra: boolean;
    aprobadoCompra: boolean;
    comprado: boolean;
    rechazado: boolean;
    motivoRechazo?: string;
    cotizacionId?: string;
    precioTotal?: number;
    nombreCotizacion?: string;
    tipoCompra?: string;
    solicitante?: { id: string; nombre: string } | null;
    responsableSeguimiento?: { id: string; nombre: string } | null;
};

const api = {
    token: () => getToken(),
    async getProductosAprobados() {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos?pageSize=200`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar productos");
        return r.json();
    },
    async getProductosRechazados() {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos?pageSize=200&rechazados=true`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar productos rechazados");
        return r.json();
    },
    async getCotizacion(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/quotations/${id}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar cotización");
        return r.json();
    },
    async aprobarCompra(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos/${id}/aprobar-compra`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al aprobar"); }
        return r.json();
    },
    async revocarAprobacion(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos/${id}/revocar-aprobacion-compra`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al revocar"); }
        return r.json();
    },
    async rechazarCompra(id: string, motivo: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos/${id}/rechazar-compra`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ motivo }),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al rechazar"); }
        return r.json();
    },
    async revertirRechazo(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos/${id}/revertir-rechazo`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al revertir"); }
        return r.json();
    },
};

const formatCurrency = (val?: number | string) => {
    if (!val) return "—";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "USD" }).format(num);
};
const formatDate = (d: string) => new Date(d).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" });
const calcDescuento = (precio: number, descuento?: number) => {
    if (!descuento || descuento >= precio) return null;
    return ((1 - descuento / precio) * 100).toFixed(1);
};

type Filtro = "pendientes" | "aprobados" | "comprados" | "rechazados" | "todos";

export default function AprobacionCompras() {
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const esAdmin = user?.rol?.nombre.toLowerCase().includes("admin") || user?.rol?.nombre.toLowerCase().includes("supervisor");

    const [productos, setProductos] = useState<ProductoResumen[]>([]);
    const [productosRechazados, setProductosRechazados] = useState<ProductoResumen[]>([]);
    const [cotizacionesMap, setCotizacionesMap] = useState<Record<string, Cotizacion>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
    const [loadingCotizacion, setLoadingCotizacion] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<Filtro>("pendientes");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRechazoModal, setShowRechazoModal] = useState<string | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [habilitarEdicionId, setHabilitarEdicionId] = useState(null);

    useEffect(() => { cargarProductosAprobados(); }, []);

    const cargarProductosAprobados = async () => {
        try {
            setLoading(true);
            const data = await api.getProductosAprobados();
            const items = (data.items || []).map((p: any) => ({
                id: p.id,
                sku: p.sku,
                descripcion: p.descripcion,
                proveedor: p.proveedor,
                estadoActual: p.estadoActual,
                aprobacionCompra: p.aprobacionCompra || false,
                aprobadoCompra: p.aprobadoCompra || false,
                comprado: p.comprado || false,
                rechazado: p.rechazado || false,
                motivoRechazo: p.motivoRechazo || undefined,
                cotizacionId: p.cotizacionId,
                precioTotal: p.precioTotal ? parseFloat(p.precioTotal) : undefined,
                nombreCotizacion: p.cotizacion?.nombreCotizacion,
                tipoCompra: p.cotizacion?.tipoCompra || p.tipoCompra,
                solicitante: p.cotizacion?.solicitante || null,
                responsableSeguimiento: p.responsableSeguimiento || null,
            }));
            setProductos(items);
        } catch {
            addNotification("danger", "Error", "Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarProductosRechazados(); }, []);

    const cargarProductosRechazados = async () => {
        try {
            setLoading(true);
            const data = await api.getProductosRechazados();
            const items = (data.items || []).map((p: any) => ({
                id: p.id,
                sku: p.sku,
                descripcion: p.descripcion,
                proveedor: p.proveedor,
                estadoActual: p.estadoActual,
                aprobacionCompra: p.aprobacionCompra || false,
                aprobadoCompra: p.aprobadoCompra || false,
                comprado: p.comprado || false,
                rechazado: p.rechazado || false,
                motivoRechazo: p.motivoRechazo || undefined,
                cotizacionId: p.cotizacionId,
                precioTotal: p.precioTotal ? parseFloat(p.precioTotal) : undefined,
                nombreCotizacion: p.cotizacion?.nombreCotizacion,
                tipoCompra: p.cotizacion?.tipoCompra || p.tipoCompra,
                solicitante: p.cotizacion?.solicitante || null,
                responsableSeguimiento: p.responsableSeguimiento || null,
            }));
            setProductosRechazados(items);
        } catch {
            addNotification("danger", "Error", "Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const cargarCotizacion = async (cotizacionId: string) => {
        if (cotizacionesMap[cotizacionId]) {
            setExpandedCotizacion(expandedCotizacion === cotizacionId ? null : cotizacionId);
            return;
        }
        setLoadingCotizacion(cotizacionId);
        try {
            const cot = await api.getCotizacion(cotizacionId);
            setCotizacionesMap(prev => ({ ...prev, [cotizacionId]: cot }));
            setExpandedCotizacion(cotizacionId);
        } catch {
            toast.error("Error al cargar detalle de cotización");
        } finally {
            setLoadingCotizacion(null);
        }
    };

    const handleAprobar = async (productoId: string) => {
        setActionLoading(productoId);
        const toastId = toast.loading("Aprobando compra...");
        try {
            await api.aprobarCompra(productoId);
            toast.success("Compra aprobada", { id: toastId });
            setProductos(prev => prev.map(p => p.id === productoId ? { ...p, aprobadoCompra: true } : p));
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevocar = async (productoId: string) => {
        if (!confirm("¿Revocar la aprobación de esta compra?")) return;
        setActionLoading(productoId);
        const toastId = toast.loading("Revocando...");
        try {
            await api.revocarAprobacion(productoId);
            toast.success("Aprobación revocada", { id: toastId });
            setProductos(prev => prev.map(p => p.id === productoId ? { ...p, aprobadoCompra: false } : p));
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRechazar = async () => {
        if (!showRechazoModal || !motivoRechazo.trim()) return;
        setActionLoading(showRechazoModal);
        const toastId = toast.loading("Rechazando compra...");
        try {
            await api.rechazarCompra(showRechazoModal, motivoRechazo.trim());
            toast.success("Compra rechazada", { id: toastId });
            const id = showRechazoModal;
            const motivo = motivoRechazo.trim();
            setProductos(prev => prev.map(p => p.id === id ? { ...p, rechazado: true, motivoRechazo: motivo } : p));
            setShowRechazoModal(null);
            setMotivoRechazo("");
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevertirRechazo = async (productoId: string) => {
        if (!confirm("¿Revertir el rechazo de esta compra?")) return;
        setActionLoading(productoId);
        const toastId = toast.loading("Revirtiendo rechazo...");
        try {
            await api.revertirRechazo(productoId);
            toast.success("Rechazo revertido", { id: toastId });
            setProductosRechazados(prev => prev.map(p => p.id === productoId ? { ...p, rechazado: false, motivoRechazo: undefined } : p));
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const handleAprobarTodos = async (prods: ProductoResumen[]) => {
        const pendientes = prods.filter(p => !p.aprobadoCompra && !p.comprado && !p.rechazado);
        if (!pendientes.length) return;
        const toastId = toast.loading(`Aprobando ${pendientes.length} producto(s)...`);
        try {
            await Promise.all(pendientes.map(p => api.aprobarCompra(p.id)));
            toast.success(`${pendientes.length} producto(s) aprobados`, { id: toastId });
            const ids = new Set(pendientes.map(p => p.id));
            setProductos(prev => prev.map(p => ids.has(p.id) ? { ...p, aprobadoCompra: true } : p));
        } catch (e: any) {
            toast.error(e.message || 'Error al aprobar', { id: toastId });
        }
    };

    const handleRechazarTodos = async (prods: ProductoResumen[]) => {
        const pendientes = prods.filter(p => !p.aprobadoCompra && !p.comprado && !p.rechazado);
        if (!pendientes.length) return;
        const motivo = window.prompt(`Motivo de rechazo para ${pendientes.length} producto(s):`);
        if (!motivo?.trim()) return;
        const toastId = toast.loading(`Rechazando ${pendientes.length} producto(s)...`);
        try {
            await Promise.all(pendientes.map(p => api.rechazarCompra(p.id, motivo.trim())));
            toast.success(`${pendientes.length} producto(s) rechazados`, { id: toastId });
            const ids = new Set(pendientes.map(p => p.id));
            setProductos(prev => prev.map(p => ids.has(p.id) ? { ...p, rechazado: true, motivoRechazo: motivo.trim() } : p));
        } catch (e: any) {
            toast.error(e.message || 'Error al rechazar', { id: toastId });
        }
    };

    const productosCombinados = [...productos, ...productosRechazados];

    // Filtrado
    const productosFiltrados = productosCombinados.filter(p => {
        // Solo mostrar productos que tienen cotización
        if (!p.cotizacionId) return false;

        switch (filtro) {
            case "pendientes": return !p.aprobadoCompra && !p.comprado && !p.rechazado;
            case "aprobados": return p.aprobadoCompra && !p.comprado && !p.rechazado;
            case "comprados": return p.comprado;
            case "rechazados": return p.rechazado;
            case "todos": return true;
        }
    }).filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.sku.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.proveedor?.toLowerCase().includes(q);
    });

    // Agrupar por cotización
    const porCotizacion: Record<string, ProductoResumen[]> = {};
    for (const p of productosFiltrados) {
        const key = p.cotizacionId || "sin-cotizacion";
        if (!porCotizacion[key]) porCotizacion[key] = [];
        porCotizacion[key].push(p);
    }

    const totalPendientes = productosCombinados.filter(p => p.cotizacionId && !p.aprobadoCompra && !p.comprado && !p.rechazado).length;
    const totalAprobados = productosCombinados.filter(p => p.aprobadoCompra && !p.comprado && !p.rechazado).length;
    const totalComprados = productosCombinados.filter(p => p.comprado).length;
    const totalRechazados = productosCombinados.filter(p => p.rechazado).length;

    const filtros: { key: Filtro; label: string; count: number; icon: any; color: string; activeColor: string }[] = [
        { key: "pendientes", label: "Pendientes", count: totalPendientes, icon: Clock, color: "text-yellow-500", activeColor: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10" },
        { key: "aprobados", label: "Aprobados", count: totalAprobados, icon: ThumbsUp, color: "text-green-500", activeColor: "border-green-400 bg-green-50 dark:bg-green-900/10" },
        { key: "comprados", label: "Comprados", count: totalComprados, icon: ShoppingCart, color: "text-blue-500", activeColor: "border-blue-400 bg-blue-50 dark:bg-blue-900/10" },
        { key: "rechazados", label: "Rechazados", count: totalRechazados, icon: ThumbsDown, color: "text-red-500", activeColor: "border-red-400 bg-red-50 dark:bg-red-900/10" },
        { key: "todos", label: "Total", count: productosCombinados.filter(p => p.cotizacionId).length, icon: Package, color: "text-gray-500", activeColor: "border-gray-400 bg-gray-50 dark:bg-gray-900/10" },
    ];

    return (
        <>
            <PageMeta title="Aprobación de Compras" description="Revisión y aprobación de compras" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aprobación de Compras</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Revisión y aprobación de compras cotizadas
                    </p>
                </div>

                {/* Stats/Filtros */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {filtros.map(f => (
                        <button key={f.key} onClick={() => setFiltro(f.key)}
                            className={`rounded-xl border p-3 text-left transition-all ${filtro === f.key ? f.activeColor : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 hover:border-gray-300"}`}>
                            <div className="flex items-center gap-2">
                                <f.icon size={18} className={f.color} />
                                <div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{f.count}</p>
                                    <p className="text-xs text-gray-500">{f.label}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Buscar por SKU, descripción o proveedor..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                ) : Object.keys(porCotizacion).length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <ShieldCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-4 text-gray-500">
                            {filtro === "pendientes" ? "No hay productos pendientes de aprobación" : "No se encontraron productos"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(porCotizacion).map(([cotId, prods]) => (
                            <div key={cotId} className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-700 dark:bg-gray-900">
                                {/* Header cotización */}
                                <button onClick={() => cotId !== "sin-cotizacion" && cargarCotizacion(cotId)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText size={20} className="text-blue-500 flex-shrink-0" />
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {prods[0]?.nombreCotizacion || `Cotización ${cotId.substring(0, 8)}...`}
                                                </p>
                                                {prods[0]?.tipoCompra && (
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        prods[0].tipoCompra === 'NACIONAL'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    }`}>
                                                        {prods[0].tipoCompra === 'NACIONAL' ? 'Nacional' : 'Internacional'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap mt-0.5">
                                                <p className="text-xs text-gray-500">
                                                    {prods.length} producto{prods.length > 1 ? "s" : ""} • {prods.filter(p => p.aprobadoCompra).length}/{prods.length} aprobados
                                                </p>
                                                {prods[0]?.solicitante && (
                                                    <p className="text-xs text-gray-500">Solicitante: <span className="font-medium text-gray-700 dark:text-gray-300">{prods[0].solicitante.nombre}</span></p>
                                                )}
                                                {prods[0]?.responsableSeguimiento && (
                                                    <p className="text-xs text-gray-500">Responsable: <span className="font-medium text-gray-700 dark:text-gray-300">{prods[0].responsableSeguimiento.nombre}</span></p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                        {esAdmin && prods.some(p => !p.aprobadoCompra && !p.comprado && !p.rechazado) && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAprobarTodos(prods); }}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors">
                                                    <ThumbsUp size={12} /> Aprobar todos
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRechazarTodos(prods); }}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors">
                                                    <ThumbsDown size={12} /> Rechazar todos
                                                </button>
                                            </>
                                        )}
                                        {loadingCotizacion === cotId ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                        ) : (
                                            expandedCotizacion === cotId ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Tabla productos + detalle expandido */}
                                {expandedCotizacion === cotId && (
                                <>
                                <div className="border-t border-gray-100 dark:border-gray-800">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-800">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Proveedor</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Estado</th>
                                                {esAdmin && <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Acción</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {prods.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-xs truncate">{p.descripcion}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                            <Building2 size={12} /> {p.proveedor || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(p.precioTotal)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        {p.rechazado ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                <ThumbsDown size={12} /> Rechazado
                                                            </span>
                                                        ) : p.comprado ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                <ShoppingCart size={12} /> Comprado
                                                            </span>
                                                        ) : p.aprobadoCompra ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <CheckCircle2 size={12} /> Aprobado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                <Clock size={12} /> Pendiente
                                                            </span>
                                                        )}
                                                        {p.motivoRechazo && (
                                                            <p className="mt-1 text-[10px] text-red-500 max-w-[150px] truncate" title={p.motivoRechazo}>
                                                                {p.motivoRechazo}
                                                            </p>
                                                        )}
                                                    </td>
                                                    {esAdmin && (
                                                        <td className="px-4 py-2.5 text-center">
                                                            {p.comprado ? (
                                                                <span className="text-xs text-gray-400">—</span>
                                                            ) : p.rechazado ? (
                                                                <div className="flex flex-col items-center justify-center gap-1.5">
                                                                    {/* Checkbox para habilitar edición */}
                                                                    <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={habilitarEdicionId === p.id}
                                                                            onChange={(e) => setHabilitarEdicionId(e.target.checked ? p.id : null)}
                                                                            className="h-3 w-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500 bg-transparent"
                                                                        />
                                                                        Habilitar edición
                                                                    </label>

                                                                    {/* Botón Revertir (inhabilitado por defecto) */}
                                                                    <button
                                                                        onClick={() => {
                                                                            handleRevertirRechazo(p.id);
                                                                            setHabilitarEdicionId(null); // Bloquea de nuevo después de usarlo
                                                                        }}
                                                                        disabled={actionLoading === p.id || habilitarEdicionId !== p.id}
                                                                        className="inline-flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20">
                                                                        {actionLoading === p.id ? (
                                                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                                                                        ) : (
                                                                            <><Undo2 size={12} /> Revertir</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ) : p.aprobadoCompra ? (
                                                                <button onClick={() => handleRevocar(p.id)}
                                                                    disabled={actionLoading === p.id}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20">
                                                                    {actionLoading === p.id ? (
                                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                                                                    ) : (
                                                                        <><Undo2 size={12} /> Revocar</>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button onClick={() => handleAprobar(p.id)}
                                                                        disabled={actionLoading === p.id}
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                                                                        {actionLoading === p.id ? (
                                                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                        ) : (
                                                                            <><ThumbsUp size={12} /> Aprobar</>
                                                                        )}
                                                                    </button>
                                                                    <button onClick={() => { setShowRechazoModal(p.id); setMotivoRechazo(""); }}
                                                                        disabled={actionLoading === p.id}
                                                                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                                                                        <ThumbsDown size={12} /> Rechazar
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Detalle expandido de cotización */}
                                {cotizacionesMap[cotId] && expandedCotizacion === cotId && (
                                    <div className="border-t border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Solicitante</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cotizacionesMap[cotId].solicitante?.nombre}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Tipo de compra</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cotizacionesMap[cotId].tipoCompra}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Fecha solicitud</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(cotizacionesMap[cotId].fechaSolicitud)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Proyecto</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cotizacionesMap[cotId].proyecto?.nombre || "—"}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Comparativa de Precios</h4>
                                                <div className="space-y-3">
                                                    {cotizacionesMap[cotId].detalles?.map((det) => (
                                                        <div key={det.id} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                                                            <div className="mb-2">
                                                                <span className="font-mono text-xs text-gray-500">{det.sku || "—"}</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{det.descripcionProducto}</p>
                                                                <p className="text-xs text-gray-500">{det.cantidad} {det.tipoUnidad}</p>
                                                            </div>

                                                            {(() => {
                                                                const ofertas = det.preciosOfertas || [];
                                                                // Fallback: si no hay ofertas pero hay precio seleccionado, mostrarlo
                                                                const listaOfertas = ofertas.length > 0 ? ofertas : (det.precios ? [det.precios] : []);
                                                                return listaOfertas.length > 0 ? (
                                                                    <div className="space-y-1.5">
                                                                        {listaOfertas.map((oferta) => {
                                                                            const esSeleccionado = det.preciosId === oferta.id;
                                                                            const precioNum = typeof oferta.precio === 'string' ? parseFloat(oferta.precio) : oferta.precio;
                                                                            const descNum = oferta.precioDescuento ? (typeof oferta.precioDescuento === 'string' ? parseFloat(oferta.precioDescuento as string) : oferta.precioDescuento) : undefined;
                                                                            const descPct = calcDescuento(precioNum, descNum);
                                                                            return (
                                                                                <div key={oferta.id}
                                                                                    className={`flex items-center justify-between rounded-lg border p-2.5 text-sm ${esSeleccionado
                                                                                        ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                                                                                        : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"}`}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {esSeleccionado && <CheckCircle2 size={14} className="text-green-600" />}
                                                                                        <Building2 size={14} className="text-gray-400" />
                                                                                        <span className={`font-medium ${esSeleccionado ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                                                            {oferta.proveedor?.nombre || "Sin proveedor"}
                                                                                        </span>
                                                                                        {esSeleccionado && (
                                                                                            <span className="rounded bg-green-200 px-1.5 py-0.5 text-[10px] font-bold text-green-800 dark:bg-green-800 dark:text-green-200">SELECCIONADO</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="text-right">
                                                                                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(descNum || precioNum)}</p>
                                                                                            {descNum && descNum !== precioNum && (
                                                                                                <p className="text-xs text-green-600">Original: <span className="line-through">{formatCurrency(precioNum)}</span> {descPct && <span>(-{descPct}%)</span>}</p>
                                                                                            )}
                                                                                        </div>
                                                                                        {oferta.ComprobanteDescuento && (
                                                                                            <button onClick={() => {
                                                                                                const url = oferta.ComprobanteDescuento!;
                                                                                                if (url.startsWith("http")) window.open(url, "_blank");
                                                                                                else window.open(`${API}/api/v1/storage/file?path=${encodeURIComponent(url)}`, "_blank");
                                                                                            }}
                                                                                                className="rounded-md p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Ver comprobante">
                                                                                                <Eye size={14} />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs italic text-gray-400">Sin ofertas registradas</p>
                                                                );
                                                            })()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Rechazo */}
            {showRechazoModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">❌ Rechazar Compra</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Indica el motivo del rechazo:</p>
                        <textarea
                            value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)}
                            rows={3} autoFocus placeholder="Ej: Precio demasiado alto, buscar alternativa..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white mb-4" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRechazoModal(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
                            <button onClick={handleRechazar}
                                disabled={!motivoRechazo.trim() || actionLoading === showRechazoModal}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {actionLoading === showRechazoModal ? "Rechazando..." : "Confirmar Rechazo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}