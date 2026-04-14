import { useState, useEffect } from "react";
import PageMeta from "../../../components/common/PageMeta";
import { getToken } from "../../../lib/api";
import { useNotifications } from "../../Notifications/context/NotificationContext";
import toast from "react-hot-toast";
import {
    Search, ChevronDown, ChevronRight, Package, Building2,
    FileText, Clock, ThumbsDown, AlertTriangle, Eye, Undo2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ProductoRechazado = {
    id: string;
    sku: string;
    descripcion: string;
    proveedor?: string;
    estadoActual: string;
    rechazado: boolean;
    motivoRechazo?: string;
    fechaRechazo?: string;
    cotizacionId?: string;
    precioTotal?: number;
    precioSeleccionado?: {
        precio: number;
        precioDescuento?: number;
        ComprobanteDescuento?: string;
        proveedor?: { nombre: string };
    };
    cotizacion?: {
        nombreCotizacion: string;
        tipoCompra: string;
        solicitante?: { nombre: string; email: string };
    };
    proyecto?: { nombre: string };
};

const api = {
    token: () => getToken(),
    async getProductosRechazados() {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/estado-productos?pageSize=200&rechazados=true`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar productos rechazados");
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

const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" });
};

export default function RejectedQuotes() {
    const { addNotification } = useNotifications();
    const [productos, setProductos] = useState<ProductoRechazado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCotizacion, setExpandedCotizacion] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => { cargarProductos(); }, []);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await api.getProductosRechazados();
            setProductos((data.items || []).filter((p: any) => p.cotizacion?.tipo?.nombre?.toLowerCase() === 'logistica').map((p: any) => ({
                id: p.id,
                sku: p.sku,
                descripcion: p.descripcion,
                proveedor: p.proveedor,
                estadoActual: p.estadoActual,
                rechazado: p.rechazado || false,
                motivoRechazo: p.motivoRechazo,
                fechaRechazo: p.fechaRechazo,
                cotizacionId: p.cotizacionId,
                precioTotal: p.precioTotal ? parseFloat(p.precioTotal) : undefined,
                precioSeleccionado: p.precioSeleccionado || null,
                cotizacion: p.cotizacion,
                proyecto: p.proyecto,
            })));
        } catch {
            addNotification("danger", "Error", "Error al cargar productos rechazados");
        } finally {
            setLoading(false);
        }
    };

    const handleRevertir = async (productoId: string) => {
        if (!confirm("¿Revertir el rechazo? El producto volverá a pendiente de aprobación.")) return;
        setActionLoading(productoId);
        const toastId = toast.loading("Revirtiendo rechazo...");
        try {
            await api.revertirRechazo(productoId);
            toast.success("Rechazo revertido", { id: toastId });
            await cargarProductos();
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    // Filtrar
    const productosFiltrados = productos.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.sku.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) ||
            p.proveedor?.toLowerCase().includes(q) || p.motivoRechazo?.toLowerCase().includes(q) ||
            p.cotizacion?.nombreCotizacion?.toLowerCase().includes(q);
    });

    // Agrupar por cotización
    const porCotizacion: Record<string, ProductoRechazado[]> = {};
    for (const p of productosFiltrados) {
        const key = p.cotizacionId || "sin-cotizacion";
        if (!porCotizacion[key]) porCotizacion[key] = [];
        porCotizacion[key].push(p);
    }

    return (
        <>
            <PageMeta title="Logística — Rechazados" description="Productos logística rechazados" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">❌ Rechazados — Logística</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Productos de logística rechazados en el proceso de compras
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
                        <div className="flex items-center gap-2">
                            <ThumbsDown size={20} className="text-red-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{productos.length}</p>
                                <p className="text-xs text-gray-500">Total rechazados</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-gray-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(porCotizacion).length}</p>
                                <p className="text-xs text-gray-500">Cotizaciones afectadas</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-gray-500" />
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(productos.reduce((sum, p) => sum + (p.precioTotal || 0), 0))}
                                </p>
                                <p className="text-xs text-gray-500">Valor rechazado</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por SKU, descripción, proveedor, motivo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
                    </div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <ThumbsDown size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">No hay productos rechazados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(porCotizacion).map(([cotId, prods]) => {
                            const cot = prods[0]?.cotizacion;
                            const isExpanded = expandedCotizacion === cotId;

                            return (
                                <div key={cotId} className="overflow-hidden rounded-xl border border-red-200 bg-white dark:border-red-800/50 dark:bg-gray-900">
                                    {/* Header cotización */}
                                    <button
                                        onClick={() => setExpandedCotizacion(isExpanded ? null : cotId)}
                                        className="flex w-full items-center justify-between p-4 text-left hover:bg-red-50/50 dark:hover:bg-red-900/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? <ChevronDown size={16} className="text-red-400" /> : <ChevronRight size={16} className="text-red-400" />}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {cot?.nombreCotizacion || "Sin nombre"}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {cot?.tipoCompra && (
                                                        <span className={`rounded px-1.5 py-0.5 font-medium ${cot.tipoCompra === 'NACIONAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                            {cot.tipoCompra}
                                                        </span>
                                                    )}
                                                    {cot?.solicitante && <span>Solicitante: {cot.solicitante.nombre}</span>}
                                                    <span className="text-red-500 font-medium">{prods.length} producto(s) rechazado(s)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Detalle expandido */}
                                    {isExpanded && (
                                        <div className="border-t border-red-100 dark:border-red-800/30">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-red-50/50 dark:bg-red-900/10">
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Proveedor</th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha Rechazo</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Motivo</th>
                                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-red-50 dark:divide-red-900/10">
                                                    {prods.map((p) => (
                                                        <tr key={p.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/5">
                                                            <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{p.sku}</td>
                                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{p.descripcion}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                    <Building2 size={12} /> {p.proveedor || "—"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(p.precioTotal)}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-gray-500">{formatDate(p.fechaRechazo)}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-start gap-1 max-w-[200px]">
                                                                    <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" />
                                                                    <span className="text-xs text-red-600 dark:text-red-400 line-clamp-2" title={p.motivoRechazo}>
                                                                        {p.motivoRechazo || "Sin motivo"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                                >
                                                                    Disponibles en proxima actualizacion
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}