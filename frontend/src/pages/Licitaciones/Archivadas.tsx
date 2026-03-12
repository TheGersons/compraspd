import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Licitacion = {
    id: string; nombre: string; estado: string; motivoArchivo?: string;
    fechaArchivo?: string; tipoCompra: string; creado: string;
    solicitante: { nombre: string }; proyecto?: { nombre: string } | null;
    totalProductos: number; productosCompletados: number; progreso: number;
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" }) : "";

const api = {
    async getLicitaciones(estado: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/licitaciones?estado=${estado}`, {
            credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error");
        return r.json();
    },
    async reactivar(id: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/licitaciones/${id}/reactivar`, {
            method: "PATCH", credentials: "include", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error");
        return r.json();
    },
    async rechazar(id: string, motivo: string) {
        const token = getToken();
        const r = await fetch(`${API}/api/v1/licitaciones/${id}/rechazar`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ motivo }),
        });
        if (!r.ok) throw new Error("Error");
        return r.json();
    },
};

export default function LicitacionesArchivo() {
    const [archivadas, setArchivadas] = useState<Licitacion[]>([]);
    const [rechazadas, setRechazadas] = useState<Licitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"archivadas" | "rechazadas">("archivadas");
    const [searchQuery, setSearchQuery] = useState("");
    const [showRechazoModal, setShowRechazoModal] = useState<string | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            setLoading(true);
            const [arch, rech] = await Promise.all([api.getLicitaciones("ARCHIVADA"), api.getLicitaciones("RECHAZADA")]);
            setArchivadas(arch); setRechazadas(rech);
        } catch { toast.error("Error al cargar"); }
        finally { setLoading(false); }
    };

    const handleReactivar = async (id: string) => {
        if (!confirm("Reactivar esta licitacion?")) return;
        try { await api.reactivar(id); toast.success("Reactivada"); await cargar(); }
        catch { toast.error("Error"); }
    };

    const handleRechazar = async () => {
        if (!showRechazoModal || !motivoRechazo.trim()) return;
        try {
            await api.rechazar(showRechazoModal, motivoRechazo.trim());
            toast.success("Rechazada"); setShowRechazoModal(null); setMotivoRechazo(""); await cargar();
        } catch { toast.error("Error"); }
    };

    const items = tab === "archivadas" ? archivadas : rechazadas;
    const filtradas = items.filter(l => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return l.nombre.toLowerCase().includes(q) || l.solicitante.nombre.toLowerCase().includes(q);
    });

    return (
        <>
            <PageMeta title="Archivo de Licitaciones" description="Licitaciones archivadas y rechazadas" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📁 Archivo de Licitaciones</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Licitaciones archivadas y rechazadas</p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => setTab("archivadas")}
                        className={`rounded-xl border px-4 py-3 text-left transition-all ${tab === "archivadas" ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{archivadas.length}</p>
                        <p className="text-xs text-gray-500">📁 Archivadas</p>
                    </button>
                    <button onClick={() => setTab("rechazadas")}
                        className={`rounded-xl border px-4 py-3 text-left transition-all ${tab === "rechazadas" ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{rechazadas.length}</p>
                        <p className="text-xs text-gray-500">❌ Rechazadas</p>
                    </button>
                </div>

                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <p className="text-gray-500">No hay licitaciones {tab}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtradas.map((lic) => (
                            <div key={lic.id} className={`rounded-xl border p-4 ${tab === "archivadas" ? "border-orange-200 dark:border-orange-800/50" : "border-red-200 dark:border-red-800/50"} bg-white dark:bg-gray-900`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{lic.nombre}</h3>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tab === "archivadas" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                {lic.estado}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                            <span>{lic.solicitante.nombre}</span>
                                            {lic.proyecto && <span>• {lic.proyecto.nombre}</span>}
                                            <span>• {lic.totalProductos} productos</span>
                                            <span>• {lic.progreso}%</span>
                                        </div>
                                        {lic.motivoArchivo && (
                                            <p className={`rounded-lg p-2 text-xs ${tab === "archivadas" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                                                <strong>Motivo:</strong> {lic.motivoArchivo}
                                            </p>
                                        )}
                                        {lic.fechaArchivo && <p className="mt-1 text-[10px] text-gray-400">{formatDate(lic.fechaArchivo)}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {tab === "archivadas" && (
                                            <button onClick={() => { setShowRechazoModal(lic.id); setMotivoRechazo(""); }}
                                                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400">
                                                Rechazar
                                            </button>
                                        )}
                                        <button onClick={() => handleReactivar(lic.id)}
                                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                                            Reactivar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showRechazoModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rechazar Licitacion</h3>
                        <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)}
                            rows={3} autoFocus placeholder="Motivo del rechazo..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white mb-4" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRechazoModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-gray-300">Cancelar</button>
                            <button onClick={handleRechazar} disabled={!motivoRechazo.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">Rechazar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}