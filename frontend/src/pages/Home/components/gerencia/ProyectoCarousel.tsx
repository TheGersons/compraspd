// components/gerencia/ProyectoCarousel.tsx
import { useState, useEffect } from 'react';
import { Proyecto } from '../../types/gerencia.types';

interface ProyectoCarouselProps {
  proyectos: Proyecto[];
  autoPlayInterval?: number;
}

export default function ProyectoCarousel({
  proyectos,
  autoPlayInterval = 6000
}: ProyectoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPaused, currentIndex, autoPlayInterval]);

  const handleNext = () => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % proyectos.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + proyectos.length) % proyectos.length);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const getVisibleItems = () => {
    const result: Proyecto[] = [];
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (currentIndex + i) % proyectos.length;
      result.push(proyectos[index]);
    }
    return result;
  };

  const visibleItems = getVisibleItems();

  const colors = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      progress: 'bg-emerald-500',
      text: 'text-emerald-900 dark:text-emerald-100'
    },
    warn: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      progress: 'bg-amber-500',
      text: 'text-amber-900 dark:text-amber-100'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-300 dark:border-rose-700',
      progress: 'bg-rose-500',
      text: 'text-rose-900 dark:text-rose-100'
    }
  };

  // Calcular progreso basado en CIF vs Total
  const calcularProgreso = (proyecto: Proyecto): number => {
    const { enCIF, totalProductos } = proyecto.resumen;
    if (totalProductos === 0) return 0;
    return Math.round((enCIF / totalProductos) * 100);
  };

  // Calcular días restantes
  const calcularDiasRestantes = (fechaLimite: string): number => {
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    const diff = limite.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3">
        {/* Botón Anterior */}
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition-all duration-200 hover:scale-110 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
          aria-label="Anterior"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Proyectos Container */}
        <div className="flex-1">
          <div
            className="grid gap-3 transition-all duration-400 ease-out sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{
              transform: isAnimating
                ? direction === 'right'
                  ? 'translateX(-20px)'
                  : 'translateX(20px)'
                : 'translateX(0)',
              opacity: isAnimating ? 0.7 : 1
            }}
          >
            {visibleItems.map((proyecto, idx) => {
              const actualIndex = (currentIndex + idx) % proyectos.length;
              const uniqueKey = `${proyecto.id}-${actualIndex}`;
              const theme = colors[proyecto.estado];
              const progreso = calcularProgreso(proyecto);
              const diasRestantes = calcularDiasRestantes(proyecto.fechaLimite);

              return (
                <div
                  key={uniqueKey}
                  className={`rounded-lg border-2 p-4 shadow-md ${theme.bg} ${theme.border}`}
                >
                  {/* Header con criticidad */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${theme.text} line-clamp-2 min-h-[2.5rem]`}>
                        {proyecto.nombre}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {proyecto.responsable}
                      </p>
                    </div>
                    {/* Badge criticidad */}
                    <span
                      className={`ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className={`font-semibold ${theme.text}`}>{progreso}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full transition-all duration-300 ${theme.progress}`}
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Productos</p>
                      <p className={`font-bold ${theme.text}`}>
                        {proyecto.resumen.enCIF}/{proyecto.resumen.totalProductos}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Días restantes</p>
                      <p className={`font-bold ${theme.text}`}>
                        {diasRestantes > 0 ? diasRestantes : `${Math.abs(diasRestantes)} retraso`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition-all duration-200 hover:scale-110 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
          aria-label="Siguiente"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicator */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1.5">
          {proyectos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-blue-600 dark:bg-blue-500'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {proyectos.length}
        </span>
      </div>
    </div>
  );
}