// components/gerencia/AreaCard.tsx
import { Area } from '../../types/gerencia.types';

interface AreaCardProps {
  area: Area;
  onClick: () => void;
}

export function contarProyectos(area: Area): number {
    return area.totalProyectos || 0;
  }

export default function AreaCard({ area, onClick }: AreaCardProps) {
  const colors = {
    proyectos: {
      gradient: 'from-blue-500 to-blue-600',
      icon: '🏗️',
      hover: 'hover:shadow-blue-500/30'
    },
    comercial: {
      gradient: 'from-emerald-500 to-emerald-600',
      icon: '💼',
      hover: 'hover:shadow-emerald-500/30'
    },
    tecnica: {
      gradient: 'from-purple-500 to-purple-600',
      icon: '⚙️',
      hover: 'hover:shadow-purple-500/30'
    },
    operativa: {
      gradient: 'from-amber-500 to-amber-600',
      icon: '📊',
      hover: 'hover:shadow-amber-500/30'
    }
  };

  

  const theme = colors[area.tipo as keyof typeof colors];

  function tipoProyecto(tipo: string) {
    switch (tipo) {
      case 'proyectos':
        return 'proyectos';
      case 'comercial':
        return 'compras comerciales';
      case 'tecnica':
        return 'compras area técnica';
      case 'operativa':
        return 'compras area operativa';
      default:
        return '';
    }
  }

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${theme.hover}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-2xl shadow-md`}>
          {theme.icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {area.nombre}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {contarProyectos(area)} {tipoProyecto(area.tipo)}
          </p>
        </div>
        <div className="flex-shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}