// components/gerencia/PanelProyectos.tsx
import { Proyecto } from '../../types/gerencia.types';

interface PanelProyectosProps {
  proyectos: Proyecto[];
  proyectoSeleccionado: Proyecto | null;
  onSelectProyecto: (proyecto: Proyecto) => void;
}

export default function PanelProyectos({
  proyectos,
  proyectoSeleccionado,
  onSelectProyecto
}: PanelProyectosProps) {
  const colors = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300'
    },
    warn: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-300 dark:border-rose-700',
      dot: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300'
    }
  };

  // Ordenados por criticidad
  const proyectosOrdenados = [...proyectos].sort((a, b) => b.criticidad - a.criticidad);

  return (
    <div className="w-80 flex-shrink-0 space-y-3">
      <div className="sticky top-4">
        <h3 className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
          Proyectos
          <span className="ml-2 text-xs font-normal text-gray-500">
            (Ordenados por criticidad)
          </span>
        </h3>
        <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-2">
          {proyectosOrdenados.map((proyecto) => {
            const theme = colors[proyecto.estado];
            const isSelected = proyectoSeleccionado?.id === proyecto.id;

            return (
              <button
                key={proyecto.id}
                onClick={() => onSelectProyecto(proyecto)}
                className={`
                  group relative w-full rounded-lg border-2 p-3 text-left transition-all duration-200
                  ${isSelected
                    ? `${theme.bg} ${theme.border} shadow-md`
                    : 'border-gray-200 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
                  }
                `}
              >
                {/* Criticidad badge */}
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      proyecto.criticidad >= 8
                        ? 'bg-rose-500 text-white'
                        : proyecto.criticidad >= 5
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {proyecto.criticidad}
                  </span>
                </div>

                {/* Status dot */}
                <div className="mb-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${theme.dot} mr-2`} />
                  <span className={`text-xs font-medium ${theme.text}`}>
                    {proyecto.estado === 'success'
                      ? 'Normal'
                      : proyecto.estado === 'warn'
                      ? 'Atención'
                      : 'Crítico'}
                  </span>
                </div>

                {/* Nombre proyecto */}
                <h4 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {proyecto.nombre}
                </h4>

                {/* Responsable */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {/*proyecto.responsable*/}
                </p>

                {/* Stats mini */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div>
                    {/* <span className="text-gray-500 dark:text-gray-500">Productos:</span> */}
                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                      {/*proyecto.resumen.totalProductos*/}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-500">Progreso:</span>
                    <span className={`ml-1 font-semibold ${theme.text}`}>
                      {Math.round((proyecto.resumen.enCIF / proyecto.resumen.totalProductos) * 100)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}