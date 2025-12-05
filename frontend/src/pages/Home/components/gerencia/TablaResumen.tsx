// components/gerencia/TablaResumen.tsx - CON COLORES POR CRITICIDAD
import { ResumenProcesos } from '../../types/gerencia.types';
import { ProductoDetallado } from '../../types/gerencia.types';

interface TablaResumenProps {
  resumen: ResumenProcesos;
  titulo: string;
  subtitulo?: string;
  onVerDetalle: (etapa: string) => void;
  productosDetallados: ProductoDetallado[]; // NUEVO: necesitamos los productos para calcular criticidad
}

interface FilaProceso {
  nombre: string;
  valor: number;
  total: number;
  esTotal?: boolean;
  etapaKey: string;
}

export default function TablaResumen({ 
  resumen, 
  titulo, 
  subtitulo, 
  onVerDetalle,
  productosDetallados 
}: TablaResumenProps) {
  const calcularPorcentaje = (valor: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  /**
   * NUEVA LÓGICA: Color según criticidad (días de atraso), NO según % completado
   * 
   * REGLAS:
   * 🔴 ROJO:    Si hay AL MENOS 1 producto con atraso en esa etapa
   * 🟠 NARANJA: Si hay productos en proceso pero SIN atraso
   * 🟢 VERDE:   Si todos están completados y a tiempo
   */
  const getColorPorCriticidad = (etapaKey: string): string => {
    if (etapaKey === 'total') {
      // Para total, revisar si hay algún producto atrasado en cualquier etapa
      const hayAtrasados = productosDetallados.some(p => {
        const etapas = ['cotizado', 'conDescuento', 'comprado', 'pagado', 'primerSeguimiento', 'enFOB', 'conBL', 'segundoSeguimiento', 'enCIF', 'recibido'];
        return etapas.some(e => p[e as keyof ProductoDetallado] === 'atrasado');
      });
      
      const hayEnProceso = productosDetallados.some(p => {
        const etapas = ['cotizado', 'conDescuento', 'comprado', 'pagado', 'primerSeguimiento', 'enFOB', 'conBL', 'segundoSeguimiento', 'enCIF', 'recibido'];
        return etapas.some(e => p[e as keyof ProductoDetallado] === 'en_proceso');
      });

      if (hayAtrasados) return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
      if (hayEnProceso) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    }

    // Para etapas específicas
    const hayAtrasados = productosDetallados.some(p => 
      p[etapaKey as keyof ProductoDetallado] === 'atrasado'
    );

    const hayEnProceso = productosDetallados.some(p => 
      p[etapaKey as keyof ProductoDetallado] === 'en_proceso'
    );

    if (hayAtrasados) {
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
    } else if (hayEnProceso) {
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    } else {
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  const filas: FilaProceso[] = [
    { nombre: 'Total productos', valor: resumen.totalProductos, total: resumen.totalProductos, esTotal: true, etapaKey: 'total' },
    { nombre: 'Cotizados', valor: resumen.cotizados, total: resumen.totalProductos, etapaKey: 'cotizado' },
    { nombre: 'Con solicitud de descuento', valor: resumen.conDescuento, total: resumen.totalProductos, etapaKey: 'conDescuento' },
    { nombre: 'Comprados', valor: resumen.comprados, total: resumen.totalProductos, etapaKey: 'comprado' },
    { nombre: 'Pagados', valor: resumen.pagados, total: resumen.totalProductos, etapaKey: 'pagado' },
    { nombre: 'Con primer seguimiento', valor: resumen.primerSeguimiento, total: resumen.totalProductos, etapaKey: 'primerSeguimiento' },
    { nombre: 'En FOB', valor: resumen.enFOB, total: resumen.totalProductos, etapaKey: 'enFOB' },
    { nombre: 'Con BL', valor: resumen.conBL, total: resumen.totalProductos, etapaKey: 'conBL' },
    { nombre: 'Con segundo seguimiento', valor: resumen.segundoSeguimiento, total: resumen.totalProductos, etapaKey: 'segundoSeguimiento' },
    { nombre: 'En CIF', valor: resumen.enCIF, total: resumen.totalProductos, etapaKey: 'enCIF' }
  ];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {titulo}
        </h3>
        {subtitulo && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitulo}
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200">
                Proceso
              </th>
              <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                Productos
              </th>
              <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                Porcentaje
              </th>
              <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filas.map((fila, idx) => {
              const porcentaje = calcularPorcentaje(fila.valor, fila.total);
              const colorClass = getColorPorCriticidad(fila.etapaKey);

              return (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    fila.esTotal
                      ? 'bg-blue-100 font-semibold dark:bg-blue-900/30'
                      : ''
                  }`}
                >
                  <td className="px-6 py-3 text-base text-gray-900 dark:text-white">
                    {fila.nombre}
                  </td>
                  <td className="px-6 py-3 text-center text-base text-gray-700 dark:text-gray-300">
                    {fila.esTotal ? (
                      <span className="font-bold text-lg">{fila.valor}</span>
                    ) : (
                      <>
                        <span className="font-semibold">{fila.valor}</span>
                        <span className="text-gray-500 dark:text-gray-500">/{fila.total}</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-block rounded-full px-4 py-1 text-base font-bold ${colorClass}`}>
                      {porcentaje}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => onVerDetalle(fila.etapaKey)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-500"></span>
          <span>Con productos atrasados</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
          <span>En proceso (a tiempo)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
          <span>Completado o a tiempo</span>
        </div>
      </div>
    </div>
  );
}