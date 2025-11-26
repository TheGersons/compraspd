import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useKpiGenerator } from "./hooks/useKpiGenerator";
import { KpiData } from "./types/kpi.types";
import { useKpiMonitor } from "./hooks/useKPIMonitor";
import DashboardGerencia from "./DashboardGerencia";
import KpiCard from "./components/KpiCard";

// ============================================================================
// TYPES
// ============================================================================

type Area = "Proyectos" | "Comercial" | "Área Técnica" | "Operativa";
type VistaType = "operativa" | "gerencial";

// ============================================================================
// CAROUSEL COMPONENT
// ============================================================================

function KpiCarousel({
    items,
    autoPlayInterval = 5000
}: {
    items: KpiData[];
    autoPlayInterval?: number;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const containerRef = useRef<HTMLDivElement>(null);

    const getItemsPerPage = () => {
        if (typeof window === 'undefined') return 5;
        const width = window.innerWidth;
        if (width < 640) return 2;
        if (width < 1024) return 3;
        if (width < 1280) return 4;
        return 5;
    };

    const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

    useEffect(() => {
        const handleResize = () => setItemsPerPage(getItemsPerPage());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-play
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
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setTimeout(() => setIsAnimating(false), 400);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setDirection('left');
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setTimeout(() => setIsAnimating(false), 400);
    };

    const getVisibleItems = () => {
        const result: KpiData[] = [];
        for (let i = 0; i < itemsPerPage; i++) {
            const index = (currentIndex + i) % items.length;
            result.push(items[index]);
        }
        return result;
    };

    const visibleItems = getVisibleItems();

    return (
        <div
            ref={containerRef}
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center gap-3">
                {/* Botón Anterior */}
                <button
                    onClick={handlePrev}
                    disabled={isAnimating}
                    className={`
                        flex-shrink-0 flex items-center justify-center
                        w-10 h-10 rounded-full
                        border-2 transition-all duration-200
                        border-gray-300 dark:border-gray-700 
                        bg-white dark:bg-gray-800 
                        hover:border-blue-500 dark:hover:border-blue-600 
                        hover:bg-blue-50 dark:hover:bg-blue-950/30 
                        text-gray-700 dark:text-gray-300 
                        hover:text-blue-600 dark:hover:text-blue-400 
                        hover:scale-110 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:hover:scale-100 disabled:hover:border-gray-300 
                        dark:disabled:hover:border-gray-700
                    `}
                    aria-label="Anterior"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Cards Container */}
                <div className="flex-1">
                    <div 
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-all duration-400 ease-out"
                        style={{
                            transform: isAnimating 
                                ? direction === 'right' 
                                    ? 'translateX(-20px)' 
                                    : 'translateX(20px)'
                                : 'translateX(0)',
                            opacity: isAnimating ? 0.7 : 1
                        }}
                    >
                        {visibleItems.map((item, idx) => {
                            const actualIndex = (currentIndex + idx) % items.length;
                            const uniqueKey = `${item.id}-${actualIndex}`;
                            return (
                                <div key={uniqueKey}>
                                    <KpiCard
                                        id={item.id}
                                        title={item.title}
                                        value={item.value}
                                        hint={item.hint}
                                        tone={item.tone}
                                        type={item.type}
                                        columns={item.columns}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Botón Siguiente */}
                <button
                    onClick={handleNext}
                    disabled={isAnimating}
                    className={`
                        flex-shrink-0 flex items-center justify-center
                        w-10 h-10 rounded-full
                        border-2 transition-all duration-200
                        border-gray-300 dark:border-gray-700 
                        bg-white dark:bg-gray-800 
                        hover:border-blue-500 dark:hover:border-blue-600 
                        hover:bg-blue-50 dark:hover:bg-blue-950/30 
                        text-gray-700 dark:text-gray-300 
                        hover:text-blue-600 dark:hover:text-blue-400 
                        hover:scale-110 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:hover:scale-100 disabled:hover:border-gray-300 
                        dark:disabled:hover:border-gray-700
                    `}
                    aria-label="Siguiente"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-3 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                    {items.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentIndex
                                    ? "w-6 bg-blue-600 dark:bg-blue-500"
                                    : "w-1.5 bg-gray-300 dark:bg-gray-600"
                            }`}
                        />
                    ))}
                </div>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {currentIndex + 1} / {items.length}
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
    const [selectedArea, setSelectedArea] = useState<Area | "Todas">("Todas");
    const [vista, setVista] = useState<VistaType>("operativa");
    const { cotizacionesKpis, comprasKpis, importExportKpis, loading } = useKpiGenerator();
    
    // Monitor de KPIs - genera notificaciones automáticas
    useKpiMonitor(cotizacionesKpis, comprasKpis, importExportKpis);

    if (loading) {
        return (
            <>
                <PageMeta
                    title="Dashboard"
                    description="Panel de control principal"
                />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Cargando indicadores...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // Si la vista es gerencial, renderizar DashboardGerencia
    if (vista === "gerencial") {
        return (
            <>
                <PageMeta
                    title="Dashboard Gerencial"
                    description="Vista ejecutiva de seguimiento"
                />
                
                {/* Toggle de Vista */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <button
                            onClick={() => setVista("operativa")}
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Vista Operativa
                        </button>
                        <button
                            onClick={() => setVista("gerencial")}
                            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-blue-600 text-white shadow-sm"
                        >
                            Vista Gerencial
                        </button>
                    </div>
                </div>

                <DashboardGerencia />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title="Dashboard"
                description="Panel de control principal - Cotizaciones, Compras e Import/Export"
            />

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
                        Indicadores de control y desempeño del área de Compras
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle de Vista */}
                    <div className="flex items-center gap-1 rounded-lg border-2 border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <button
                            onClick={() => setVista("operativa")}
                            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-blue-600 text-white shadow-sm"
                        >
                            Operativa
                        </button>
                        <button
                            onClick={() => setVista("gerencial")}
                            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Gerencial
                        </button>
                    </div>

                    {/* Filtro de Área */}
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="area-filter"
                            className="text-xs font-medium text-gray-600 dark:text-gray-400"
                        >
                            Área:
                        </label>
                        <select
                            id="area-filter"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value as Area | "Todas")}
                            className="h-9 min-w-[160px] rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 dark:focus:border-blue-600"
                        >
                            <option value="Todas">Todas las áreas</option>
                            <option value="Proyectos">Proyectos</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Área Técnica">Área Técnica</option>
                            <option value="Operativa">Operativa</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="h-4" />

            {/* Sección 1: Cotizaciones */}
            <section className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                    <Button size="sm" variant="headerContainer" shape="pill">
                        Cotizaciones
                    </Button>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {cotizacionesKpis.length} indicadores
                    </span>
                </div>
                <KpiCarousel items={cotizacionesKpis} autoPlayInterval={6000} />
            </section>

            {/* Sección 2: Compras */}
            <section className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                    <Button size="sm" variant="headerContainer" shape="pill">
                        Compras
                    </Button>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {comprasKpis.length} indicadores
                    </span>
                </div>
                <KpiCarousel items={comprasKpis} autoPlayInterval={7000} />
            </section>

            {/* Sección 3: Import/Export */}
            <section className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                    <Button size="sm" variant="headerContainer" shape="pill">
                        Import / Export
                    </Button>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {importExportKpis.length} indicadores
                    </span>
                </div>
                <KpiCarousel items={importExportKpis} autoPlayInterval={8000} />
            </section>

            {/* Footer Info */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/30">
                <div className="flex items-start gap-2">
                    <div className="text-lg">ℹ️</div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Los datos se actualizan automáticamente cada 5 minutos
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                            Última actualización: {new Date().toLocaleTimeString('es-HN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })} • Click en cualquier tarjeta para ver detalles
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}