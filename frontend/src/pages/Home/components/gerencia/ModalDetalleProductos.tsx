// components/gerencia/ModalDetalleProductos.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductoDetallado, EtapaDetalle } from '../../types/gerencia.types';
import { useAuth } from '../../../../context/AuthContext';
import { SearchableSelect } from '../../../../components/ui/searchable-select';

const ROLES_FILTRO_RESPONSABLE = ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'];

const ESTADO_LABELS: Record<string, string> = {
  cotizado: 'Cotizado',
  conDescuento: 'Con Descuento',
  aprobacionCompra: 'Aprob. Compra',
  comprado: 'Comprado',
  pagado: 'Pagado',
  aprobacionPlanos: 'Aprob. Planos',
  primerSeguimiento: '1er Seg.',
  enFOB: 'Incoterms',
  cotizacionFleteInternacional: 'Cot. Flete',
  conBL: 'Doc. Import.',
  segundoSeguimiento: '2do Seg.',
  enCIF: 'Aduana',
  recibido: 'Recibido',
};

const ESTADOS_INTERNACIONAL: string[] = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB', 'cotizacionFleteInternacional',
  'conBL', 'segundoSeguimiento', 'enCIF', 'recibido',
];

const ESTADOS_NACIONAL: string[] = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado', 'recibido',
];

interface ModalDetalleProductosProps {
  isOpen: boolean;
  onClose: () => void;
  etapa: EtapaDetalle;
  productos: ProductoDetallado[];
  nombreProyecto: string;
  tipoCompra?: 'NACIONAL' | 'INTERNACIONAL';
}

type EstadoProducto = 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
type OrdenColumna = 'default' | 'sku' | 'descripcion' | 'estado' | 'dias';
type DireccionOrden = 'asc' | 'desc';

interface CeldaSeleccionada {
  productoId: string;
  etapa: string;
  estado: EstadoProducto;
  top: number;
  left: number;
}

const MS_DIA = 1000 * 60 * 60 * 24;

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function diasEntre(a: string | Date, b: string | Date): number {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / MS_DIA);
}

// ─── Popover de detalle de fecha ────────────────────────────────────────────

interface PopoverFechaProps {
  celda: CeldaSeleccionada;
  producto: ProductoDetallado;
  etapaLabel: string;
  onClose: () => void;
}

function PopoverFecha({ celda, producto, etapaLabel, onClose }: PopoverFechaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  const fechaLimite = producto.fechasLimite?.[celda.etapa] ?? null;
  const fechaReal = producto.fechasReales?.[celda.etapa] ?? null;
  const diasAtrasoVal = producto.diasAtraso[`diasAtraso_${celda.etapa}`] ?? 0;
  const today = new Date();

  const badgeColors: Record<EstadoProducto, string> = {
    completado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    en_proceso: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    atrasado: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    pendiente: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  const estadoLabels: Record<EstadoProducto, string> = {
    completado: '✓ Completado',
    en_proceso: '⏳ En Proceso',
    atrasado: '⚠ Atrasado',
    pendiente: '○ Pendiente',
  };

  // Clamp horizontal so it never goes off-screen
  const w = 224; // w-56
  const clampedLeft = Math.min(celda.left - w / 2, window.innerWidth - w - 12);
  const safeLeft = Math.max(12, clampedLeft);
  const safeTop = Math.min(celda.top, window.innerHeight - 200);

  const renderBody = () => {
    if (celda.estado === 'completado') {
      let diffNode = null;
      if (fechaLimite && fechaReal) {
        const diff = diasEntre(fechaLimite, fechaReal); // negativo = llegó antes
        const esAntes = diff <= 0;
        diffNode = (
          <p className={`mt-2 text-sm font-bold ${esAntes ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {esAntes
              ? diff === 0 ? 'Llegó en la fecha exacta' : `${Math.abs(diff)} días antes de lo estimado`
              : `${diff} días de retraso`}
          </p>
        );
      }
      return (
        <>
          <Row label="Fecha estimada" value={fmtFecha(fechaLimite)} />
          <Row label="Fecha real" value={fmtFecha(fechaReal)} />
          {diffNode}
        </>
      );
    }

    if (celda.estado === 'atrasado') {
      const days = diasAtrasoVal || (fechaLimite ? Math.ceil((today.getTime() - new Date(fechaLimite).getTime()) / MS_DIA) : 0);
      return (
        <>
          <Row label="Fecha estimada" value={fmtFecha(fechaLimite)} />
          <p className="mt-2 text-sm font-bold text-rose-600 dark:text-rose-400">
            +{days} {days === 1 ? 'día' : 'días'} de atraso
          </p>
        </>
      );
    }

    if (celda.estado === 'en_proceso') {
      const restantes = fechaLimite ? diasEntre(today, fechaLimite) : null;
      return (
        <>
          <Row label="Fecha estimada" value={fmtFecha(fechaLimite)} />
          {restantes !== null && (
            <p className={`mt-2 text-sm font-bold ${restantes >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {restantes >= 0
                ? `${restantes} ${restantes === 1 ? 'día restante' : 'días restantes'}`
                : `Venció hace ${Math.abs(restantes)} ${Math.abs(restantes) === 1 ? 'día' : 'días'}`}
            </p>
          )}
        </>
      );
    }

    // pendiente
    const restantes = fechaLimite ? diasEntre(today, fechaLimite) : null;
    return (
      <>
        <Row label="Fecha estimada" value={fmtFecha(fechaLimite)} />
        {restantes !== null && (
          <p className={`mt-2 text-sm font-bold ${restantes >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {restantes >= 0
              ? `${restantes} ${restantes === 1 ? 'día restante' : 'días restantes'}`
              : `Venció hace ${Math.abs(restantes)} ${Math.abs(restantes) === 1 ? 'día' : 'días'}`}
          </p>
        )}
      </>
    );
  };

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: safeTop, left: safeLeft, width: w, zIndex: 9999 }}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{etapaLabel}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[celda.estado]}`}>
            {estadoLabels[celda.estado]}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-1">{renderBody()}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right">{value}</span>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function ModalDetalleProductos({
  isOpen,
  onClose,
  etapa,
  productos,
  nombreProyecto,
  tipoCompra = 'INTERNACIONAL',
}: ModalDetalleProductosProps) {
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>('default');
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>('asc');
  const [filtroResponsable, setFiltroResponsable] = useState<string>('TODOS');
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<CeldaSeleccionada | null>(null);

  const { user } = useAuth();
  const puedeVerFiltro = ROLES_FILTRO_RESPONSABLE.includes(user?.rol?.nombre ?? '');

  const esVistaTotal = etapa === 'total';

  // Responsables únicos para el filtro (formato { id, nombre } para SearchableSelect)
  const responsablesUnicos = useMemo(() => {
    const nombres = Array.from(new Set(productos.map(p => p.responsable || 'Sin asignar'))).sort();
    return nombres.map(n => ({ id: n, nombre: n }));
  }, [productos]);

  // Reset filtro cuando cambia la etapa
  useEffect(() => {
    setFiltroResponsable('TODOS');
    setCeldaSeleccionada(null);
  }, [etapa]);

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    if (!esVistaTotal) {
      resultado = resultado.filter(p => p.estados[etapa] !== 'pendiente');
    }

    if (filtroResponsable !== 'TODOS') {
      resultado = resultado.filter(p => (p.responsable || 'Sin asignar') === filtroResponsable);
    }

    resultado.sort((a, b) => {
      if (ordenColumna === 'default') {
        const getEstadoMasCritico = (p: ProductoDetallado): EstadoProducto => {
          if (ESTADOS_INTERNACIONAL.some(e => p.estados[e] === 'atrasado')) return 'atrasado';
          if (ESTADOS_INTERNACIONAL.some(e => p.estados[e] === 'en_proceso')) return 'en_proceso';
          return 'completado';
        };
        const estadoA = esVistaTotal ? getEstadoMasCritico(a) : (a.estados[etapa] as EstadoProducto);
        const estadoB = esVistaTotal ? getEstadoMasCritico(b) : (b.estados[etapa] as EstadoProducto);
        const prio: Record<EstadoProducto, number> = { atrasado: 1, en_proceso: 2, completado: 3, pendiente: 4 };
        if (prio[estadoA] !== prio[estadoB]) return prio[estadoA] - prio[estadoB];
        const getDiasMax = (p: ProductoDetallado) =>
          Math.max(...Object.values(p.diasAtraso).map(v => v || 0), 0);
        return getDiasMax(b) - getDiasMax(a);
      }
      if (ordenColumna === 'sku') {
        const c = a.sku.localeCompare(b.sku);
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'descripcion') {
        const c = a.descripcion.localeCompare(b.descripcion);
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'estado' && !esVistaTotal) {
        const prio: Record<EstadoProducto, number> = { atrasado: 1, en_proceso: 2, completado: 3, pendiente: 4 };
        const c = (prio[a.estados[etapa] as EstadoProducto] || 4) - (prio[b.estados[etapa] as EstadoProducto] || 4);
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'dias' && !esVistaTotal) {
        const c = (a.diasAtraso[`diasAtraso_${etapa}`] || 0) - (b.diasAtraso[`diasAtraso_${etapa}`] || 0);
        return direccionOrden === 'asc' ? c : -c;
      }
      return 0;
    });

    return resultado;
  }, [productos, etapa, esVistaTotal, ordenColumna, direccionOrden, filtroResponsable]);

  if (!isOpen) return null;

  const handleOrdenar = (columna: OrdenColumna) => {
    if (ordenColumna === columna) {
      setDireccionOrden(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenColumna(columna);
      setDireccionOrden('asc');
    }
  };

  const handleCeldaClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    productoId: string,
    etapaKey: string,
    estado: EstadoProducto,
  ) => {
    // Si no hay fecha y es pendiente sin info, no abrir
    if (celdaSeleccionada?.productoId === productoId && celdaSeleccionada?.etapa === etapaKey) {
      setCeldaSeleccionada(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setCeldaSeleccionada({
      productoId,
      etapa: etapaKey,
      estado,
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  };

  const nombresEtapas: Record<string, string> = { total: 'Todos los productos', ...ESTADO_LABELS };

  const getEstadoBadge = (estado: EstadoProducto) => {
    const badges = {
      completado: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: '✓', text: 'Completado' },
      en_proceso: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: '⏳', text: 'En Proceso' },
      atrasado: { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: '⚠', text: 'Atrasado' },
      pendiente: { bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: '○', text: 'Pendiente' },
    };
    return badges[estado] || badges.pendiente;
  };

  const HeaderOrdenable = ({
    columna, children, className = '',
  }: { columna: OrdenColumna; children: React.ReactNode; className?: string }) => (
    <th
      onClick={() => handleOrdenar(columna)}
      className={`cursor-pointer select-none transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      <div className="flex items-center justify-center gap-1">
        <span>{children}</span>
        {ordenColumna === columna && (
          <span className="text-blue-600 dark:text-blue-400">
            {direccionOrden === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  const todasLasEtapas = (tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL).map(key => ({
    key, label: ESTADO_LABELS[key] || key,
  }));

  // Producto seleccionado para el popover
  const productoPopover = celdaSeleccionada
    ? productos.find(p => p.id === celdaSeleccionada.productoId)
    : null;

  return (
    <>
      <div className="fixed inset-0 z-[9950] flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-2 border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="min-w-0">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {nombresEtapas[etapa]}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Proyecto: {nombreProyecto} • {productosFiltrados.length} productos
                {ordenColumna !== 'default' && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Ordenado por: {
                      ordenColumna === 'sku' ? 'SKU' :
                      ordenColumna === 'descripcion' ? 'Descripción' :
                      ordenColumna === 'estado' ? 'Estado' : 'Días de atraso'
                    }
                  </span>
                )}
              </p>
            </div>

            {/* Filtro responsable + cerrar */}
            <div className="flex shrink-0 items-center gap-3">
              {puedeVerFiltro && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    Responsable:
                  </label>
                  <SearchableSelect
                    value={filtroResponsable}
                    onChange={val => { setFiltroResponsable(val); setCeldaSeleccionada(null); }}
                    options={responsablesUnicos}
                    allValue="TODOS"
                    allLabel="Todos"
                    placeholder="Todos"
                    className="w-48"
                  />
                </div>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            {productosFiltrados.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    No hay productos en esta etapa
                  </p>
                </div>
              </div>
            ) : esVistaTotal ? (
              /* ── Vista total: grilla de estados por etapa ── */
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <HeaderOrdenable
                        columna="sku"
                        className="sticky left-0 z-10 bg-gray-100 px-4 py-3 text-left font-bold text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      >
                        SKU
                      </HeaderOrdenable>
                      <HeaderOrdenable
                        columna="descripcion"
                        className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200"
                      >
                        Descripción
                      </HeaderOrdenable>
                      {todasLasEtapas.map(({ key, label }) => (
                        <th key={key} className="px-3 py-3 text-center font-bold text-gray-700 dark:text-gray-200 text-xs whitespace-nowrap">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                          {producto.sku}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          <div className="max-w-xs">{producto.descripcion}</div>
                          {producto.responsable && (
                            <p className="mt-0.5 text-[10px] font-medium text-blue-500 dark:text-blue-400">
                              {producto.responsable}
                            </p>
                          )}
                        </td>
                        {todasLasEtapas.map(({ key }) => {
                          const estado = (producto.estados[key] || 'pendiente') as EstadoProducto;
                          const badge = getEstadoBadge(estado);
                          const isActive =
                            celdaSeleccionada?.productoId === producto.id &&
                            celdaSeleccionada?.etapa === key;
                          return (
                            <td key={key} className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={e => handleCeldaClick(e, producto.id, key, estado)}
                                title={`${ESTADO_LABELS[key]}: ${badge.text}`}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${badge.bg} ${isActive ? 'ring-2 ring-blue-400 scale-110' : ''}`}
                              >
                                <span>{badge.icon}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── Vista por etapa ── */
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <HeaderOrdenable columna="sku" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200">
                        SKU
                      </HeaderOrdenable>
                      <HeaderOrdenable columna="descripcion" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200">
                        Descripción
                      </HeaderOrdenable>
                      <HeaderOrdenable columna="estado" className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200">
                        Estado
                      </HeaderOrdenable>
                      <HeaderOrdenable columna="dias" className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200">
                        Días en Atraso
                      </HeaderOrdenable>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productosFiltrados.map((producto) => {
                      const estado = (producto.estados[etapa] || 'pendiente') as EstadoProducto;
                      const badge = getEstadoBadge(estado);
                      const diasAtraso = producto.diasAtraso[`diasAtraso_${etapa}`] || 0;
                      const isActive =
                        celdaSeleccionada?.productoId === producto.id &&
                        celdaSeleccionada?.etapa === etapa;

                      return (
                        <tr key={producto.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                            {producto.sku}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            <div className="max-w-md">{producto.descripcion}</div>
                            {producto.responsable && (
                              <p className="mt-0.5 text-[10px] font-medium text-blue-500 dark:text-blue-400">
                                {producto.responsable}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={e => handleCeldaClick(e, producto.id, etapa, estado)}
                              title={badge.text}
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${badge.bg} ${isActive ? 'ring-2 ring-blue-400 scale-105' : ''}`}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.text}</span>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {estado === 'atrasado' ? (
                              <span className="font-bold text-rose-600 dark:text-rose-400">
                                +{diasAtraso} días
                              </span>
                            ) : estado === 'en_proceso' ? (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                {diasAtraso === 0 ? 'A tiempo' : `+${diasAtraso} días`}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Haz click en los encabezados para ordenar • Haz click en una celda de estado para ver fechas
            </p>
          </div>
        </div>
      </div>

      {/* Popover de detalle de fecha (fuera del contenedor para evitar clipping) */}
      {celdaSeleccionada && productoPopover && (
        <PopoverFecha
          celda={celdaSeleccionada}
          producto={productoPopover}
          etapaLabel={ESTADO_LABELS[celdaSeleccionada.etapa] || celdaSeleccionada.etapa}
          onClose={() => setCeldaSeleccionada(null)}
        />
      )}
    </>
  );
}
