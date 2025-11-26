// components/gerencia/GraficoComparativo.tsx
import { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Proyecto, AreaType } from '../../types/gerencia.types';

interface GraficoComparativoProps {
    proyectosProyectos: Proyecto[];
    proyectosComercial: Proyecto[];
    proyectosTecnica: Proyecto[];
    proyectosOperativa: Proyecto[];
}

interface DataPoint {
    nombre: string;
    porcentaje: number;
    proyecto: Proyecto;
    criticidad: number;
}

interface DataProceso {
    proceso: string;
    valor: number;
    total: number;
    porcentaje: number;
}

type TipoGrafico = 'bar' | 'area' | 'line';

export default function GraficoComparativo({
    proyectosProyectos,
    proyectosComercial,
    proyectosTecnica,
    proyectosOperativa
}: GraficoComparativoProps) {
    const [areaSeleccionada, setAreaSeleccionada] = useState<AreaType | 'todas'>('proyectos');
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('bar');

    // Obtener proyectos según área seleccionada
    const proyectosFiltrados = useMemo(() => {
        if (areaSeleccionada === 'todas') {
            return [...proyectosProyectos, ...proyectosComercial, ...proyectosTecnica, ...proyectosOperativa];
        }
        switch (areaSeleccionada) {
            case 'proyectos':
                return proyectosProyectos;
            case 'comercial':
                return proyectosComercial;
            case 'tecnica':
                return proyectosTecnica;
            case 'operativa':
                return proyectosOperativa;
            default:
                return proyectosProyectos;
        }
    }, [areaSeleccionada, proyectosProyectos, proyectosComercial, proyectosTecnica, proyectosOperativa]);

    // Preparar datos para el gráfico general
    const datosGenerales: DataPoint[] = useMemo(() => {
        return proyectosFiltrados.map((proyecto) => {
            const { enCIF, totalProductos } = proyecto.resumen;
            const porcentaje = totalProductos > 0 ? Math.round((enCIF / totalProductos) * 100) : 0;

            return {
                nombre: proyecto.nombre.length > 30 ? proyecto.nombre.substring(0, 30) + '...' : proyecto.nombre,
                porcentaje,
                proyecto,
                criticidad: proyecto.criticidad
            };
        }).sort((a, b) => b.criticidad - a.criticidad);
    }, [proyectosFiltrados]);

    // Preparar datos para drill-down
    const datosDrillDown: DataProceso[] = proyectoSeleccionado
        ? [
            {
                proceso: 'Cotizados',
                valor: proyectoSeleccionado.resumen.cotizados,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.cotizados / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'Con Descuento',
                valor: proyectoSeleccionado.resumen.conDescuento,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.conDescuento / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'Comprados',
                valor: proyectoSeleccionado.resumen.comprados,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.comprados / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'Pagados',
                valor: proyectoSeleccionado.resumen.pagados,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.pagados / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: '1er Seguimiento',
                valor: proyectoSeleccionado.resumen.primerSeguimiento,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.primerSeguimiento / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'En FOB',
                valor: proyectoSeleccionado.resumen.enFOB,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.enFOB / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'Con BL',
                valor: proyectoSeleccionado.resumen.conBL,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.conBL / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: '2do Seguimiento',
                valor: proyectoSeleccionado.resumen.segundoSeguimiento,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.segundoSeguimiento / proyectoSeleccionado.resumen.totalProductos) * 100)
            },
            {
                proceso: 'En CIF',
                valor: proyectoSeleccionado.resumen.enCIF,
                total: proyectoSeleccionado.resumen.totalProductos,
                porcentaje: Math.round((proyectoSeleccionado.resumen.enCIF / proyectoSeleccionado.resumen.totalProductos) * 100)
            }
        ]
        : [];

    // Colores
    const getColorByCriticidad = (criticidad: number) => {
        if (criticidad >= 8) return '#ef4444';
        if (criticidad >= 5) return '#f59e0b';
        return '#10b981';
    };

    const getColorByPorcentaje = (porcentaje: number) => {
        if (porcentaje >= 80) return '#10b981';
        if (porcentaje >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const handleBarClick = (data: any) => {
        if (data && data.payload && data.payload.proyecto) {
            setProyectoSeleccionado(data.payload.proyecto);
        }
    };

    const handleVolver = () => {
        setProyectoSeleccionado(null);
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            if (proyectoSeleccionado) {
                return (
                    <div className="rounded-xl border-2 border-blue-200 bg-white p-4 shadow-2xl dark:border-blue-700 dark:bg-gray-800">
                        <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{data.proceso}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {data.valor} de {data.total} productos
                        </p>
                        <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                            {data.porcentaje}%
                        </p>
                    </div>
                );
            } else {
                return (
                    <div className="rounded-xl border-2 border-blue-200 bg-white p-4 shadow-2xl dark:border-blue-700 dark:bg-gray-800">
                        <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
                            {data.proyecto.nombre}
                        </p>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <p>
                                <span className="font-medium">Responsable:</span> {data.proyecto.responsable}
                            </p>
                            <p>
                                <span className="font-medium">Criticidad:</span>{' '}
                                <span
                                    className={`font-bold ${data.criticidad >= 8
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : data.criticidad >= 5
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                >
                                    {data.criticidad}/10
                                </span>
                            </p>
                            <p>
                                {data.proyecto.resumen.enCIF} de {data.proyecto.resumen.totalProductos} completados
                            </p>
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                            {data.porcentaje}%
                        </p>
                        <p className="mt-2 text-xs font-medium text-blue-500 dark:text-blue-400">
                            ↪ Click para ver detalle
                        </p>
                    </div>
                );
            }
        }
        return null;
    };

    // Iconos de áreas
    const getAreaIcon = (area: string) => {
        switch (area) {
            case 'proyectos':
                return '🏗️';
            case 'comercial':
                return '💼';
            case 'tecnica':
                return '🔌';
            case 'operativa':
                return '🖥️';
            default:
                return '📊';
        }
    };

    // Generar leyenda para el panel lateral
const getLeyendaItems = () => {
  if (proyectoSeleccionado) {
    // Drill-down: Abreviaciones estáticas para procesos
    return [
      { abrev: 'COT', nombre: 'Cotizados', color: getColorByPorcentaje(datosDrillDown[0]?.porcentaje || 0) },
      { abrev: 'DESC', nombre: 'Con Descuento', color: getColorByPorcentaje(datosDrillDown[1]?.porcentaje || 0) },
      { abrev: 'COMP', nombre: 'Comprados', color: getColorByPorcentaje(datosDrillDown[2]?.porcentaje || 0) },
      { abrev: 'PAG', nombre: 'Pagados', color: getColorByPorcentaje(datosDrillDown[3]?.porcentaje || 0) },
      { abrev: '1ER', nombre: '1er Seguimiento', color: getColorByPorcentaje(datosDrillDown[4]?.porcentaje || 0) },
      { abrev: 'FOB', nombre: 'En FOB', color: getColorByPorcentaje(datosDrillDown[5]?.porcentaje || 0) },
      { abrev: 'BL', nombre: 'Con BL', color: getColorByPorcentaje(datosDrillDown[6]?.porcentaje || 0) },
      { abrev: '2DO', nombre: '2do Seguimiento', color: getColorByPorcentaje(datosDrillDown[7]?.porcentaje || 0) },
      { abrev: 'CIF', nombre: 'En CIF', color: getColorByPorcentaje(datosDrillDown[8]?.porcentaje || 0) }
    ];
  } else {
    // Vista general: Abreviaciones dinámicas de proyectos
    return datosGenerales.map((item) => {
      const abreviacion = item.proyecto.nombre
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase())
        .join('');
      
      return {
        abrev: abreviacion,
        nombre: item.proyecto.nombre,
        color: getColorByCriticidad(item.criticidad)
      };
    });
  }
};

    // Renderizar gráfico según tipo
    const renderGrafico = () => {
        const commonProps = {
            margin: { top: 5, right: 30, left: 20, bottom: 40 }
        };

        const xAxisProps = {
            dataKey: proyectoSeleccionado ? 'proceso' : 'nombre',
            tick: false, // Ocultamos los ticks del eje X
            height: 1
        };

        const yAxisProps = {
            label: {
                value: 'Porcentaje (%)',
                angle: -90,
                position: 'insideLeft' as const,
                style: { fill: '#6b7280', fontWeight: 600, fontSize: 12 }
            },
            tick: { fill: '#6b7280', fontWeight: 500, fontSize: 12 },
            domain: [0, 100]
        };

        // Renderizar labels personalizados arriba de las barras
        const renderCustomLabel = (props: any) => {
            const { x, y, width, value, payload,  } = props;

            // Validar que tengamos los datos necesarios
            if (!payload || value === undefined || value === null) {
                return null;
            }

            const nombre = payload[proyectoSeleccionado ? 'proceso' : 'nombre'];

            // Si no hay nombre, no renderizar
            if (!nombre) {
                return null;
            }

            // Generar abreviación (primeras letras de cada palabra en mayúsculas)
            const generarAbreviacion = (texto: string): string => {
                return texto
                    .split(' ')
                    .map(palabra => palabra.charAt(0).toUpperCase())
                    .join('');
            };

            const abreviacion = generarAbreviacion(nombre);

            return (
                <g>
                    {/* Porcentaje */}
                    <text
                        x={x + width / 2}
                        y={y - 25}
                        fill="#3b82f6"
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fontSize="13"
                        fontWeight="700"
                    >
                        {value}%
                    </text>
                    {/* Abreviación */}
                    <text
                        x={x + width / 2}
                        y={y - 10}
                        fill="#374151"
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fontSize="11"
                        fontWeight="700"
                        className="dark:fill-gray-300"
                    >
                        {abreviacion}
                    </text>
                </g>
            );
        };

  

        if (proyectoSeleccionado) {
            // Drill-down
            switch (tipoGrafico) {
                case 'area':
                    return (
                        <AreaChart data={datosDrillDown} {...commonProps}>
                            <defs>
                                <linearGradient id="colorDrillDown" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                            <Area
                                type="monotone"
                                dataKey="porcentaje"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorDrillDown)"
                                label={renderCustomLabel}
                            />
                        </AreaChart>
                    );
                case 'line':
                    return (
                        <LineChart data={datosDrillDown} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2 }} />
                            <Line
                                type="monotone"
                                dataKey="porcentaje"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 5 }}
                                activeDot={{ r: 8 }}
                                label={renderCustomLabel}
                            />
                        </LineChart>
                    );
                default:
                    return (
                        <BarChart data={datosDrillDown} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                            <Bar dataKey="porcentaje" radius={[8, 8, 0, 0]} label={renderCustomLabel}>
                                {datosDrillDown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColorByPorcentaje(entry.porcentaje)} />
                                ))}
                            </Bar>
                        </BarChart>
                    );
            }
        } else {
            // Vista general
            switch (tipoGrafico) {
                case 'area':
                    return (
                        <AreaChart data={datosGenerales} {...commonProps}>
                            <defs>
                                <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                            <Area
                                type="monotone"
                                dataKey="porcentaje"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorGeneral)"
                                onClick={handleBarClick}
                                style={{ cursor: 'pointer' }}
                                label={renderCustomLabel}
                            />
                        </AreaChart>
                    );
                case 'line':
                    return (
                        <LineChart data={datosGenerales} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2 }} />
                            <Line
                                type="monotone"
                                dataKey="porcentaje"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 5 }}
                                activeDot={{ r: 8 }}
                                onClick={handleBarClick}
                                style={{ cursor: 'pointer' }}
                                label={renderCustomLabel}
                            />
                        </LineChart>
                    );
                default:
                    return (
                        <BarChart data={datosGenerales} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                            <Bar dataKey="porcentaje" radius={[8, 8, 0, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }} label={renderCustomLabel}>
                                {datosGenerales.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColorByCriticidad(entry.criticidad)} />
                                ))}
                            </Bar>
                        </BarChart>
                    );
            }
        }
    };

    return (
        <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            {/* Header con controles */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Título */}
                <div className="flex-1">
                    <h2 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-extrabold text-transparent dark:from-blue-400 dark:to-cyan-400">
                        {proyectoSeleccionado
                            ? `📊 Detalle: ${proyectoSeleccionado.nombre}`
                            : '📈 Comparativa de Progreso por Proyecto'}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {proyectoSeleccionado
                            ? `Distribución de ${proyectoSeleccionado.resumen.totalProductos} productos en las diferentes etapas del proceso`
                            : `${datosGenerales.length} proyecto${datosGenerales.length !== 1 ? 's' : ''} ${areaSeleccionada === 'todas' ? 'en todas las áreas' : `del área de ${areaSeleccionada}`
                            } • Porcentaje de completitud (productos en CIF vs Total)`}
                    </p>
                </div>

                {/* Controles */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Selector de área */}
                    {!proyectoSeleccionado && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Área:</label>
                            <select
                                value={areaSeleccionada}
                                onChange={(e) => setAreaSeleccionada(e.target.value as AreaType | 'todas')}
                                className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500"
                            >
                                <option value="proyectos">{getAreaIcon('proyectos')} Proyectos</option>
                                <option value="comercial">{getAreaIcon('comercial')} Comercial</option>
                                <option value="tecnica">{getAreaIcon('tecnica')} Técnica</option>
                                <option value="operativa">{getAreaIcon('operativa')} Operativa</option>
                                <option value="todas">📊 Todas las áreas</option>
                            </select>
                        </div>
                    )}

                    {/* Selector de tipo de gráfico */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tipo:</label>
                        <div className="flex rounded-lg border-2 border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700">
                            <button
                                onClick={() => setTipoGrafico('bar')}
                                className={`rounded-l-md px-3 py-2 text-sm font-medium transition-all ${tipoGrafico === 'bar'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                title="Gráfico de Barras"
                            >
                                📊
                            </button>
                            <button
                                onClick={() => setTipoGrafico('area')}
                                className={`border-x-2 border-gray-300 px-3 py-2 text-sm font-medium transition-all dark:border-gray-600 ${tipoGrafico === 'area'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                title="Gráfico de Área"
                            >
                                📈
                            </button>
                            <button
                                onClick={() => setTipoGrafico('line')}
                                className={`rounded-r-md px-3 py-2 text-sm font-medium transition-all ${tipoGrafico === 'line'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                title="Gráfico de Línea"
                            >
                                📉
                            </button>
                        </div>
                    </div>

                    {/* Botón volver */}
                    {proyectoSeleccionado && (
                        <button
                            onClick={handleVolver}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl active:scale-95"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Ver Todos
                        </button>
                    )}
                </div>
            </div>

            {/* Leyenda */}
            {!proyectoSeleccionado && (
                <div className="mb-4 flex flex-wrap gap-4 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Baja criticidad (1-4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Media criticidad (5-7)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Alta criticidad (8-10)</span>
                    </div>
                </div>
            )}

            {/* Gráfico + Panel Lateral */}
            <div className="flex gap-4">
                {/* Gráfico */}
                <div className="h-[600px] flex-1 rounded-lg bg-white p-4 dark:bg-gray-800/50">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderGrafico()}
                    </ResponsiveContainer>
                </div>

                {/* Panel Lateral de Leyenda */}
                <div className="w-72 space-y-3 overflow-y-auto rounded-lg bg-gradient-to-b from-blue-50 to-cyan-50 p-4 dark:from-blue-900/20 dark:to-cyan-900/20">
                    {/* Header del panel */}
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            📋 Leyenda
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {proyectoSeleccionado ? 'Procesos del proyecto' : `${datosGenerales.length} proyectos`}
                        </p>
                    </div>

                    {/* Items de leyenda */}
                    <div className="space-y-2">
                        
                    {getLeyendaItems().map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 rounded-lg bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800/50"
                            >
                                {/* Color indicator */}
                                <div
                                    className="h-8 w-8 flex-shrink-0 rounded-md shadow-sm"
                                    style={{ backgroundColor: item.color }}
                                />

                                {/* Abreviación */}
                                <div className="flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {item.abrev}
                                    </span>
                                </div>

                                {/* Nombre completo */}
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {item.nombre}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info adicional en drill-down */}
                    {proyectoSeleccionado && (
                        <div className="mt-4 rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                                💡 Colores por completitud:
                            </p>
                            <div className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-300">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-emerald-500" />
                                    <span>≥80% completo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-amber-500" />
                                    <span>50-79% completo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-rose-500" />
                                    <span>&lt;50% completo</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer con estadísticas */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-5 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {proyectoSeleccionado ? 'Proyecto Seleccionado' : 'Total Proyectos'}
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
                            {proyectoSeleccionado ? '1' : datosGenerales.length}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {proyectoSeleccionado ? 'Total Productos' : 'Promedio Completitud'}
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                            {proyectoSeleccionado
                                ? proyectoSeleccionado.resumen.totalProductos
                                : `${Math.round(datosGenerales.reduce((sum, d) => sum + d.porcentaje, 0) / datosGenerales.length)}%`}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {proyectoSeleccionado ? 'Completados (CIF)' : 'Proyectos Críticos'}
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                            {proyectoSeleccionado
                                ? `${proyectoSeleccionado.resumen.enCIF} (${Math.round(
                                    (proyectoSeleccionado.resumen.enCIF / proyectoSeleccionado.resumen.totalProductos) * 100
                                )}%)`
                                : datosGenerales.filter((d) => d.criticidad >= 8).length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}