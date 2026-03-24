import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Producto = {
    id: string; sku: string; descripcion: string; proveedor?: string;
    precioTotal?: number; cantidad?: number; estadoActual: string;
    progreso: number; estadosAplicables: string[]; tipoCompra: string;
    responsable?: { id: string; nombre: string };
    [key: string]: any;
};

type Oferta = {
    id: string; nombre: string; estado: string; tipoCompra: string;
    fechaSolicitud: string; fechaLimite: string; cotizacionId: string;
    solicitante: { id: string; nombre: string };
    proyecto?: { id?: string; nombre: string } | null;
    totalProductos: number; productosCompletados: number; progreso: number;
};

type OfertaDetalle = Oferta & { productos: Producto[] };

const ESTADOS_ICONOS: Record<string, string> = {
    cotizado: "📋", conDescuento: "💰", aprobacionCompra: "✅", comprado: "🛒",
    pagado: "💳", aprobacionPlanos: "📐", primerSeguimiento: "📞", enFOB: "🚢",
    cotizacionFleteInternacional: "📊", conBL: "📄", segundoSeguimiento: "🚚",
    enCIF: "🛃", recibido: "📦",
};

const ESTADOS_LABELS: Record<string, string> = {
    cotizado: "Cotizado", conDescuento: "Con Descuento", aprobacionCompra: "Aprob. Compra",
    comprado: "Comprado", pagado: "Pagado", aprobacionPlanos: "Aprob. Planos",
    primerSeguimiento: "1er Seguimiento", enFOB: "En FOB",
    cotizacionFleteInternacional: "Cotiz. Flete", conBL: "Con BL",
    segundoSeguimiento: "2do Seguimiento", enCIF: "En CIF", recibido: "Recibido",
};

const formatCurrency = (v?: number | null) =>
    v ? new Intl.NumberFormat("es-HN", { style: "currency", currency: "USD" }).format(v) : "—";
const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" });

const api = {
    async getOfertas(estado?: string) {
        const token = getToken();
        const params = estado ? `?estado=${estado}` : '?estado=ACTIVA';
        const r = await fetch(`${API}/api/v1/ofertas${params}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar ofertas");
        return r.json();
    },
    async getDetalle(id: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/ofertas/${id}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al cargar detalle");
        return r.json();
    },
    async avanzarEstado(productoId: string, observaciones?: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/ofertas/${productoId}/avanzar`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ observaciones }),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error"); }
        return r.json();
    },
    async archivar(id: string, motivo: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/ofertas/${id}/archivar`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ motivo }),
        });
        if (!r.ok) throw new Error("Error al archivar");
        return r.json();
    },
};

export default function OfertasFollowUps() {
    const [ofertas, setOfertas] = useState<Oferta[]>([]);
    const [seleccionada, setSeleccionada] = useState<OfertaDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showArchivarModal, setShowArchivarModal] = useState(false);
    const [motivoArchivo, setMotivoArchivo] = useState("");

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try { setLoading(true); const data = await api.getOfertas('ACTIVA'); setOfertas(data); }
        catch { toast.error("Error al cargar ofertas"); }
        finally { setLoading(false); }
    };

    const seleccionar = async (oferta: Oferta) => {
        try { setLoadingDetalle(true); const det = await api.getDetalle(oferta.id); setSeleccionada(det); }
        catch { toast.error("Error al cargar detalle"); }
        finally { setLoadingDetalle(false); }
    };

    const handleAvanzar = async (productoId: string) => {
        setActionLoading(productoId);
        try {
            await api.avanzarEstado(productoId);
            toast.success("Estado avanzado");
            if (seleccionada) { const det = await api.getDetalle(seleccionada.id); setSeleccionada(det); }
        } catch (e: any) { toast.error(e.message); }
        finally { setActionLoading(null); }
    };

    const handleArchivar = async () => {
        if (!seleccionada || !motivoArchivo.trim()) return;
        try {
            await api.archivar(seleccionada.id, motivoArchivo.trim());
            toast.success("Oferta archivada");
            setShowArchivarModal(false); setMotivoArchivo(""); setSeleccionada(null);
            await cargar();
        } catch { toast.error("Error al archivar"); }
    };

    const filtradas = ofertas.filter((o) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return o.nombre.toLowerCase().includes(q) || o.solicitante.nombre.toLowerCase().includes(q);
    });

    return (
        <>
            <PageMeta title="Ofertas Comerciales" description="Seguimiento de ofertas comerciales activas" />
            <div className="flex h-[calc(100vh-120px)] flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏷️ Ofertas Comerciales</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} activa{ofertas.length !== 1 ? "s" : ""}
                            {" · "}
                            <span className="text-amber-600 dark:text-amber-400">Se archivan automáticamente a los 5 días sin avanzar</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* Panel izquierdo — lista */}
                    <div className="flex w-80 flex-shrink-0 flex-col gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar oferta..."
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {loading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
                                </div>
                            ) : filtradas.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                                    <p className="text-sm text-gray-500">No hay ofertas activas</p>
                                </div>
                            ) : (
                                filtradas.map((o) => (
                                    <button key={o.id} onClick={() => seleccionar(o)}
                                        className={`w-full rounded-lg border p-3 text-left transition-all ${seleccionada?.id === o.id
                                            ? "border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/10"
                                            : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{o.nombre}</p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">{o.solicitante.nombre}</p>
                                                {o.proyecto && <p className="truncate text-xs text-gray-400">📁 {o.proyecto.nombre}</p>}
                                            </div>
                                            <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${o.tipoCompra === 'NACIONAL'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {o.tipoCompra === 'NACIONAL' ? '🇭🇳' : '🌍'}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>{o.productosCompletados}/{o.totalProductos} completados</span>
                                                <span>{o.progreso}%</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div className={`h-full rounded-full transition-all ${o.progreso === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                                                    style={{ width: `${o.progreso}%` }} />
                                            </div>
                                        </div>
                                        <p className="mt-1 text-[10px] text-gray-400">{formatDate(o.fechaSolicitud)}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Panel derecho — detalle */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        {seleccionada ? (
                            <>
                                {/* Header */}
                                <div className="rounded-lg border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{seleccionada.nombre}</h2>
                                            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                                                <span>{seleccionada.solicitante.nombre}</span>
                                                {seleccionada.proyecto && <span>• {seleccionada.proyecto.nombre}</span>}
                                                <span>• {seleccionada.tipoCompra}</span>
                                                <span>• Límite: {formatDate(seleccionada.fechaLimite)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {seleccionada.productos?.filter(p => p.progreso === 100).length || 0}/{seleccionada.productos?.length || 0}
                                            </span>
                                            <button onClick={() => setShowArchivarModal(true)}
                                                className="rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400">
                                                📁 Archivar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Productos */}
                                <div className="flex-1 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                                    {loadingDetalle ? (
                                        <div className="flex h-40 items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {seleccionada.productos?.map((p) => {
                                                const estados = p.estadosAplicables || [];
                                                const siguienteIdx = estados.indexOf(p.estadoActual) + 1;
                                                const siguiente = siguienteIdx < estados.length ? estados[siguienteIdx] : null;

                                                return (
                                                    <div key={p.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-xs text-gray-500">{p.sku}</span>
                                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.progreso === 100
                                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                                        {ESTADOS_LABELS[p.estadoActual] || p.estadoActual} • {p.progreso}%
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{p.descripcion}</p>
                                                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                                                    {p.proveedor && <span>🏢 {p.proveedor}</span>}
                                                                    {p.precioTotal && <span>💰 {formatCurrency(p.precioTotal)}</span>}
                                                                    {p.responsable?.nombre && <span>👤 {p.responsable.nombre}</span>}
                                                                </div>
                                                            </div>
                                                            {siguiente && p.progreso < 100 && (
                                                                <button onClick={() => handleAvanzar(p.id)}
                                                                    disabled={actionLoading === p.id}
                                                                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                                                                    {actionLoading === p.id ? "..." : `▶ ${ESTADOS_LABELS[siguiente] || siguiente}`}
                                                                </button>
                                                            )}
                                                            {p.progreso === 100 && (
                                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Completado</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            {estados.map((estado, i) => (
                                                                <div key={estado} className="flex-1" title={`${ESTADOS_ICONOS[estado] || ''} ${ESTADOS_LABELS[estado] || estado}`}>
                                                                    <div className={`h-2 rounded-full ${p[estado] ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'} ${i === 0 ? 'rounded-l-full' : ''} ${i === estados.length - 1 ? 'rounded-r-full' : ''}`} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-400">Selecciona una oferta</p>
                                    <p className="text-sm text-gray-400 mt-1">Haz clic en una de la lista para ver el seguimiento</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal archivar */}
                {showArchivarModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📁 Archivar Oferta</h3>
                            <p className="text-sm text-gray-500 mb-4">Motivo del archivo:</p>
                            <textarea value={motivoArchivo} onChange={(e) => setMotivoArchivo(e.target.value)}
                                rows={3} autoFocus placeholder="Ej: Oferta no aceptada por el cliente..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white mb-4" />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowArchivarModal(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
                                <button onClick={handleArchivar} disabled={!motivoArchivo.trim()}
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">Archivar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}