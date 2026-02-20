import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
    Search, CheckCircle2, XCircle, Eye, ChevronDown, ChevronRight,
    Package, Building2, DollarSign, FileText, ArrowRight, ShieldCheck,
    Clock, AlertCircle, ChevronLeft,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Types
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
    precios?: PrecioOferta; // precio seleccionado
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
    tipo?: { id: string; nombre: string };
    detalles: ProductoDetalle[];
};

type EstadoProductoResumen = {
    id: string;
    sku: string;
    descripcion: string;
    proveedor?: string;
    estadoActual: string;
    aprobacionCompra: boolean;
    cotizacionId?: string;
};

const api = {
    token: () => getToken(),
    async getCotizaciones(params?: Record<string, string>) {
        const token = this.token();
        const qs = new URLSearchParams(params).toString();
        const r = await fetch(`${API}/api/v1/cotizaciones?${qs}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar cotizaciones");
        return r.json();
    },
    async getCotizacion(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/cotizaciones/${id}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar cotización");
        return r.json();
    },
    async getProductosPendientes() {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos?pageSize=100`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar productos");
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

export default function AprobacionCompras() {
    const { addNotification } = useNotifications();
    const { user } = useAuth();

    const [productos, setProductos] = useState<EstadoProductoResumen[]>([]);
    const [cotizacionesMap, setCotizacionesMap] = useState<Record<string, Cotizacion>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
    const [loadingCotizacion, setLoadingCotizacion] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<"pendientes" | "aprobados" | "todos">("pendientes");

    useEffect(() => { cargarProductos(); }, []);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await api.getProductosPendientes();
            // Filtrar productos que están en o pasaron por aprobacionCompra
            const items = (data.items || []).map((p: any) => ({
                id: p.id,
                sku: p.sku,
                descripcion: p.descripcion,
                proveedor: p.proveedor,
                estadoActual: p.estadoActual,
                aprobacionCompra: p.aprobacionCompra || false,
                cotizacionId: p.cotizacionId,
            }));
            setProductos(items);
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

    // Agrupar productos por cotización
    const productosPorCotizacion: Record<string, EstadoProductoResumen[]> = {};
    const productosFiltrados = productos.filter(p => {
        if (filtroEstado === "pendientes" && p.aprobacionCompra) return false;
        if (filtroEstado === "aprobados" && !p.aprobacionCompra) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.sku.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.proveedor?.toLowerCase().includes(q);
        }
        return true;
    });

    for (const p of productosFiltrados) {
        const key = p.cotizacionId || "sin-cotizacion";
        if (!productosPorCotizacion[key]) productosPorCotizacion[key] = [];
        productosPorCotizacion[key].push(p);
    }

    const totalPendientes = productos.filter(p => !p.aprobacionCompra && p.cotizacionId).length;
    const totalAprobados = productos.filter(p => p.aprobacionCompra).length;

    return (
        <>
            <PageMeta title="Aprobación de Compras" description="Revisión y aprobación de compras" />
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">✅ Aprobación de Compras</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Revisión de cotizaciones aceptadas para dar visto bueno antes de comprar
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <button onClick={() => setFiltroEstado("pendientes")}
                        className={`rounded-xl border p-4 text-left transition-colors ${filtroEstado === "pendientes" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPendientes}</p>
                                <p className="text-sm text-gray-500">Pendientes de aprobación</p>
                            </div>
                        </div>
                    </button>
                    <button onClick={() => setFiltroEstado("aprobados")}
                        className={`rounded-xl border p-4 text-left transition-colors ${filtroEstado === "aprobados" ? "border-green-400 bg-green-50 dark:bg-green-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={20} className="text-green-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAprobados}</p>
                                <p className="text-sm text-gray-500">Aprobados</p>
                            </div>
                        </div>
                    </button>
                    <button onClick={() => setFiltroEstado("todos")}
                        className={`rounded-xl border p-4 text-left transition-colors ${filtroEstado === "todos" ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                        <div className="flex items-center gap-3">
                            <Package size={20} className="text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{productos.length}</p>
                                <p className="text-sm text-gray-500">Total productos</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Buscador */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Buscar por SKU, descripción o proveedor..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                </div>

                {/* Lista por cotización */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                ) : Object.keys(productosPorCotizacion).length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <ShieldCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-4 text-gray-500">
                            {filtroEstado === "pendientes" ? "No hay productos pendientes de aprobación" : "No se encontraron productos"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(productosPorCotizacion).map(([cotId, prods]) => (
                            <div key={cotId} className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-700 dark:bg-gray-900">
                                {/* Header de cotización */}
                                <button onClick={() => cotId !== "sin-cotizacion" && cargarCotizacion(cotId)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {cotizacionesMap[cotId]?.nombreCotizacion || `Cotización ${cotId.substring(0, 8)}...`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {prods.length} producto{prods.length > 1 ? "s" : ""} •
                                                {prods.filter(p => p.aprobacionCompra).length} aprobado{prods.filter(p => p.aprobacionCompra).length !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {loadingCotizacion === cotId ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                        ) : (
                                            expandedCotizacion === cotId ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Productos de esta cotización (siempre visibles) */}
                                <div className="border-t border-gray-100 dark:border-gray-800">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-800">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Proveedor</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Estado Actual</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Aprobación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {prods.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-300">{p.sku}</td>
                                                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-xs truncate">{p.descripcion}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                            <Building2 size={12} /> {p.proveedor || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            {p.estadoActual}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        {p.aprobacionCompra ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <CheckCircle2 size={12} /> Aprobado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                <Clock size={12} /> Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Detalle expandido de cotización */}
                                {expandedCotizacion === cotId && cotizacionesMap[cotId] && (
                                    <div className="border-t border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
                                        <div className="space-y-4">
                                            {/* Info general */}
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

                                            {/* Comparativa de precios por producto */}
                                            <div>
                                                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Comparativa de Precios por Producto</h4>
                                                <div className="space-y-3">
                                                    {cotizacionesMap[cotId].detalles?.map((det) => (
                                                        <div key={det.id} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-mono text-xs text-gray-500">{det.sku || "—"}</span>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{det.descripcionProducto}</p>
                                                                    <p className="text-xs text-gray-500">{det.cantidad} {det.tipoUnidad}</p>
                                                                </div>
                                                            </div>

                                                            {/* Ofertas de proveedores */}
                                                            {det.preciosOfertas && det.preciosOfertas.length > 0 ? (
                                                                <div className="mt-2 space-y-1.5">
                                                                    {det.preciosOfertas.map((oferta) => {
                                                                        const esSeleccionado = det.preciosId === oferta.id;
                                                                        const descPct = calcDescuento(
                                                                            typeof oferta.precio === 'string' ? parseFloat(oferta.precio) : oferta.precio,
                                                                            oferta.precioDescuento ? (typeof oferta.precioDescuento === 'string' ? parseFloat(oferta.precioDescuento as string) : oferta.precioDescuento) : undefined
                                                                        );
                                                                        return (
                                                                            <div key={oferta.id}
                                                                                className={`flex items-center justify-between rounded-lg border p-2.5 text-sm transition-colors ${esSeleccionado
                                                                                    ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                                                                                    : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                                                                    }`}>
                                                                                <div className="flex items-center gap-2">
                                                                                    {esSeleccionado && <CheckCircle2 size={14} className="text-green-600" />}
                                                                                    <Building2 size={14} className="text-gray-400" />
                                                                                    <span className={`font-medium ${esSeleccionado ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                                                        {oferta.proveedor?.nombre}
                                                                                    </span>
                                                                                    {esSeleccionado && (
                                                                                        <span className="rounded bg-green-200 px-1.5 py-0.5 text-[10px] font-bold text-green-800 dark:bg-green-800 dark:text-green-200">SELECCIONADO</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="text-right">
                                                                                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(oferta.precio)}</p>
                                                                                        {oferta.precioDescuento && (
                                                                                            <p className="text-xs text-green-600">
                                                                                                Desc: {formatCurrency(oferta.precioDescuento)} {descPct && <span>(-{descPct}%)</span>}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                    {oferta.ComprobanteDescuento && oferta.ComprobanteDescuento.startsWith("http") && (
                                                                                        <button onClick={() => window.open(oferta.ComprobanteDescuento!, "_blank")}
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
                                                                <p className="mt-2 text-xs italic text-gray-400">Sin ofertas registradas</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {cotizacionesMap[cotId].comentarios && (
                                                <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                                                    <p className="text-xs font-medium text-gray-500 mb-1">Comentarios</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{cotizacionesMap[cotId].comentarios}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}