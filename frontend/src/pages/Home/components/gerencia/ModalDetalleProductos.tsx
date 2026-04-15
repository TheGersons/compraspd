// components/gerencia/ModalDetalleProductos.tsx - VERSIÓN FINAL
import { useMemo, useState } from 'react';
import { ProductoDetallado, EtapaDetalle } from '../../types/gerencia.types';

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

  const esVistaTotal = etapa === 'total';

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // FILTRADO (solo para vista específica)
    if (!esVistaTotal) {
      resultado = resultado.filter(p => p.estados[etapa] !== 'pendiente');
    }

    // ORDENAMIENTO
    resultado.sort((a, b) => {
      if (ordenColumna === 'default') {
        const getEstadoMasCritico = (producto: ProductoDetallado): EstadoProducto => {
          if (ESTADOS_INTERNACIONAL.some(e => producto.estados[e] === 'atrasado')) return 'atrasado';
          if (ESTADOS_INTERNACIONAL.some(e => producto.estados[e] === 'en_proceso')) return 'en_proceso';
          return 'completado';
        };

        const estadoA = esVistaTotal ? getEstadoMasCritico(a) : (a.estados[etapa] as EstadoProducto);
        const estadoB = esVistaTotal ? getEstadoMasCritico(b) : (b.estados[etapa] as EstadoProducto);

        const prioridadEstado: Record<EstadoProducto, number> = { atrasado: 1, en_proceso: 2, completado: 3, pendiente: 4 };
        const prioA = prioridadEstado[estadoA] || 4;
        const prioB = prioridadEstado[estadoB] || 4;
        if (prioA !== prioB) return prioA - prioB;

        const getDiasAtrasoMax = (p: ProductoDetallado): number =>
          Math.max(...Object.values(p.diasAtraso).map(v => v || 0), 0);

        return getDiasAtrasoMax(b) - getDiasAtrasoMax(a);
      } else if (ordenColumna === 'sku') {
        const compare = a.sku.localeCompare(b.sku);
        return direccionOrden === 'asc' ? compare : -compare;
      } else if (ordenColumna === 'descripcion') {
        const compare = a.descripcion.localeCompare(b.descripcion);
        return direccionOrden === 'asc' ? compare : -compare;
      } else if (ordenColumna === 'estado' && !esVistaTotal) {
        const prioridadEstado: Record<EstadoProducto, number> = { atrasado: 1, en_proceso: 2, completado: 3, pendiente: 4 };
        const compare = (prioridadEstado[a.estados[etapa] as EstadoProducto] || 4) - (prioridadEstado[b.estados[etapa] as EstadoProducto] || 4);
        return direccionOrden === 'asc' ? compare : -compare;
      } else if (ordenColumna === 'dias' && !esVistaTotal) {
        const atrasoA = a.diasAtraso[`diasAtraso_${etapa}`] || 0;
        const atrasoB = b.diasAtraso[`diasAtraso_${etapa}`] || 0;
        const compare = atrasoA - atrasoB;
        return direccionOrden === 'asc' ? compare : -compare;
      }
      return 0;
    });

    return resultado;
  }, [productos, etapa, esVistaTotal, ordenColumna, direccionOrden]);

  if (!isOpen) return null;

  const handleOrdenar = (columna: OrdenColumna) => {
    if (ordenColumna === columna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenColumna(columna);
      setDireccionOrden('asc');
    }
  };

  const nombresEtapas: Record<string, string> = {
    total: 'Todos los productos',
    ...ESTADO_LABELS,
  };

  const getEstadoBadge = (estado: EstadoProducto) => {
    const badges = {
      completado: {
        bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: '✓',
        text: 'Completado'
      },
      en_proceso: {
        bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: '⏳',
        text: 'En Proceso'
      },
      atrasado: {
        bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        icon: '⚠️',
        text: 'Atrasado'
      },
      pendiente: {
        bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        icon: '○',
        text: 'Pendiente'
      }
    };
    return badges[estado] || badges.pendiente;
  };

  const HeaderOrdenable = ({ 
    columna, 
    children, 
    className = '' 
  }: { 
    columna: OrdenColumna; 
    children: React.ReactNode; 
    className?: string;
  }) => {
    const esActivo = ordenColumna === columna;
    return (
      <th 
        onClick={() => handleOrdenar(columna)}
        className={`cursor-pointer select-none transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      >
        <div className="flex items-center justify-center gap-1">
          <span>{children}</span>
          {esActivo && (
            <span className="text-blue-600 dark:text-blue-400">
              {direccionOrden === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  const todasLasEtapas = (tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL).map(key => ({
    key,
    label: ESTADO_LABELS[key] || key,
  }));

  return (
    <div className="fixed inset-0 z-9950 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div>
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
                    ordenColumna === 'estado' ? 'Estado' :
                    'Días de atraso'
                  }
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                      <th key={key} className="px-3 py-3 text-center font-bold text-gray-700 dark:text-gray-200">
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
                      </td>
                      {todasLasEtapas.map(({ key }) => {
                        const estado = (producto.estados[key] || 'pendiente') as EstadoProducto;
                        const badge = getEstadoBadge(estado);
                        return (
                          <td key={key} className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.bg}`}>
                              <span>{badge.icon}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
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

                    return (
                      <tr key={producto.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {producto.sku}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          <div className="max-w-md">{producto.descripcion}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.bg}`}>
                            <span>{badge.icon}</span>
                            <span>{badge.text}</span>
                          </span>
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
                            <span className="text-gray-500 dark:text-gray-400">
                              —
                            </span>
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

        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Haz click en los encabezados de las columnas para ordenar la tabla
            • Por defecto: productos más críticos primero
          </p>
        </div>
      </div>
    </div>
  );
}