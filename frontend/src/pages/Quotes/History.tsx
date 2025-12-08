// pages/HistorialGeneral.tsx
import { useState, useMemo, useEffect } from 'react';
import { getToken } from '../../lib/api';
// ============================================================================
// TYPES
// ============================================================================

//type EtapaEstado = 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';

type CotizacionHistorial = {
  id: string;
  nombreCotizacion: string;
  solicitante: {
    nombre: string;
    email: string;
  };
  proyecto?: {
    nombre: string;
  };
  totalProductos: number;
  productosCompletados: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Contadores por etapa
  etapas: {
    cotizado: number;
    conDescuento: number;
    comprado: number;
    pagado: number;
    primerSeguimiento: number;
    enFOB: number;
    conBL: number;
    segundoSeguimiento: number;
    enCIF: number;
    recibido: number;
  };
  // Estado crítico general
  criticidad: 'alta' | 'media' | 'baja';
  productosAtrasados: number;
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const token = getToken();

async function obtenerHistorialGeneral(): Promise<CotizacionHistorial[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/historial-general`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al cargar historial');
    return response.json();
  } catch (error) {
    console.error('Error al obtener historial general:', error);
    return [];
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

const formatearFecha = (fecha: string): string => {
  const d = new Date(fecha);
  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);
};

const calcularProgreso = (completados: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completados / total) * 100);
};

const getCriticidadBadge = (criticidad: 'alta' | 'media' | 'baja') => {
  const badges = {
    alta: {
      label: 'Alta',
      className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    },
    media: {
      label: 'Media',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    },
    baja: {
      label: 'Baja',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    }
  };
  return badges[criticidad];
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function BarraFiltros({
  busqueda,
  setBusqueda,
  criticidadFiltro,
  setCriticidadFiltro,
  onLimpiar
}: {
  busqueda: string;
  setBusqueda: (v: string) => void;
  criticidadFiltro: string;
  setCriticidadFiltro: (v: string) => void;
  onLimpiar: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="text"
        placeholder="Buscar por nombre, solicitante o proyecto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />

      <select
        value={criticidadFiltro}
        onChange={(e) => setCriticidadFiltro(e.target.value)}
        className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Todas las criticidades</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>

      <button
        onClick={onLimpiar}
        className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white"
      >
        Limpiar Filtros
      </button>
    </div>
  );
}

function TarjetaCotizacion({
  cotizacion,
  onVerDetalle
}: {
  cotizacion: CotizacionHistorial;
  onVerDetalle: (id: string) => void;
}) {
  const progreso = calcularProgreso(cotizacion.productosCompletados, cotizacion.totalProductos);
  const criticidad = getCriticidadBadge(cotizacion.criticidad);

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cotizacion.nombreCotizacion}
          </h3>
          {cotizacion.proyecto && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Proyecto: {cotizacion.proyecto.nombre}
            </p>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${criticidad.className}`}>
          {criticidad.label}
        </span>
      </div>

      {/* Info del solicitante */}
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{cotizacion.solicitante.nombre}</span>
      </div>

      {/* Estadísticas principales */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-700/50">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {cotizacion.totalProductos}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20">
          <p className="text-xs text-blue-600 dark:text-blue-400">Completados</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {cotizacion.productosCompletados}
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 text-center dark:bg-rose-900/20">
          <p className="text-xs text-rose-600 dark:text-rose-400">Atrasados</p>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
            {cotizacion.productosAtrasados}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Progreso general</span>
          <span className="font-medium text-gray-900 dark:text-white">{progreso}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Etapas críticas (miniatura) */}
      <div className="mb-3 flex items-center gap-1">
        {Object.entries(cotizacion.etapas).map(([etapa, cantidad]) => {
          const porcentaje = cotizacion.totalProductos > 0 
            ? (cantidad / cotizacion.totalProductos) * 100 
            : 0;
          
          return (
            <div
              key={etapa}
              className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"
              title={`${etapa}: ${cantidad} productos`}
            >
              {porcentaje > 0 && (
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${porcentaje}%` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Actualizado: {formatearFecha(cotizacion.fechaActualizacion)}
        </span>
        <button
          onClick={() => onVerDetalle(cotizacion.id)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Ver Detalle
        </button>
      </div>
    </div>
  );
}

function ModalDetalle({
  isOpen,
  onClose,
  cotizacionId
}: {
  isOpen: boolean;
  onClose: () => void;
  cotizacionId: string | null;
}) {
  const [cotizacion, setCotizacion] = useState<CotizacionHistorial | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!cotizacionId || !isOpen) return;

    const cargarDetalle = async () => {
      setCargando(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/historial-general/${cotizacionId}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCotizacion(data);
        }
      } catch (error) {
        console.error('Error al cargar detalle:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [cotizacionId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalle de Cotización
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {cargando ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-600 dark:text-gray-400">Cargando detalle...</p>
            </div>
          ) : cotizacion ? (
            <div className="space-y-6">
              {/* Información general */}
              <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {cotizacion.nombreCotizacion}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Solicitante:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cotizacion.solicitante.nombre}
                    </p>
                  </div>
                  {cotizacion.proyecto && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Proyecto:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cotizacion.proyecto.nombre}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total productos:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cotizacion.totalProductos}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Completados:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cotizacion.productosCompletados}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desglose por etapas */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Productos por Etapa
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(cotizacion.etapas).map(([etapa, cantidad]) => {
                    const nombresEtapas: Record<string, string> = {
                      cotizado: '1. Cotizado',
                      conDescuento: '2. Con Descuento',
                      comprado: '3. Comprado',
                      pagado: '4. Pagado',
                      primerSeguimiento: '5. Primer Seguimiento',
                      enFOB: '6. En FOB',
                      conBL: '7. Con BL',
                      segundoSeguimiento: '8. Segundo Seguimiento',
                      enCIF: '9. En CIF',
                      recibido: '10. Recibido'
                    };

                    const porcentaje = cotizacion.totalProductos > 0
                      ? Math.round((cantidad / cotizacion.totalProductos) * 100)
                      : 0;

                    return (
                      <div
                        key={etapa}
                        className="rounded-lg border-2 border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {nombresEtapas[etapa]}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {cantidad}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({porcentaje}%)
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerta si hay productos atrasados */}
              {cotizacion.productosAtrasados > 0 && (
                <div className="rounded-lg border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-rose-900 dark:text-rose-300">
                        Productos con retraso
                      </h4>
                      <p className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                        Hay {cotizacion.productosAtrasados} producto{cotizacion.productosAtrasados > 1 ? 's' : ''} con días de atraso que requiere{cotizacion.productosAtrasados > 1 ? 'n' : ''} atención.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-600 dark:text-gray-400">No se pudo cargar el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function History() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [criticidadFiltro, setCriticidadFiltro] = useState('');
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const datos = await obtenerHistorialGeneral();
      setCotizaciones(datos);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const cotizacionesFiltradas = useMemo(() => {
    return cotizaciones.filter(cot => {
      const matchBusqueda = busqueda.trim() === '' ||
        cot.nombreCotizacion.toLowerCase().includes(busqueda.toLowerCase()) ||
        cot.solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (cot.proyecto?.nombre || '').toLowerCase().includes(busqueda.toLowerCase());

      const matchCriticidad = criticidadFiltro === '' || cot.criticidad === criticidadFiltro;

      return matchBusqueda && matchCriticidad;
    });
  }, [cotizaciones, busqueda, criticidadFiltro]);

  const handleVerDetalle = (id: string) => {
    setCotizacionSeleccionada(id);
    setModalAbierto(true);
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setCriticidadFiltro('');
  };

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historial General
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Seguimiento de todas las cotizaciones y sus etapas de proceso
          </p>
        </div>

        <BarraFiltros
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          criticidadFiltro={criticidadFiltro}
          setCriticidadFiltro={setCriticidadFiltro}
          onLimpiar={handleLimpiarFiltros}
        />
      </div>

      {/* Resultados */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resultados ({cotizacionesFiltradas.length})
          </h2>
        </div>

        {cotizacionesFiltradas.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron cotizaciones con los filtros aplicados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cotizacionesFiltradas.map(cotizacion => (
              <TarjetaCotizacion
                key={cotizacion.id}
                cotizacion={cotizacion}
                onVerDetalle={handleVerDetalle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <ModalDetalle
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setCotizacionSeleccionada(null);
        }}
        cotizacionId={cotizacionSeleccionada}
      />
    </div>
  );
}