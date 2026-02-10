import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { getToken } from "../../lib/api";
import { useNotifications } from "../Notifications/context/NotificationContext";

// ============================================================================
// TYPES
// ============================================================================

type MedioTransporte = "MARITIMO" | "TERRESTRE" | "AEREO";

type Pais = {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
};

type TimelineSKU = {
  id: string;
  sku: string;
  paisOrigen?: Pais;
  medioTransporte: MedioTransporte;
  diasCotizadoADescuento?: number;
  diasDescuentoAComprado?: number;
  diasCompradoAPagado?: number;
  diasPagadoASeguimiento1?: number;
  diasSeguimiento1AFob?: number;
  diasFobABl?: number;
  diasBlASeguimiento2?: number;
  diasSeguimiento2ACif?: number;
  diasCifARecibido?: number;
  diasTotalesEstimados: number;
  notas?: string;
};

type Stats = {
  total: number;
  porMedioTransporte: Record<string, number>;
  promedios: {
    diasTotales: number;
    porEtapa: Record<string, number>;
  };
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();

const api = {
  // TimelineSKU
  async getTimelinesSKU(filters?: { sku?: string; medioTransporte?: string }) {
    const params = new URLSearchParams();
    if (filters?.sku) params.append("sku", filters.sku);
    if (filters?.medioTransporte) params.append("medioTransporte", filters.medioTransporte);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/timeline-sku?${params}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al cargar timelines");
    return response.json();
  },

  async getTimelineStats() {
    const response = await fetch(`${API_BASE_URL}/api/v1/timeline-sku/stats`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar estadísticas");
    return response.json();
  },

  async createTimelineSKU(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/v1/timeline-sku`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear timeline");
    return response.json();
  },

  async updateTimelineSKU(sku: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/v1/timeline-sku/${sku}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar timeline");
    return response.json();
  },

  async deleteTimelineSKU(sku: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/timeline-sku/${sku}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al eliminar timeline");
    return response.json();
  },

  // Sincronización
  async sincronizarCotizacionesAprobadas() {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/sync/estado-productos/cotizaciones-aprobadas`,
      {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Error al sincronizar");
    return response.json();
  },

  // Países
  async getPaises() {
    const response = await fetch(`${API_BASE_URL}/api/v1/paises`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Error al cargar países");
    return response.json();
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const MEDIO_TRANSPORTE_LABELS: Record<MedioTransporte, string> = {
  MARITIMO: "🚢 Marítimo",
  TERRESTRE: "🚛 Terrestre",
  AEREO: "✈️ Aéreo",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Assignment() {
  const { addNotification } = useNotifications();

  // Estados principales
  const [timelines, setTimelines] = useState<TimelineSKU[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSincronizacion, setLoadingSincronizacion] = useState(false);

  // Estados de formulario
  const [showModal, setShowModal] = useState(false);
  const [timelineEditando, setTimelineEditando] = useState<TimelineSKU | null>(null);
  const [formData, setFormData] = useState<any>({
    sku: "",
    paisOrigenId: "",
    medioTransporte: "MARITIMO",
    diasCotizadoADescuento: "",
    diasDescuentoAComprado: "",
    diasCompradoAPagado: "",
    diasPagadoASeguimiento1: "",
    diasSeguimiento1AFob: "",
    diasFobABl: "",
    diasBlASeguimiento2: "",
    diasSeguimiento2ACif: "",
    diasCifARecibido: "",
    notas: "",
  });

  // Filtros
  const [skuFiltro, setSkuFiltro] = useState("");
  const [medioFiltro, setMedioFiltro] = useState<string>("");

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    cargarDatos();
  }, [skuFiltro, medioFiltro]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [timelinesData, statsData, paisesData] = await Promise.all([
        api.getTimelinesSKU({
          sku: skuFiltro || undefined,
          medioTransporte: medioFiltro || undefined,
        }),
        api.getTimelineStats(),
        api.getPaises(),
      ]);
      setTimelines(timelinesData.items || []);
      setStats(statsData);
      setPaises(paisesData || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      addNotification("danger", "Error", "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (timeline?: TimelineSKU) => {
    if (timeline) {
      setTimelineEditando(timeline);
      setFormData({
        sku: timeline.sku,
        paisOrigenId: timeline.paisOrigen?.id || "",
        medioTransporte: timeline.medioTransporte,
        diasCotizadoADescuento: timeline.diasCotizadoADescuento?.toString() || "",
        diasDescuentoAComprado: timeline.diasDescuentoAComprado?.toString() || "",
        diasCompradoAPagado: timeline.diasCompradoAPagado?.toString() || "",
        diasPagadoASeguimiento1: timeline.diasPagadoASeguimiento1?.toString() || "",
        diasSeguimiento1AFob: timeline.diasSeguimiento1AFob?.toString() || "",
        diasFobABl: timeline.diasFobABl?.toString() || "",
        diasBlASeguimiento2: timeline.diasBlASeguimiento2?.toString() || "",
        diasSeguimiento2ACif: timeline.diasSeguimiento2ACif?.toString() || "",
        diasCifARecibido: timeline.diasCifARecibido?.toString() || "",
        notas: timeline.notas || "",
      });
    } else {
      setTimelineEditando(null);
      setFormData({
        sku: "",
        paisOrigenId: "",
        medioTransporte: "MARITIMO",
        diasCotizadoADescuento: "",
        diasDescuentoAComprado: "",
        diasCompradoAPagado: "",
        diasPagadoASeguimiento1: "",
        diasSeguimiento1AFob: "",
        diasFobABl: "",
        diasBlASeguimiento2: "",
        diasSeguimiento2ACif: "",
        diasCifARecibido: "",
        notas: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sku) {
      addNotification("warn", "Advertencia", "El SKU es requerido");
      return;
    }

    try {
      const data = {
        sku: formData.sku,
        paisOrigenId: formData.paisOrigenId || null,
        medioTransporte: formData.medioTransporte,
        diasCotizadoADescuento: formData.diasCotizadoADescuento
          ? parseInt(formData.diasCotizadoADescuento)
          : null,
        diasDescuentoAComprado: formData.diasDescuentoAComprado
          ? parseInt(formData.diasDescuentoAComprado)
          : null,
        diasCompradoAPagado: formData.diasCompradoAPagado
          ? parseInt(formData.diasCompradoAPagado)
          : null,
        diasPagadoASeguimiento1: formData.diasPagadoASeguimiento1
          ? parseInt(formData.diasPagadoASeguimiento1)
          : null,
        diasSeguimiento1AFob: formData.diasSeguimiento1AFob
          ? parseInt(formData.diasSeguimiento1AFob)
          : null,
        diasFobABl: formData.diasFobABl ? parseInt(formData.diasFobABl) : null,
        diasBlASeguimiento2: formData.diasBlASeguimiento2
          ? parseInt(formData.diasBlASeguimiento2)
          : null,
        diasSeguimiento2ACif: formData.diasSeguimiento2ACif
          ? parseInt(formData.diasSeguimiento2ACif)
          : null,
        diasCifARecibido: formData.diasCifARecibido
          ? parseInt(formData.diasCifARecibido)
          : null,
        notas: formData.notas || null,
      };

      if (timelineEditando) {
        await api.updateTimelineSKU(timelineEditando.sku, data);
        addNotification("success", "Éxito", "Timeline actualizado correctamente");
      } else {
        await api.createTimelineSKU(data);
        addNotification("success", "Éxito", "Timeline creado correctamente");
      }

      setShowModal(false);
      await cargarDatos();
    } catch (error) {
      console.error("Error al guardar timeline:", error);
      addNotification("danger", "Error", "Error al guardar timeline");
    }
  };

  const handleDelete = async (sku: string) => {
    if (!confirm(`¿Estás seguro de eliminar el timeline del SKU ${sku}?`)) return;

    try {
      await api.deleteTimelineSKU(sku);
      addNotification("success", "Éxito", "Timeline eliminado");
      await cargarDatos();
    } catch (error) {
      console.error("Error al eliminar timeline:", error);
      addNotification("danger", "Error", "Error al eliminar timeline");
    }
  };

  const ejecutarSincronizacion = async () => {
    if (
      !confirm(
        "¿Estás seguro de ejecutar la sincronización? Esto creará EstadoProducto para todas las cotizaciones aprobadas sin registro."
      )
    )
      return;

    try {
      setLoadingSincronizacion(true);
      const resultado = await api.sincronizarCotizacionesAprobadas();
      addNotification(
        "success",
        "Sincronización Completada",
        `Creados: ${resultado.creados} | Omitidos: ${resultado.omitidos} | Errores: ${resultado.errores || 0}`
      );
    } catch (error) {
      console.error("Error al sincronizar:", error);
      addNotification("danger", "Error", "Error al ejecutar sincronización");
    } finally {
      setLoadingSincronizacion(false);
    }
  };

  const calcularTotalDias = () => {
    let total = 0;
    Object.keys(formData).forEach((key) => {
      if (key.startsWith("dias") && formData[key]) {
        total += parseInt(formData[key]);
      }
    });
    return total;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        description="Configuración de tiempos y sincronización"
        title="Shopping Assignment"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Configuración del Sistema
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestión de timelines por SKU y sincronización de datos
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => abrirModal()}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 p-6 font-medium text-white transition-all hover:bg-blue-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Crear Nuevo Timeline SKU
          </button>

          <button
            onClick={ejecutarSincronizacion}
            disabled={loadingSincronizacion}
            className="flex items-center justify-center gap-2 rounded-xl border border-green-600 bg-green-600 p-6 font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50"
          >
            {loadingSincronizacion ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            {loadingSincronizacion ? "Sincronizando..." : "Sincronizar Cotizaciones"}
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Timelines
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {Object.entries(stats.porMedioTransporte).map(([medio, cantidad]) => (
              <div
                key={medio}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                    <span className="text-2xl">
                      {medio === "MARITIMO" && "🚢"}
                      {medio === "TERRESTRE" && "🚛"}
                      {medio === "AEREO" && "✈️"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{medio}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {cantidad}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Timelines */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Timelines Configurados
            </h3>

            {/* Filtros */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Buscar SKU..."
                value={skuFiltro}
                onChange={(e) => setSkuFiltro(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />

              <select
                value={medioFiltro}
                onChange={(e) => setMedioFiltro(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="">Todos los medios</option>
                <option value="MARITIMO">🚢 Marítimo</option>
                <option value="TERRESTRE">🚛 Terrestre</option>
                <option value="AEREO">✈️ Aéreo</option>
              </select>
            </div>
          </div>

          {timelines.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                No hay timelines configurados
              </p>
              <button
                onClick={() => abrirModal()}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      SKU
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Medio
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      País Origen
                    </th>
                    <th className="pb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      Días Totales
                    </th>
                    <th className="pb-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {timelines.map((timeline) => (
                    <tr
                      key={timeline.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {timeline.sku}
                      </td>
                      <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                        {MEDIO_TRANSPORTE_LABELS[timeline.medioTransporte]}
                      </td>
                      <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                        {timeline.paisOrigen?.nombre || "-"}
                      </td>
                      <td className="py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {timeline.diasTotalesEstimados} días
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModal(timeline)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(timeline.sku)}
                            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Formulario */}
        {showModal && (
          <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {timelineEditando ? "Editar Timeline" : "Crear Timeline SKU"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Información Básica
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        disabled={!!timelineEditando}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        placeholder="Ej: SKU-12345"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Medio de Transporte
                      </label>
                      <select
                        value={formData.medioTransporte}
                        onChange={(e) =>
                          setFormData({ ...formData, medioTransporte: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <option value="MARITIMO">🚢 Marítimo</option>
                        <option value="TERRESTRE">🚛 Terrestre</option>
                        <option value="AEREO">✈️ Aéreo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        País de Origen
                      </label>
                      <select
                        value={formData.paisOrigenId}
                        onChange={(e) =>
                          setFormData({ ...formData, paisOrigenId: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <option value="">Seleccionar país...</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Días por Etapa */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Días por Etapa (opcional)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[
                      { key: "diasCotizadoADescuento", label: "Cotizado → Descuento" },
                      { key: "diasDescuentoAComprado", label: "Descuento → Comprado" },
                      { key: "diasCompradoAPagado", label: "Comprado → Pagado" },
                      { key: "diasPagadoASeguimiento1", label: "Pagado → 1er Seguimiento" },
                      { key: "diasSeguimiento1AFob", label: "1er Seg → FOB" },
                      { key: "diasFobABl", label: "FOB → BL" },
                      { key: "diasBlASeguimiento2", label: "BL → 2do Seguimiento" },
                      { key: "diasSeguimiento2ACif", label: "2do Seg → CIF" },
                      { key: "diasCifARecibido", label: "CIF → Recibido" },
                    ].map((campo) => (
                      <div key={campo.key}>
                        <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                          {campo.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData[campo.key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [campo.key]: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                          placeholder="días"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Total Estimado:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {calcularTotalDias()} días
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notas / Observaciones
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    placeholder="Información adicional sobre este timeline..."
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    {timelineEditando ? "Actualizar" : "Crear"} Timeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}