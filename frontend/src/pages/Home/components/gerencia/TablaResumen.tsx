// components/gerencia/TablaResumen.tsx
import { ResumenProcesos } from '../../types/gerencia.types';

interface TablaResumenProps {
  resumen: ResumenProcesos;
  titulo: string;
  subtitulo?: string;
}

interface FilaProceso {
  nombre: string;
  valor: number;
  total: number;
  esTotal?: boolean;
}

export default function TablaResumen({ resumen, titulo, subtitulo }: TablaResumenProps) {
  const calcularPorcentaje = (valor: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  const getColorPorcentaje = (porcentaje: number): string => {
    if (porcentaje >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (porcentaje >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
  };

  const filas: FilaProceso[] = [
    { nombre: 'Total productos', valor: resumen.totalProductos, total: resumen.totalProductos, esTotal: true },
    { nombre: 'Cotizados', valor: resumen.cotizados, total: resumen.totalProductos },
    { nombre: 'Con solicitud de descuento', valor: resumen.conDescuento, total: resumen.totalProductos },
    { nombre: 'Comprados', valor: resumen.comprados, total: resumen.totalProductos },
    { nombre: 'Pagados', valor: resumen.pagados, total: resumen.totalProductos },
    { nombre: 'Con primer seguimiento', valor: resumen.primerSeguimiento, total: resumen.totalProductos },
    { nombre: 'En FOB', valor: resumen.enFOB, total: resumen.totalProductos },
    { nombre: 'Con BL', valor: resumen.conBL, total: resumen.totalProductos },
    { nombre: 'Con segundo seguimiento', valor: resumen.segundoSeguimiento, total: resumen.totalProductos },
    { nombre: 'En CIF', valor: resumen.enCIF, total: resumen.totalProductos }
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filas.map((fila, idx) => {
              const porcentaje = calcularPorcentaje(fila.valor, fila.total);
              const colorClass = getColorPorcentaje(porcentaje);

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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}