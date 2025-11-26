// components/gerencia/Breadcrumbs.tsx
import { NavegacionContext } from '../../types/gerencia.types';

interface BreadcrumbsProps {
  navegacion: NavegacionContext;
  onNavigate: (nivel: 1 | 2 | 3) => void;
}

export default function Breadcrumbs({ navegacion, onNavigate }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      {/* Inicio */}
      <button
        onClick={() => onNavigate(1)}
        className={`transition-colors ${
          navegacion.nivel === 1
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        Inicio
      </button>

      {/* Área */}
      {navegacion.area && (
        <>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => onNavigate(2)}
            className={`transition-colors ${
              navegacion.nivel === 2
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {navegacion.area.nombre}
          </button>
        </>
      )}

      {/* Proyecto */}
      {navegacion.proyecto && navegacion.nivel === 3 && (
        <>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {navegacion.proyecto.nombre.length > 50
              ? navegacion.proyecto.nombre.substring(0, 50) + '...'
              : navegacion.proyecto.nombre}
          </span>
        </>
      )}
    </div>
  );
}