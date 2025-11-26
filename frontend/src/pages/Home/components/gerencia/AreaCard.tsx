// components/gerencia/AreaCard.tsx
import { Area } from '../../types/gerencia.types';

interface AreaCardProps {
  area: Area;
  onClick: () => void;
}

interface FilaProceso {
  nombre: string;
  valor: number;
  total: number;
  esTotal?: boolean;
}

export default function AreaCard({ area, onClick }: AreaCardProps) {
  const { resumen } = area;

  const calcularPorcentaje = (valor: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  const getColorPorcentaje = (porcentaje: number): string => {
    if (porcentaje >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (porcentaje >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
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

  const subtituloMap: Record<string, string> = {
    proyectos: 'Resumen de cotizaciones de todos los proyectos',
    comercial: 'Resumen de cotizaciones comerciales',
    tecnica: 'Resumen de cotizaciones del área técnica',
    operativa: 'Resumen de cotizaciones del área operativa'
  };

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{area.icono}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {area.nombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtituloMap[area.tipo]}
            </p>
          </div>
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Proceso
              </th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                Productos
              </th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filas.map((fila, idx) => {
              const porcentaje = calcularPorcentaje(fila.valor, fila.total);
              const colorPorcentaje = getColorPorcentaje(porcentaje);

              return (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    fila.esTotal
                      ? 'bg-blue-50 font-semibold dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {fila.nombre}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                    {fila.esTotal ? (
                      <span className="font-bold">{fila.valor}</span>
                    ) : (
                      `${fila.valor}/${fila.total}`
                    )}
                  </td>
                  <td className={`px-4 py-2 text-center font-bold ${colorPorcentaje}`}>
                    {porcentaje}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </button>
  );
}