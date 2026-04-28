import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Edit3, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Modal } from "../../components/ui/modal";
import { SearchableSelect } from "../../components/ui/searchable-select";
import Button from "../../components/ui/button/Button";
import { getToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================================================
// TIPOS
// ============================================================================

type Conteos = {
  detalles: number;
  estadosProductos: number;
  ordenesCompra: number;
  compras: number;
  compraDetalles: number;
  historial: number;
  mensajes: number;
  participantesChat: number;
  adjuntos: number;
  documentosAdjuntos: number;
  historialFechas: number;
  seguimientos: number;
  licitacionProductos: number;
  ofertaProductos: number;
  reporteCompraLogs: number;
  seguimientoIntLogs: number;
};

interface CotizacionListItem {
  id: string;
  nombreCotizacion: string;
  tipoCompra: string;
  estado: string;
  fechaSolicitud: string;
  fechaLimite: string;
  ordenCompra: string | null;
  solicitante: { id: string; nombre: string } | null;
  supervisorResponsable: { id: string; nombre: string } | null;
  proyecto: { id: string; nombre: string } | null;
  tipo: { id: string; nombre: string; area: { id: string; nombreArea: string } | null } | null;
  moneda: { id: string; codigo: string } | null;
  _count: {
    detalles: number;
    estadosProductos: number;
    compras: number;
    ordenesCompra: number;
    historial: number;
  };
}

interface Catalogos {
  tipos: { id: string; nombre: string; area: { id: string; nombreArea: string } | null }[];
  proyectos: { id: string; nombre: string; areaId: string; tipoId: string | null }[];
  monedas: { id: string; codigo: string; nombre: string }[];
  usuarios: { id: string; nombre: string; email: string; rol: { nombre: string } | null }[];
  paises: { id: string; nombre: string; codigo: string }[];
}

interface DetalleCotizacion {
  id: string;
  nombreCotizacion: string;
  tipoCompra: string;
  estado: string;
  comentarios: string | null;
  ordenCompra: string | null;
  fechaLimite: string;
  fechaEstimada: string;
  fechaSolicitud: string;
  lugarEntrega: string;
  solicitante: { id: string; nombre: string; email: string } | null;
  supervisorResponsable: { id: string; nombre: string; email: string } | null;
  proyecto: { id: string; nombre: string; areaId: string; area: { id: string; nombreArea: string } | null } | null;
  tipo: { id: string; nombre: string; area: { id: string; nombreArea: string } | null } | null;
  moneda: { id: string; codigo: string; nombre: string } | null;
  chat: { id: string; _count: { mensajes: number; participantes: number } } | null;
  detalles: any[];
  estadosProductos: EstadoProductoDetalle[];
  ordenesCompra: { id: string; nombre: string; numeroOC: string | null; estado: string }[];
  compras: { id: string; estado: string; creacion: string; _count: { detalles: number } }[];
  historial: { id: string; accion: string; creado: string; usuario: { nombre: string } }[];
  licitacion: { id: string; nombre: string; estado: string } | null;
  oferta: { id: string; nombre: string; estado: string } | null;
  reporte: { id: string; numeroPO: string | null } | null;
  seguimientoInternacional: { id: string; numeroOC: string | null } | null;
  _count: any;
}

interface EstadoProductoDetalle {
  id: string;
  sku: string;
  descripcion: string;
  cantidad: number | null;
  proveedor: string | null;
  precioUnitario: string | number | null;
  precioTotal: string | number | null;
  paisOrigenId: string | null;
  paisOrigen: { id: string; nombre: string } | null;
  monedaId: string | null;
  moneda: { id: string; codigo: string } | null;
  responsableSeguimiento: { id: string; nombre: string } | null;
  estadoGeneral: string;
  criticidad: number;
  ordenCompra: { id: string; nombre: string; numeroOC: string | null } | null;
}

// ============================================================================
// API
// ============================================================================

const api = {
  async list(params: { search?: string; estado?: string; tipoCompra?: string; page?: number; pageSize?: number }) {
    const token = await getToken();
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    if (params.estado) search.set("estado", params.estado);
    if (params.tipoCompra) search.set("tipoCompra", params.tipoCompra);
    if (params.page) search.set("page", String(params.page));
    if (params.pageSize) search.set("pageSize", String(params.pageSize));
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones?${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("No se pudo cargar el listado");
    return r.json();
  },
  async catalogos(): Promise<Catalogos> {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/catalogos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("No se pudieron cargar catálogos");
    return r.json();
  },
  async detalle(id: string): Promise<DetalleCotizacion> {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("No se pudo cargar el detalle");
    return r.json();
  },
  async resumenEliminacion(id: string): Promise<{ id: string; nombreCotizacion: string; tieneChat: boolean; conteos: Conteos }> {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/${id}/resumen-eliminacion`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("No se pudo cargar el resumen");
    return r.json();
  },
  async updateCotizacion(id: string, data: Record<string, any>) {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message || "Error al actualizar la cotización");
    }
    return r.json();
  },
  async updateProducto(id: string, data: Record<string, any>) {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/estado-producto/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message || "Error al actualizar el producto");
    }
    return r.json();
  },
  async deleteCotizacion(id: string, password: string, motivo?: string) {
    const token = await getToken();
    const r = await fetch(`${API_BASE_URL}/api/v1/admin/cotizaciones/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password, motivo }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message || "Error al eliminar la cotización");
    }
    return r.json();
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function fmtDecimal(v: string | number | null | undefined) {
  if (v == null || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminCotizaciones() {
  const { user } = useAuth();
  const isAdmin = (user?.rol?.nombre || "").toUpperCase() === "ADMIN";

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [estado, setEstado] = useState<string>("");
  const [tipoCompra, setTipoCompra] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [items, setItems] = useState<CotizacionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);

  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<DetalleCotizacion | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [eliminarId, setEliminarId] = useState<string | null>(null);

  // Cargar catálogos una vez
  useEffect(() => {
    if (!isAdmin) return;
    api.catalogos().then(setCatalogos).catch((e) => toast.error(e.message));
  }, [isAdmin]);

  const cargarLista = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const data = await api.list({ search, estado, tipoCompra, page, pageSize });
      setItems(data.items);
      setTotal(data.total);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, estado, tipoCompra, page, pageSize]);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const abrirDetalle = async (id: string) => {
    setDetalleId(id);
    setDetalle(null);
    setLoadingDetalle(true);
    try {
      const d = await api.detalle(id);
      setDetalle(d);
    } catch (e: any) {
      toast.error(e.message);
      setDetalleId(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const refrescarDetalle = async () => {
    if (!detalleId) return;
    setLoadingDetalle(true);
    try {
      const d = await api.detalle(detalleId);
      setDetalle(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingDetalle(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Solo usuarios con rol ADMIN pueden acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100">Administración de Cotizaciones</h1>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              Página de uso administrativo. Las acciones aquí son <span className="font-semibold">irreversibles</span> y afectan
              cotizaciones completas: chat, productos, compras, órdenes de compra, historial, licitaciones, ofertas y reportes asociados.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Buscar (nombre, OC, solicitante, proyecto)</label>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Escribe y presiona Enter…"
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => { setPage(1); setSearch(searchInput); }}>
                Buscar
              </Button>
              {(searchInput || search) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Estado</label>
            <select
              value={estado}
              onChange={(e) => { setEstado(e.target.value); setPage(1); }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EN_CONFIGURACION">EN_CONFIGURACION</option>
              <option value="APROBADA_PARCIAL">APROBADA_PARCIAL</option>
              <option value="APROBADA_COMPLETA">APROBADA_COMPLETA</option>
              <option value="EN_PROCESO">EN_PROCESO</option>
              <option value="COMPLETADA">COMPLETADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo</label>
            <select
              value={tipoCompra}
              onChange={(e) => { setTipoCompra(e.target.value); setPage(1); }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="NACIONAL">NACIONAL</option>
              <option value="INTERNACIONAL">INTERNACIONAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Nombre / OC</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Solicitante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Proyecto</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Estado</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Productos</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Compras</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Solicitada</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">Cargando…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">No hay cotizaciones que coincidan</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{c.nombreCotizacion}</div>
                      {c.ordenCompra && (
                        <div className="text-xs font-mono text-gray-500">OC: {c.ordenCompra}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.tipoCompra === "INTERNACIONAL" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"}`}>
                        {c.tipoCompra}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.solicitante?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{c.proyecto?.nombre ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{c._count.estadosProductos}</td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{c._count.compras}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmt(c.fechaSolicitud)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirDetalle(c.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          <Edit3 size={12} /> Detalle/Editar
                        </button>
                        <button
                          onClick={() => setEliminarId(c.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
          <div>
            Mostrando {items.length} de {total} cotizaciones
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50 dark:border-gray-600"
            >
              ← Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50 dark:border-gray-600"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Modal detalle */}
      {detalleId && (
        <Modal
          isOpen={!!detalleId}
          onClose={() => { setDetalleId(null); setDetalle(null); }}
          className="max-w-6xl mx-4 my-4 max-h-[92vh] overflow-hidden"
        >
          {loadingDetalle && !detalle ? (
            <div className="p-8 text-center text-gray-500">Cargando detalle…</div>
          ) : detalle ? (
            <DetalleEditor
              detalle={detalle}
              catalogos={catalogos}
              onUpdate={async (data) => {
                await api.updateCotizacion(detalle.id, data);
                toast.success("Cotización actualizada");
                await Promise.all([refrescarDetalle(), cargarLista()]);
              }}
              onUpdateProducto={async (id, data) => {
                await api.updateProducto(id, data);
                toast.success("Producto actualizado");
                await refrescarDetalle();
              }}
              onRefrescar={refrescarDetalle}
            />
          ) : null}
        </Modal>
      )}

      {/* Modal eliminar */}
      {eliminarId && (
        <ConfirmacionEliminar
          cotizacionId={eliminarId}
          onClose={() => setEliminarId(null)}
          onSuccess={() => {
            setEliminarId(null);
            if (detalleId === eliminarId) {
              setDetalleId(null);
              setDetalle(null);
            }
            cargarLista();
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// EDITOR DE DETALLE
// ============================================================================

function DetalleEditor({
  detalle,
  catalogos,
  onUpdate,
  onUpdateProducto,
  onRefrescar,
}: {
  detalle: DetalleCotizacion;
  catalogos: Catalogos | null;
  onUpdate: (data: Record<string, any>) => Promise<void>;
  onUpdateProducto: (id: string, data: Record<string, any>) => Promise<void>;
  onRefrescar: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"general" | "productos" | "compras" | "chat" | "historial">("general");
  const [savingGeneral, setSavingGeneral] = useState(false);

  const [form, setForm] = useState({
    nombreCotizacion: detalle.nombreCotizacion,
    tipoCompra: detalle.tipoCompra,
    estado: detalle.estado,
    lugarEntrega: detalle.lugarEntrega,
    proyectoId: detalle.proyecto?.id ?? "",
    tipoId: detalle.tipo?.id ?? "",
    solicitanteId: detalle.solicitante?.id ?? "",
    supervisorResponsableId: detalle.supervisorResponsable?.id ?? "",
    monedaId: detalle.moneda?.id ?? "",
    ordenCompra: detalle.ordenCompra ?? "",
    fechaLimite: detalle.fechaLimite ? detalle.fechaLimite.slice(0, 10) : "",
    fechaEstimada: detalle.fechaEstimada ? detalle.fechaEstimada.slice(0, 10) : "",
    comentarios: detalle.comentarios ?? "",
  });

  // Mantener form sincronizado al refrescar detalle (cuando cambie de id)
  useEffect(() => {
    setForm({
      nombreCotizacion: detalle.nombreCotizacion,
      tipoCompra: detalle.tipoCompra,
      estado: detalle.estado,
      lugarEntrega: detalle.lugarEntrega,
      proyectoId: detalle.proyecto?.id ?? "",
      tipoId: detalle.tipo?.id ?? "",
      solicitanteId: detalle.solicitante?.id ?? "",
      supervisorResponsableId: detalle.supervisorResponsable?.id ?? "",
      monedaId: detalle.moneda?.id ?? "",
      ordenCompra: detalle.ordenCompra ?? "",
      fechaLimite: detalle.fechaLimite ? detalle.fechaLimite.slice(0, 10) : "",
      fechaEstimada: detalle.fechaEstimada ? detalle.fechaEstimada.slice(0, 10) : "",
      comentarios: detalle.comentarios ?? "",
    });
  }, [detalle.id]);

  const guardar = async () => {
    setSavingGeneral(true);
    try {
      const payload: Record<string, any> = {
        nombreCotizacion: form.nombreCotizacion,
        tipoCompra: form.tipoCompra,
        estado: form.estado,
        lugarEntrega: form.lugarEntrega,
        ordenCompra: form.ordenCompra || undefined,
        comentarios: form.comentarios,
      };
      if (form.tipoId) payload.tipoId = form.tipoId;
      if (form.solicitanteId) payload.solicitanteId = form.solicitanteId;
      payload.supervisorResponsableId = form.supervisorResponsableId || null;
      payload.proyectoId = form.proyectoId || null;
      payload.monedaId = form.monedaId || null;
      if (form.fechaLimite) payload.fechaLimite = new Date(form.fechaLimite).toISOString();
      if (form.fechaEstimada) payload.fechaEstimada = new Date(form.fechaEstimada).toISOString();

      await onUpdate(payload);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingGeneral(false);
    }
  };

  const usuariosOptions = useMemo(
    () => (catalogos?.usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre })),
    [catalogos]
  );
  const proyectosOptions = useMemo(
    () => (catalogos?.proyectos ?? []).map((p) => ({ id: p.id, nombre: p.nombre })),
    [catalogos]
  );
  const tiposOptions = useMemo(
    () => (catalogos?.tipos ?? []).map((t) => ({ id: t.id, nombre: `${t.nombre} (${t.area?.nombreArea ?? "—"})` })),
    [catalogos]
  );
  const monedasOptions = useMemo(
    () => (catalogos?.monedas ?? []).map((m) => ({ id: m.id, nombre: `${m.codigo} — ${m.nombre}` })),
    [catalogos]
  );

  return (
    <div className="flex max-h-[92vh] flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{detalle.nombreCotizacion}</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              ID: <span className="font-mono">{detalle.id}</span>
            </p>
          </div>
          <button
            onClick={onRefrescar}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            title="Recargar detalle"
          >
            <RefreshCw size={12} /> Refrescar
          </button>
        </div>
        {/* Tabs */}
        <div className="mt-3 flex gap-2 border-b border-gray-100 dark:border-gray-700">
          {(["general", "productos", "compras", "chat", "historial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              {t === "general" ? "General" : t === "productos" ? `Productos (${detalle.estadosProductos.length})` : t === "compras" ? `Compras (${detalle.compras.length})` : t === "chat" ? "Chat" : "Historial"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nombre de la cotización">
                <input
                  type="text"
                  value={form.nombreCotizacion}
                  onChange={(e) => setForm({ ...form, nombreCotizacion: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </Field>
              <Field label="Orden de compra (cabecera)">
                <input
                  type="text"
                  value={form.ordenCompra}
                  onChange={(e) => setForm({ ...form, ordenCompra: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </Field>
              <Field label="Tipo de compra">
                <select
                  value={form.tipoCompra}
                  onChange={(e) => setForm({ ...form, tipoCompra: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="NACIONAL">NACIONAL</option>
                  <option value="INTERNACIONAL">INTERNACIONAL</option>
                </select>
              </Field>
              <Field label="Lugar de entrega">
                <select
                  value={form.lugarEntrega}
                  onChange={(e) => setForm({ ...form, lugarEntrega: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="ALMACEN">ALMACÉN</option>
                  <option value="PROYECTO">PROYECTO</option>
                  <option value="OFICINA">OFICINA</option>
                </select>
              </Field>
              <Field label="Estado">
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EN_CONFIGURACION">EN_CONFIGURACION</option>
                  <option value="APROBADA_PARCIAL">APROBADA_PARCIAL</option>
                  <option value="APROBADA_COMPLETA">APROBADA_COMPLETA</option>
                  <option value="EN_PROCESO">EN_PROCESO</option>
                  <option value="COMPLETADA">COMPLETADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </Field>
              <Field label="Solicitante">
                <SearchableSelect
                  value={form.solicitanteId}
                  onChange={(v) => setForm({ ...form, solicitanteId: v })}
                  options={usuariosOptions}
                  allLabel="Sin cambios"
                  allValue=""
                  placeholder="Seleccionar"
                />
              </Field>
              <Field label="Supervisor responsable">
                <SearchableSelect
                  value={form.supervisorResponsableId}
                  onChange={(v) => setForm({ ...form, supervisorResponsableId: v })}
                  options={usuariosOptions}
                  allLabel="Sin asignar"
                  allValue=""
                  placeholder="Seleccionar"
                />
              </Field>
              <Field label="Proyecto" hint="Cambiar también propaga a productos">
                <SearchableSelect
                  value={form.proyectoId}
                  onChange={(v) => setForm({ ...form, proyectoId: v })}
                  options={proyectosOptions}
                  allLabel="Sin proyecto"
                  allValue=""
                  placeholder="Seleccionar"
                />
              </Field>
              <Field label="Tipo / categoría">
                <SearchableSelect
                  value={form.tipoId}
                  onChange={(v) => setForm({ ...form, tipoId: v })}
                  options={tiposOptions}
                  allLabel="Sin cambios"
                  allValue=""
                  placeholder="Seleccionar"
                />
              </Field>
              <Field label="Moneda">
                <SearchableSelect
                  value={form.monedaId}
                  onChange={(v) => setForm({ ...form, monedaId: v })}
                  options={monedasOptions}
                  allLabel="Sin moneda"
                  allValue=""
                  placeholder="Seleccionar"
                />
              </Field>
              <Field label="Fecha límite">
                <input
                  type="date"
                  value={form.fechaLimite}
                  onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </Field>
              <Field label="Fecha estimada">
                <input
                  type="date"
                  value={form.fechaEstimada}
                  onChange={(e) => setForm({ ...form, fechaEstimada: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </Field>
            </div>
            <Field label="Comentarios">
              <textarea
                rows={3}
                value={form.comentarios}
                onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={guardar} variant="primary" size="sm" disabled={savingGeneral}>
                {savingGeneral ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        )}

        {tab === "productos" && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">SKU</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Descripción</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-200">Cantidad</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Proveedor</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-200">Precio Unit.</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-200">Precio Total</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">OC</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {detalle.estadosProductos.map((p) => (
                  <ProductoRow key={p.id} producto={p} catalogos={catalogos} onUpdateProducto={onUpdateProducto} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "compras" && (
          <div className="space-y-3">
            {detalle.compras.length === 0 ? (
              <p className="text-sm text-gray-500">No hay compras asociadas.</p>
            ) : (
              detalle.compras.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{c.estado}</p>
                      <p className="text-xs text-gray-500">ID: <span className="font-mono">{c.id}</span></p>
                    </div>
                    <p className="text-xs text-gray-500">{c._count.detalles} detalle(s) · {fmt(c.creacion)}</p>
                  </div>
                </div>
              ))
            )}
            {detalle.ordenesCompra.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Órdenes de compra</h3>
                <ul className="space-y-1">
                  {detalle.ordenesCompra.map((o) => (
                    <li key={o.id} className="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                      <span className="font-medium">{o.nombre}</span>
                      {o.numeroOC && <span className="ml-2 font-mono text-xs text-gray-500">#{o.numeroOC}</span>}
                      <span className="ml-2 text-xs text-gray-500">({o.estado})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div>
            {detalle.chat ? (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Chat asociado: <span className="font-mono text-xs">{detalle.chat.id}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {detalle.chat._count.mensajes} mensajes · {detalle.chat._count.participantes} participantes
                </p>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Al eliminar la cotización se eliminará también este chat con sus mensajes y adjuntos.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Esta cotización no tiene chat asociado.</p>
            )}
          </div>
        )}

        {tab === "historial" && (
          <div className="space-y-2">
            {detalle.historial.length === 0 ? (
              <p className="text-sm text-gray-500">Sin historial registrado.</p>
            ) : (
              detalle.historial.map((h) => (
                <div key={h.id} className="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{h.accion}</span>
                    <span className="text-xs text-gray-500">{fmt(h.creado)}</span>
                  </div>
                  {h.usuario && <p className="text-xs text-gray-500">por {h.usuario.nombre}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Fila editable de producto
// ============================================================================

function ProductoRow({
  producto,
  catalogos,
  onUpdateProducto,
}: {
  producto: EstadoProductoDetalle;
  catalogos: Catalogos | null;
  onUpdateProducto: (id: string, data: Record<string, any>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    sku: producto.sku,
    descripcion: producto.descripcion,
    cantidad: producto.cantidad ?? 0,
    proveedor: producto.proveedor ?? "",
    precioUnitario: producto.precioUnitario != null ? String(producto.precioUnitario) : "",
    precioTotal: producto.precioTotal != null ? String(producto.precioTotal) : "",
    monedaId: producto.monedaId ?? "",
    paisOrigenId: producto.paisOrigenId ?? "",
    responsableSeguimientoId: producto.responsableSeguimiento?.id ?? "",
  });

  const monedas = useMemo(() => (catalogos?.monedas ?? []).map((m) => ({ id: m.id, nombre: `${m.codigo} — ${m.nombre}` })), [catalogos]);
  const paises = useMemo(() => (catalogos?.paises ?? []).map((p) => ({ id: p.id, nombre: p.nombre })), [catalogos]);
  const usuarios = useMemo(() => (catalogos?.usuarios ?? []).map((u) => ({ id: u.id, nombre: u.nombre })), [catalogos]);

  const guardar = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        sku: data.sku,
        descripcion: data.descripcion,
        cantidad: Number(data.cantidad) || 0,
        proveedor: data.proveedor || undefined,
        precioUnitario: data.precioUnitario !== "" ? Number(data.precioUnitario) : undefined,
        precioTotal: data.precioTotal !== "" ? Number(data.precioTotal) : undefined,
        monedaId: data.monedaId || null,
        paisOrigenId: data.paisOrigenId || null,
        responsableSeguimientoId: data.responsableSeguimientoId || null,
      };
      await onUpdateProducto(producto.id, payload);
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <td className="px-3 py-2 font-mono text-xs">{producto.sku}</td>
        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{producto.descripcion}</td>
        <td className="px-3 py-2 text-right">{producto.cantidad ?? "—"}</td>
        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{producto.proveedor ?? "—"}</td>
        <td className="px-3 py-2 text-right">{fmtDecimal(producto.precioUnitario)}</td>
        <td className="px-3 py-2 text-right">{fmtDecimal(producto.precioTotal)}</td>
        <td className="px-3 py-2 text-xs text-gray-500">{producto.ordenCompra?.numeroOC ?? producto.ordenCompra?.nombre ?? "—"}</td>
        <td className="px-3 py-2 text-right">
          <button onClick={() => setEditing(true)} className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            Editar
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-blue-50/30 dark:bg-blue-900/10">
      <td className="px-2 py-2"><input className="w-full rounded border px-2 py-1 text-xs" value={data.sku} onChange={(e) => setData({ ...data, sku: e.target.value })} /></td>
      <td className="px-2 py-2"><input className="w-full rounded border px-2 py-1 text-xs" value={data.descripcion} onChange={(e) => setData({ ...data, descripcion: e.target.value })} /></td>
      <td className="px-2 py-2 text-right"><input type="number" className="w-20 rounded border px-2 py-1 text-xs text-right" value={data.cantidad} onChange={(e) => setData({ ...data, cantidad: e.target.value as any })} /></td>
      <td className="px-2 py-2"><input className="w-full rounded border px-2 py-1 text-xs" value={data.proveedor} onChange={(e) => setData({ ...data, proveedor: e.target.value })} /></td>
      <td className="px-2 py-2 text-right"><input type="number" step="any" className="w-24 rounded border px-2 py-1 text-xs text-right" value={data.precioUnitario} onChange={(e) => setData({ ...data, precioUnitario: e.target.value })} /></td>
      <td className="px-2 py-2 text-right"><input type="number" step="any" className="w-24 rounded border px-2 py-1 text-xs text-right" value={data.precioTotal} onChange={(e) => setData({ ...data, precioTotal: e.target.value })} /></td>
      <td className="px-2 py-2">
        <div className="space-y-1">
          <SearchableSelect value={data.monedaId} onChange={(v) => setData({ ...data, monedaId: v })} options={monedas} allLabel="Sin moneda" allValue="" placeholder="Moneda" className="w-full" />
          <SearchableSelect value={data.paisOrigenId} onChange={(v) => setData({ ...data, paisOrigenId: v })} options={paises} allLabel="Sin país" allValue="" placeholder="País" className="w-full" />
          <SearchableSelect value={data.responsableSeguimientoId} onChange={(v) => setData({ ...data, responsableSeguimientoId: v })} options={usuarios} allLabel="Sin responsable" allValue="" placeholder="Responsable" className="w-full" />
        </div>
      </td>
      <td className="px-2 py-2 text-right">
        <div className="flex justify-end gap-1">
          <button disabled={saving} onClick={guardar} className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
            {saving ? "…" : "Guardar"}
          </button>
          <button onClick={() => setEditing(false)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <X size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// Modal de confirmación de eliminación
// ============================================================================

function ConfirmacionEliminar({
  cotizacionId,
  onClose,
  onSuccess,
}: {
  cotizacionId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [resumen, setResumen] = useState<{ id: string; nombreCotizacion: string; tieneChat: boolean; conteos: Conteos } | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmName, setConfirmName] = useState("");
  const [password, setPassword] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.resumenEliminacion(cotizacionId)
      .then(setResumen)
      .catch((e) => { toast.error(e.message); onClose(); })
      .finally(() => setLoading(false));
  }, [cotizacionId]);

  const nombreOk = !!resumen && confirmName.trim() === resumen.nombreCotizacion.trim();
  const ready = nombreOk && password.length > 0;

  const eliminar = async () => {
    if (!resumen || !ready) return;
    setSubmitting(true);
    try {
      await api.deleteCotizacion(resumen.id, password, motivo || undefined);
      toast.success(`Cotización "${resumen.nombreCotizacion}" eliminada`);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl mx-4">
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar cotización</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Esta acción es permanente y no se puede deshacer.</p>
          </div>
        </div>

        {loading || !resumen ? (
          <p className="text-sm text-gray-500">Cargando resumen…</p>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-800 dark:bg-rose-900/20">
              <p className="font-semibold text-rose-800 dark:text-rose-200">Se eliminarán los siguientes datos:</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-rose-700 dark:text-rose-200">
                <ConteoLi label="Detalles de cotización" valor={resumen.conteos.detalles} />
                <ConteoLi label="Productos (estado)" valor={resumen.conteos.estadosProductos} />
                <ConteoLi label="Órdenes de compra" valor={resumen.conteos.ordenesCompra} />
                <ConteoLi label="Compras" valor={resumen.conteos.compras} />
                <ConteoLi label="Detalles de compras" valor={resumen.conteos.compraDetalles} />
                <ConteoLi label="Historial" valor={resumen.conteos.historial} />
                <ConteoLi label="Mensajes de chat" valor={resumen.conteos.mensajes} />
                <ConteoLi label="Adjuntos de chat" valor={resumen.conteos.adjuntos} />
                <ConteoLi label="Documentos adjuntos" valor={resumen.conteos.documentosAdjuntos} />
                <ConteoLi label="Historial de fechas" valor={resumen.conteos.historialFechas} />
                <ConteoLi label="Seguimientos compra" valor={resumen.conteos.seguimientos} />
                <ConteoLi label="Productos en licitación" valor={resumen.conteos.licitacionProductos} />
                <ConteoLi label="Productos en oferta" valor={resumen.conteos.ofertaProductos} />
                <ConteoLi label="Logs de reporte" valor={resumen.conteos.reporteCompraLogs} />
                <ConteoLi label="Logs seguimiento intl." valor={resumen.conteos.seguimientoIntLogs} />
                <ConteoLi label="Participantes chat" valor={resumen.conteos.participantesChat} />
              </ul>
              {resumen.tieneChat && <p className="mt-2 text-xs text-rose-700 dark:text-rose-200">⚠ Incluye eliminación del chat asociado.</p>}
            </div>

            <div className="space-y-3">
              <Field label={`Para confirmar, escribí el nombre exacto: "${resumen.nombreCotizacion}"`}>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100 ${nombreOk ? "border-emerald-500 focus:border-emerald-500" : "border-gray-300 focus:border-blue-500 dark:border-gray-600"}`}
                  placeholder={resumen.nombreCotizacion}
                />
              </Field>
              <Field label="Tu contraseña de admin">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  autoComplete="current-password"
                />
              </Field>
              <Field label="Motivo (opcional, queda en el log)">
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Ej: cotización duplicada"
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>Cancelar</Button>
              <button
                onClick={eliminar}
                disabled={!ready || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
                {submitting ? "Eliminando…" : "Eliminar definitivamente"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function ConteoLi({ label, valor }: { label: string; valor: number }) {
  return (
    <li className="flex justify-between">
      <span>{label}</span>
      <span className="font-mono font-semibold">{valor}</span>
    </li>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}
