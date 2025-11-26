// components/gerencia/GrupoCard.tsx
// NOTA: Este componente no se usa actualmente pero se mantiene para compatibilidad futura
import { Proyecto } from '../../types/gerencia.types';

interface GrupoCardProps {
  proyecto: Proyecto;
  onClick: () => void;
}

export default function GrupoCard({ proyecto, onClick }: GrupoCardProps) {
  const colors = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      dot: 'bg-emerald-500',
      text: 'text-emerald-900 dark:text-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
    },
    warn: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      dot: 'bg-amber-500',
      text: 'text-amber-900 dark:text-amber-100',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-300 dark:border-rose-700',
      dot: 'bg-rose-500',
      text: 'text-rose-900 dark:text-rose-100',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
      hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50'
    }
  };

  const theme = colors[proyecto.estado];
  const progreso = Math.round((proyecto.resumen.enCIF / proyecto.resumen.totalProductos) * 100);

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full rounded-xl border-2 p-5 text-left transition-all duration-300
        shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        ${theme.bg} ${theme.border} ${theme.hoverBg}
      `}
    >
      {/* Status dot y criticidad */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
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
        <span className={`inline-block h-3 w-3 rounded-full ${theme.dot} animate-pulse`} />
      </div>

      {/* Type badge */}
      <div className="mb-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${theme.badge}`}>
          Proyecto
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold ${theme.text} mb-2 pr-16`}>
        {proyecto.nombre}
      </h3>

      {/* Responsable */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Responsable: {proyecto.responsable}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-500">Productos</p>
          <p className={`text-xl font-bold ${theme.text}`}>
            {proyecto.resumen.totalProductos}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-500">Progreso</p>
          <p className={`text-xl font-bold ${theme.text}`}>
            {progreso}%
          </p>
        </div>
      </div>

      {/* Fechas */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <div>
          <span className="font-medium">Inicio:</span> {new Date(proyecto.fechaInicio).toLocaleDateString('es-HN')}
        </div>
        <div>
          <span className="font-medium">Límite:</span> {new Date(proyecto.fechaLimite).toLocaleDateString('es-HN')}
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <svg
          className={`h-5 w-5 ${theme.text}`}
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
    </button>
  );
}