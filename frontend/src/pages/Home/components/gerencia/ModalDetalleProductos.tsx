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
type OrdenColumna = 'default' | 'ordenCompra' | 'descripcion' | 'estado' | 'dias';
type DireccionOrden = 'asc' | 'desc';
type EstadoFiltro = 'TODOS' | EstadoProducto;
type Bucket = 'activos' | 'cotizacion' | 'completados';

const OPCIONES_ITEMS_POR_PAGINA = [20, 40, 60, 80, 100];

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
    if (!fechaLimite) {
      return (
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Sin fechas definidas
        </p>
      );
    }
    const restantes = diasEntre(today, fechaLimite);
    return (
      <>
        <Row label="Fecha estimada" value={fmtFecha(fechaLimite)} />
        <p className={`mt-2 text-sm font-bold ${restantes >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {restantes >= 0
            ? `${restantes} ${restantes === 1 ? 'día restante' : 'días restantes'}`
            : `Venció hace ${Math.abs(restantes)} ${Math.abs(restantes) === 1 ? 'día' : 'días'}`}
        </p>
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
  const [filtroOrdenCompra, setFiltroOrdenCompra] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('TODOS');
  const [mostrarCotizacion, setMostrarCotizacion] = useState<boolean>(false);
  const [mostrarCompletados, setMostrarCompletados] = useState<boolean>(false);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(20);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<CeldaSeleccionada | null>(null);

  const { user } = useAuth();
  const puedeVerFiltro = ROLES_FILTRO_RESPONSABLE.includes(user?.rol?.nombre ?? '');

  const esVistaTotal = etapa === 'total';
  const esInternacional = tipoCompra === 'INTERNACIONAL';

  // Responsables únicos para el filtro (formato { id, nombre } para SearchableSelect)
  const responsablesUnicos = useMemo(() => {
    const nombres = Array.from(new Set(productos.map(p => p.responsable || 'Sin asignar'))).sort();
    return nombres.map(n => ({ id: n, nombre: n }));
  }, [productos]);

  // Órdenes de compra únicas (solo internacional)
  const ordenesCompraUnicas = useMemo(() => {
    if (!esInternacional) return [];
    const ocs = Array.from(
      new Set(productos.map(p => p.ordenCompra).filter((v): v is string => !!v && v.trim() !== '')),
    ).sort();
    return ocs.map(oc => ({ id: oc, nombre: oc }));
  }, [productos, esInternacional]);

  // Etapas relevantes según tipo de compra
  const etapasRelevantes = useMemo(
    () => (esInternacional ? ESTADOS_INTERNACIONAL : ESTADOS_NACIONAL),
    [esInternacional],
  );

  // Bucket: activos (>=1 completado, <100%) | cotizacion (0 completados) | completados (100%)
  const getBucket = useMemo(() => {
    return (p: ProductoDetallado): Bucket => {
      const completadosCount = etapasRelevantes.filter(e => p.estados[e] === 'completado').length;
      if (completadosCount === etapasRelevantes.length) return 'completados';
      if (completadosCount === 0) return 'cotizacion';
      return 'activos';
    };
  }, [etapasRelevantes]);

  // Conteos por bucket (sobre el dataset crudo, sin filtros aplicados)
  const conteos = useMemo(() => {
    return productos.reduce(
      (acc, p) => {
        acc[getBucket(p)]++;
        return acc;
      },
      { activos: 0, cotizacion: 0, completados: 0 } as Record<Bucket, number>,
    );
  }, [productos, getBucket]);

  // Reset filtro cuando cambia la etapa
  useEffect(() => {
    setFiltroResponsable('TODOS');
    setFiltroOrdenCompra('TODOS');
    setBusqueda('');
    setFiltroEstado('TODOS');
    setMostrarCotizacion(false);
    setMostrarCompletados(false);
    setPaginaActual(1);
    setCeldaSeleccionada(null);
  }, [etapa]);

  // Reset paginación al cambiar cualquier filtro/orden/page-size
  useEffect(() => {
    setPaginaActual(1);
  }, [
    busqueda,
    filtroEstado,
    mostrarCotizacion,
    mostrarCompletados,
    filtroResponsable,
    filtroOrdenCompra,
    ordenColumna,
    direccionOrden,
    itemsPorPagina,
  ]);

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // Filtro por bucket (toggles cotización / completados)
    resultado = resultado.filter(p => {
      const bucket = getBucket(p);
      if (bucket === 'cotizacion' && !mostrarCotizacion) return false;
      if (bucket === 'completados' && !mostrarCompletados) return false;
      return true;
    });

    // Vista por etapa: ocultar pendientes en esa etapa
    if (!esVistaTotal) {
      resultado = resultado.filter(p => p.estados[etapa] !== 'pendiente');
    }

    if (filtroResponsable !== 'TODOS') {
      resultado = resultado.filter(p => (p.responsable || 'Sin asignar') === filtroResponsable);
    }

    if (esInternacional && filtroOrdenCompra !== 'TODOS') {
      resultado = resultado.filter(p => (p.ordenCompra || '') === filtroOrdenCompra);
    }

    // Búsqueda: descripción + OC
    const q = busqueda.trim().toLowerCase();
    if (q) {
      resultado = resultado.filter(
        p =>
          (p.descripcion || '').toLowerCase().includes(q) ||
          (p.ordenCompra || '').toLowerCase().includes(q),
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'TODOS') {
      if (esVistaTotal) {
        resultado = resultado.filter(p =>
          etapasRelevantes.some(e => p.estados[e] === filtroEstado),
        );
      } else {
        resultado = resultado.filter(p => p.estados[etapa] === filtroEstado);
      }
    }

    // Buckets siempre como criterio primario de orden
    const bucketOrden: Record<Bucket, number> = { activos: 1, cotizacion: 2, completados: 3 };
    const tieneEstado = (p: ProductoDetallado, est: EstadoProducto) =>
      etapasRelevantes.some(e => p.estados[e] === est);
    const countCompletados = (p: ProductoDetallado) =>
      etapasRelevantes.filter(e => p.estados[e] === 'completado').length;
    const maxDiasAtraso = (p: ProductoDetallado) =>
      Math.max(...Object.values(p.diasAtraso).map(v => v || 0), 0);

    resultado.sort((a, b) => {
      // 1. Bucket primero, siempre
      const ba = bucketOrden[getBucket(a)];
      const bb = bucketOrden[getBucket(b)];
      if (ba !== bb) return ba - bb;

      // 2. Dentro del bucket: aplica orden seleccionado
      if (ordenColumna === 'default') {
        // Atrasados arriba
        const aA = tieneEstado(a, 'atrasado') ? 1 : 0;
        const bA = tieneEstado(b, 'atrasado') ? 1 : 0;
        if (aA !== bA) return bA - aA;
        // En proceso siguiente
        const aP = tieneEstado(a, 'en_proceso') ? 1 : 0;
        const bP = tieneEstado(b, 'en_proceso') ? 1 : 0;
        if (aP !== bP) return bP - aP;
        // Más completados arriba
        const aC = countCompletados(a);
        const bC = countCompletados(b);
        if (aC !== bC) return bC - aC;
        // Más días atraso arriba
        return maxDiasAtraso(b) - maxDiasAtraso(a);
      }
      if (ordenColumna === 'ordenCompra') {
        const c = (a.ordenCompra || '').localeCompare(b.ordenCompra || '');
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'descripcion') {
        const c = a.descripcion.localeCompare(b.descripcion);
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'estado' && !esVistaTotal) {
        const prio: Record<EstadoProducto, number> = {
          atrasado: 1, en_proceso: 2, completado: 3, pendiente: 4,
        };
        const c =
          (prio[a.estados[etapa] as EstadoProducto] || 4) -
          (prio[b.estados[etapa] as EstadoProducto] || 4);
        return direccionOrden === 'asc' ? c : -c;
      }
      if (ordenColumna === 'dias' && !esVistaTotal) {
        const c =
          (a.diasAtraso[`diasAtraso_${etapa}`] || 0) -
          (b.diasAtraso[`diasAtraso_${etapa}`] || 0);
        return direccionOrden === 'asc' ? c : -c;
      }
      return 0;
    });

    return resultado;
  }, [
    productos,
    etapa,
    esVistaTotal,
    esInternacional,
    ordenColumna,
    direccionOrden,
    filtroResponsable,
    filtroOrdenCompra,
    busqueda,
    filtroEstado,
    mostrarCotizacion,
    mostrarCompletados,
    etapasRelevantes,
    getBucket,
  ]);

  // Paginación
  const totalItems = productosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / itemsPorPagina));
  const paginaSegura = Math.min(Math.max(1, paginaActual), totalPaginas);
  const inicio = (paginaSegura - 1) * itemsPorPagina;
  const productosPagina = useMemo(
    () => productosFiltrados.slice(inicio, inicio + itemsPorPagina),
    [productosFiltrados, inicio, itemsPorPagina],
  );

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
                Proyecto: {nombreProyecto} • {totalItems} productos
                {ordenColumna !== 'default' && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • Ordenado por: {
                      ordenColumna === 'ordenCompra' ? 'Orden de Compra' :
                      ordenColumna === 'descripcion' ? 'Descripción' :
                      ordenColumna === 'estado' ? 'Estado' : 'Días de atraso'
                    }
                  </span>
                )}
              </p>
            </div>

            {/* Filtros + cerrar */}
            <div className="flex shrink-0 items-center gap-3 flex-wrap">
              {esInternacional && ordenesCompraUnicas.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    Orden de Compra:
                  </label>
                  <SearchableSelect
                    value={filtroOrdenCompra}
                    onChange={val => { setFiltroOrdenCompra(val); setCeldaSeleccionada(null); }}
                    options={ordenesCompraUnicas}
                    allValue="TODOS"
                    allLabel="Todas"
                    placeholder="Todas"
                    className="w-48"
                  />
                </div>
              )}
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

          {/* Toolbar de filtros */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800 flex-wrap">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <svg
                className="absolute left-2.5 top-2 h-4 w-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar descripción u OC..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 pl-9 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2 top-1.5 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                  title="Limpiar búsqueda"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Estado:
              </label>
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value as EstadoFiltro)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="TODOS">Todos</option>
                <option value="atrasado">⚠ Atrasado</option>
                <option value="en_proceso">⏳ En proceso</option>
                <option value="completado">✓ Completado</option>
                <option value="pendiente">○ Pendiente</option>
              </select>
            </div>

            {/* Toggle cotización */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
              <input
                type="checkbox"
                checked={mostrarCotizacion}
                onChange={e => setMostrarCotizacion(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>En cotización ({conteos.cotizacion})</span>
            </label>

            {/* Toggle completados */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
              <input
                type="checkbox"
                checked={mostrarCompletados}
                onChange={e => setMostrarCompletados(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Completados ({conteos.completados})</span>
            </label>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            {totalItems === 0 ? (
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
                      {esInternacional && (
                        <HeaderOrdenable
                          columna="ordenCompra"
                          className="sticky left-0 z-10 bg-gray-100 px-4 py-3 text-left font-bold text-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          Orden de Compra
                        </HeaderOrdenable>
                      )}
                      <HeaderOrdenable
                        columna="descripcion"
                        className={`px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200 ${!esInternacional ? 'sticky left-0 z-10 bg-gray-100 dark:bg-gray-900' : ''}`}
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
                    {productosPagina.map((producto) => (
                      <tr key={producto.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {esInternacional && (
                          <td className="sticky left-0 z-10 bg-white px-4 py-3 font-mono text-xs font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                            {producto.ordenCompra || ''}
                          </td>
                        )}
                        <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${!esInternacional ? 'sticky left-0 z-10 bg-white dark:bg-gray-800' : ''}`}>
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
                      {esInternacional && (
                        <HeaderOrdenable columna="ordenCompra" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200">
                          Orden de Compra
                        </HeaderOrdenable>
                      )}
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
                    {productosPagina.map((producto) => {
                      const estado = (producto.estados[etapa] || 'pendiente') as EstadoProducto;
                      const badge = getEstadoBadge(estado);
                      const diasAtraso = producto.diasAtraso[`diasAtraso_${etapa}`] || 0;
                      const isActive =
                        celdaSeleccionada?.productoId === producto.id &&
                        celdaSeleccionada?.etapa === etapa;

                      return (
                        <tr key={producto.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {esInternacional && (
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                              {producto.ordenCompra || ''}
                            </td>
                          )}
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
                            ) : producto.sinFechasDefinidas ? (
                              <span className="text-xs italic text-gray-500 dark:text-gray-400">
                                Sin fechas definidas
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

          {/* Footer: paginación */}
          <div className="flex items-center justify-between gap-3 border-t-2 border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Mostrar:</span>
              <select
                value={itemsPorPagina}
                onChange={e => setItemsPorPagina(Number(e.target.value))}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {OPCIONES_ITEMS_POR_PAGINA.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-gray-400">•</span>
              <span>
                {totalItems === 0
                  ? '0 de 0'
                  : `${inicio + 1}-${Math.min(inicio + itemsPorPagina, totalItems)} de ${totalItems}`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaginaActual(1)}
                disabled={paginaSegura === 1}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Primera página"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaSegura === 1}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Anterior"
              >
                ‹
              </button>
              <span className="px-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Página {paginaSegura} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaSegura === totalPaginas}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Siguiente"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaSegura === totalPaginas}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Última página"
              >
                »
              </button>
            </div>
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
