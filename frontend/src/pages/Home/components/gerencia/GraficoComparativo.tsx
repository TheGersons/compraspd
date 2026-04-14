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

const ESTADOS_KEYS = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB', 'cotizacionFleteInternacional',
  'conBL', 'segundoSeguimiento', 'enCIF', 'recibido',
];

const ESTADO_LABELS_CHART: Record<string, string> = {
  cotizado: 'Cotizado', conDescuento: 'Con Descuento', aprobacionCompra: 'Aprob. Compra',
  comprado: 'Comprado', pagado: 'Pagado', aprobacionPlanos: 'Aprob. Planos',
  primerSeguimiento: '1er Seg.', enFOB: 'Incoterms', cotizacionFleteInternacional: 'Cot. Flete',
  conBL: 'Doc. Import.', segundoSeguimiento: '2do Seg.', enCIF: 'Aduana', recibido: 'Recibido',
};

const ESTADO_ABREV: Record<string, string> = {
  cotizado: 'COT', conDescuento: 'DESC', aprobacionCompra: 'AC', comprado: 'COMP',
  pagado: 'PAG', aprobacionPlanos: 'AP', primerSeguimiento: '1ER', enFOB: 'FOB',
  cotizacionFleteInternacional: 'CFI', conBL: 'BL', segundoSeguimiento: '2DO', enCIF: 'CIF', recibido: 'REC',
};

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
            const { recibido, totalProductos } = proyecto.resumen;
            const porcentaje = totalProductos > 0 ? Math.round((recibido / totalProductos) * 100) : 0;

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
        ? ESTADOS_KEYS.map(key => {
            const valor = (proyectoSeleccionado.resumen as any)[key] || 0;
            const total = proyectoSeleccionado.resumen.totalProductos;
            return {
                proceso: ESTADO_LABELS_CHART[key] || key,
                valor,
                total,
                porcentaje: total > 0 ? Math.round((valor / total) * 100) : 0,
            };
        })
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
                                {data.proyecto.resumen.recibido} de {data.proyecto.resumen.totalProductos} completados
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
    // Drill-down: Abreviaciones dinámicas para los 13 procesos
    return ESTADOS_KEYS.map((key, index) => ({
      abrev: ESTADO_ABREV[key] || key,
      nombre: ESTADO_LABELS_CHART[key] || key,
      color: getColorByPorcentaje(datosDrillDown[index]?.porcentaje || 0),
    }));
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
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Header con controles */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {proyectoSeleccionado
                            ? `Detalle: ${proyectoSeleccionado.nombre}`
                            : 'Comparativa de Progreso por Proyecto'}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        {proyectoSeleccionado
                            ? `${proyectoSeleccionado.resumen.totalProductos} productos`
                            : `${datosGenerales.length} proyecto${datosGenerales.length !== 1 ? 's' : ''} · % completitud`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {!proyectoSeleccionado && (
                        <select
                            value={areaSeleccionada}
                            onChange={(e) => setAreaSeleccionada(e.target.value as AreaType | 'todas')}
                            className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="proyectos">🏗️ Proyectos</option>
                            <option value="comercial">💼 Comercial</option>
                            <option value="tecnica">🔌 Técnica</option>
                            <option value="operativa">🖥️ Operativa</option>
                            <option value="todas">📊 Todas</option>
                        </select>
                    )}

                    <div className="flex rounded border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        {(['bar', 'area', 'line'] as TipoGrafico[]).map((t, i) => (
                            <button
                                key={t}
                                onClick={() => setTipoGrafico(t)}
                                className={`px-2 py-1 text-xs transition-all ${i === 0 ? 'rounded-l' : i === 2 ? 'rounded-r' : 'border-x border-gray-200 dark:border-gray-600'} ${tipoGrafico === t ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                                title={t === 'bar' ? 'Barras' : t === 'area' ? 'Área' : 'Línea'}
                            >
                                {t === 'bar' ? '📊' : t === 'area' ? '📈' : '📉'}
                            </button>
                        ))}
                    </div>

                    {proyectoSeleccionado && (
                        <button
                            onClick={handleVolver}
                            className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Ver todos
                        </button>
                    )}
                </div>
            </div>

            {!proyectoSeleccionado && (
                <div className="mb-3 flex flex-wrap gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span>Baja criticidad (1-4)</span></div>
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /><span>Media (5-7)</span></div>
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-rose-500" /><span>Alta (8-10)</span></div>
                </div>
            )}

            {/* Gráfico + Leyenda */}
            <div className="flex gap-3">
                <div className="h-[320px] flex-1 rounded bg-white dark:bg-gray-800/50">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderGrafico()}
                    </ResponsiveContainer>
                </div>

                <div className="w-48 space-y-1 overflow-y-auto rounded bg-gray-50 p-2 dark:bg-gray-700/30">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {proyectoSeleccionado ? 'Procesos' : 'Proyectos'}
                    </p>
                    {getLeyendaItems().map((item, index) => (
                        <div key={index} className="flex items-center gap-1.5 rounded p-1 hover:bg-white dark:hover:bg-gray-700/50">
                            <div className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 w-6 flex-shrink-0">{item.abrev}</span>
                            <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{item.nombre}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer estadísticas */}
            <div className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-3 dark:bg-gray-700/30">
                <div className="text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        {proyectoSeleccionado ? 'Seleccionado' : 'Total proyectos'}
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white">
                        {proyectoSeleccionado ? '1' : datosGenerales.length}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        {proyectoSeleccionado ? 'Productos' : 'Promedio'}
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-blue-600 dark:text-blue-400">
                        {proyectoSeleccionado
                            ? proyectoSeleccionado.resumen.totalProductos
                            : `${Math.round(datosGenerales.reduce((sum, d) => sum + d.porcentaje, 0) / (datosGenerales.length || 1))}%`}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        {proyectoSeleccionado ? 'Recibidos' : 'Críticos'}
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-rose-600 dark:text-rose-400">
                        {proyectoSeleccionado
                            ? `${proyectoSeleccionado.resumen.recibido} (${Math.round((proyectoSeleccionado.resumen.recibido / (proyectoSeleccionado.resumen.totalProductos || 1)) * 100)}%)`
                            : datosGenerales.filter((d) => d.criticidad >= 8).length}
                    </p>
                </div>
            </div>
        </div>
    );
}