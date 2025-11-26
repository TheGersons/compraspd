// components/gerencia/MetricaCard.tsx
// NOTA: Este componente no se usa actualmente pero se mantiene para compatibilidad futura

interface MetricaCardProps {
  nombre: string;
  icono?: string;
  valor: number;
  total: number;
  descripcion?: string;
  onClick: () => void;
}

export default function MetricaCard({
  nombre,
  icono,
  valor,
  total,
  descripcion,
  onClick
}: MetricaCardProps) {
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;

  // Determinar estado según porcentaje
  const getEstado = () => {
    if (porcentaje >= 80) return 'success';
    if (porcentaje >= 50) return 'warn';
    return 'danger';
  };

  const estado = getEstado();

  const colors = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      progress: 'bg-emerald-500',
      text: 'text-emerald-900 dark:text-emerald-100',
      hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
    },
    warn: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      progress: 'bg-amber-500',
      text: 'text-amber-900 dark:text-amber-100',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-300 dark:border-rose-700',
      progress: 'bg-rose-500',
      text: 'text-rose-900 dark:text-rose-100',
      hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50'
    }
  };

  const theme = colors[estado];

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full rounded-xl border-2 p-5 text-left transition-all duration-300
        shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        ${theme.bg} ${theme.border} ${theme.hoverBg}
      `}
    >
      {/* Icon and percentage */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icono || '📊'}</div>
        <div className={`text-2xl font-bold ${theme.text}`}>
          {porcentaje}%
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-base font-bold ${theme.text} mb-2`}>
        {nombre}
      </h3>

      {/* Description */}
      {descripcion && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {descripcion}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Progreso</span>
          <span className={`font-semibold ${theme.text}`}>
            {valor} / {total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${theme.progress}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Click indicator */}
      <div className="flex items-center justify-end">
        <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
          Ver detalle
        </span>
        <svg
          className={`ml-1 h-4 w-4 ${theme.text} opacity-0 transition-opacity group-hover:opacity-100`}
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