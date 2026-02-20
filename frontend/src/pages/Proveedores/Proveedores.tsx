import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
    Plus, X, Search, Edit2, Trash2, Building2, Mail, Phone, MapPin, Hash,
    CheckCircle2, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Proveedor = {
    id: string;
    nombre: string;
    rtn?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    activo: boolean;
    creado: string;
    _count?: { precios: number; compraDetalles: number };
};

const api = {
    token: () => getToken(),
    async list(params?: Record<string, string>) {
        const token = this.token();
        const qs = new URLSearchParams(params).toString();
        const r = await fetch(`${API}/api/v1/proveedores?${qs}`, { credentials: "include", headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) throw new Error("Error al cargar proveedores");
        return r.json();
    },
    async create(data: Partial<Proveedor>) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/proveedores`, {
            method: "POST", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al crear"); }
        return r.json();
    },
    async update(id: string, data: Partial<Proveedor>) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/proveedores/${id}`, {
            method: "PATCH", credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Error al actualizar"); }
        return r.json();
    },
    async remove(id: string) {
        const token = this.token();
        const r = await fetch(`${API}/api/v1/proveedores/${id}`, {
            method: "DELETE", credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error("Error al eliminar");
        return r.json();
    },
};

export default function Proveedores() {
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const esAdmin = user?.rol?.nombre.toLowerCase().includes("admin") || user?.rol?.nombre.toLowerCase().includes("supervisor");

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtroActivo, setFiltroActivo] = useState("");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState<Proveedor | null>(null);
    const [form, setForm] = useState({ nombre: "", rtn: "", email: "", telefono: "", direccion: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { cargar(); }, [page, filtroActivo]);

    const cargar = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = { page: String(page), pageSize: "20" };
            if (search) params.search = search;
            if (filtroActivo !== "") params.activo = filtroActivo;
            const data = await api.list(params);
            setProveedores(data.items);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch { addNotification("danger", "Error", "Error al cargar proveedores"); }
        finally { setLoading(false); }
    };

    const handleSearch = () => { setPage(1); cargar(); };

    const abrirCrear = () => {
        setEditando(null);
        setForm({ nombre: "", rtn: "", email: "", telefono: "", direccion: "" });
        setShowModal(true);
    };

    const abrirEditar = (p: Proveedor) => {
        setEditando(p);
        setForm({ nombre: p.nombre, rtn: p.rtn || "", email: p.email || "", telefono: p.telefono || "", direccion: p.direccion || "" });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim()) { toast.error("El nombre es requerido"); return; }
        setSaving(true);
        const toastId = toast.loading(editando ? "Actualizando..." : "Creando...");
        try {
            if (editando) {
                await api.update(editando.id, form);
                toast.success("Proveedor actualizado", { id: toastId });
            } else {
                await api.create(form);
                toast.success("Proveedor creado", { id: toastId });
            }
            setShowModal(false);
            cargar();
        } catch (e: any) { toast.error(e.message, { id: toastId }); }
        finally { setSaving(false); }
    };

    const handleDelete = async (p: Proveedor) => {
        const msg = (p._count?.precios || 0) > 0 || (p._count?.compraDetalles || 0) > 0
            ? `"${p.nombre}" tiene relaciones. Se desactivará en lugar de eliminar. ¿Continuar?`
            : `¿Eliminar "${p.nombre}"?`;
        if (!confirm(msg)) return;
        const toastId = toast.loading("Eliminando...");
        try { await api.remove(p.id); toast.success("Proveedor eliminado/desactivado", { id: toastId }); cargar(); }
        catch (e: any) { toast.error(e.message, { id: toastId }); }
    };

    const handleToggleActivo = async (p: Proveedor) => {
        try {
            await api.update(p.id, { activo: !p.activo });
            toast.success(p.activo ? "Proveedor desactivado" : "Proveedor activado");
            cargar();
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <>
            <PageMeta title="Proveedores" description="Gestión de proveedores" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏢 Proveedores</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Gestión y administración de proveedores ({total})</p>
                    </div>
                    {esAdmin && (
                        <button onClick={abrirCrear}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                            <Plus size={16} /> Nuevo Proveedor
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Buscar por nombre, email o RTN..." value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <select value={filtroActivo} onChange={(e) => { setFiltroActivo(e.target.value); setPage(1); }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                    <button onClick={handleSearch} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                        Buscar
                    </button>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">RTN</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Contacto</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">Estado</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">Cotizaciones</th>
                                    {esAdmin && <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan={6} className="py-12 text-center">
                                        <div className="flex items-center justify-center gap-2"><div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /> Cargando...</div>
                                    </td></tr>
                                ) : proveedores.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-gray-500">No hay proveedores</td></tr>
                                ) : proveedores.map((p) => (
                                    <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!p.activo ? "opacity-50" : ""}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">{p.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.rtn || "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5">
                                                {p.email && <div className="flex items-center gap-1 text-xs text-gray-500"><Mail size={12} />{p.email}</div>}
                                                {p.telefono && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone size={12} />{p.telefono}</div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => esAdmin && handleToggleActivo(p)} title={esAdmin ? "Click para cambiar" : ""}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${p.activo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"} ${esAdmin ? "cursor-pointer hover:opacity-80" : ""}`}>
                                                {p.activo ? <><CheckCircle2 size={12} /> Activo</> : <><XCircle size={12} /> Inactivo</>}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                                            {(p._count?.precios || 0) + (p._count?.compraDetalles || 0)}
                                        </td>
                                        {esAdmin && (
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <span className="text-sm text-gray-500">Página {page} de {totalPages} ({total} proveedores)</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"><ChevronLeft size={14} /></button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editando ? "Editar Proveedor" : "Nuevo Proveedor"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="rounded-full p-1 text-gray-400 hover:text-red-500"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                                <input type="text" value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="Nombre del proveedor" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RTN</label>
                                    <input type="text" value={form.rtn} onChange={(e) => setForm(f => ({ ...f, rtn: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder="RTN" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                    <input type="text" value={form.telefono} onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        placeholder="+504 ..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="proveedor@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                                <input type="text" value={form.direccion} onChange={(e) => setForm(f => ({ ...f, direccion: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    placeholder="Dirección del proveedor" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
                            <button onClick={() => setShowModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Cancelar</button>
                            <button onClick={handleSubmit} disabled={saving || !form.nombre.trim()}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                {saving ? "Guardando..." : editando ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}