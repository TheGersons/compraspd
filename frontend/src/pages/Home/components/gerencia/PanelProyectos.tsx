// components/gerencia/PanelProyectos.tsx
import { Proyecto } from '../../types/gerencia.types';
import { ProductoDetallado } from '../../types/gerencia.types';
import { getProductosDetalladosPorArea } from '../../mocks/mocks_productos_detallados';

interface PanelProyectosProps {
  proyectos: Proyecto[];
  proyectoSeleccionado: Proyecto | null;
  onSelectProyecto: (proyecto: Proyecto) => void;
  tipoArea: string;
}

export default function PanelProyectos({
  proyectos,
  proyectoSeleccionado,
  onSelectProyecto,
  tipoArea
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

  // Obtener TODOS los productos detallados del área
  const productosDetallados = getProductosDetalladosPorArea(tipoArea);

  /**
   * Función para generar el identificador de cotización desde el nombre del proyecto
   * 
   * Ejemplos de mapeo:
   * "Ampliación Planta Norte" → "PROY" (primera palabra relevante)
   * "Modernización Sistema SCADA" → "SCADA" (palabra clave)
   * "Renovación Equipos Protección" → "PROT" (abreviación)
   * 
   * Los productos tienen cotizacionNombre como: "COT-PROY-001", "COT-SCADA-001", etc.
   */
  const getCotizacionPrefixFromProyecto = (nombreProyecto: string): string => {
    const nombre = nombreProyecto.toLowerCase();
    
    // Mapeo específico de nombres de proyecto a prefijos de cotización
    if (nombre.includes('ampliación') || nombre.includes('planta')) return 'proy';
    if (nombre.includes('scada') || nombre.includes('modernización')) return 'scada';
    if (nombre.includes('renovación') || nombre.includes('protección')) return 'prot';
    if (nombre.includes('transmisión') || nombre.includes('230kv')) return 'trans';
    if (nombre.includes('subestación') || nombre.includes('instalación')) return 'sub';
    if (nombre.includes('automatización') || nombre.includes('líneas')) return 'auto';
    
    // Área Comercial
    if (nombre.includes('equipamiento') || nombre.includes('oficinas')) return 'ofic';
    if (nombre.includes('mobiliario') || nombre.includes('sucursal')) return 'mob';
    if (nombre.includes('flota') || nombre.includes('vehículos')) return 'flota';
    if (nombre.includes('punto') || nombre.includes('venta')) return 'pos';
    
    // Área Técnica
    if (nombre.includes('laboratorio') || nombre.includes('calibración')) return 'lab';
    if (nombre.includes('instrumental') || nombre.includes('medición')) return 'inst';
    if (nombre.includes('herramientas especializadas')) return 'herr';
    
    // Área Operativa
    if (nombre.includes('taller')) return 'tall';
    if (nombre.includes('maquinaria') || nombre.includes('pesada')) return 'maq';
    if (nombre.includes('herramientas manuales')) return 'man';
    if (nombre.includes('seguridad') || nombre.includes('industrial')) return 'seg';
    if (nombre.includes('vehículos utilitarios')) return 'util';
    
    // Fallback: usar primeras letras
    return nombreProyecto.substring(0, 4).toLowerCase();
  };

  /**
   * Función para contar productos críticos (naranja/rojo) por proyecto
   */
  const contarProductosCriticos = (proyecto: Proyecto): { total: number; atrasados: number; enProceso: number } => {
    // Obtener el prefijo de cotización para este proyecto
    const cotizacionPrefix = getCotizacionPrefixFromProyecto(proyecto.nombre);
    
    // Filtrar productos que pertenecen a este proyecto
    // usando el cotizacionNombre que contiene el prefijo
    const productosProyecto = productosDetallados.filter(p => 
      p.cotizacionNombre.toLowerCase().includes(`-${cotizacionPrefix}-`)
    );

    // Contar productos con problemas
    let atrasados = 0;
    let enProceso = 0;

    productosProyecto.forEach(producto => {
      const etapas: Array<keyof ProductoDetallado> = [
        'cotizado', 'conDescuento', 'comprado', 'pagado',
        'primerSeguimiento', 'enFOB', 'conBL', 'segundoSeguimiento',
        'enCIF', 'recibido'
      ];

      // Si tiene alguna etapa atrasada
      const tieneAtraso = etapas.some(e => producto[e] === 'atrasado');
      // Si tiene alguna etapa en proceso (sin contar los atrasados)
      const tieneEnProceso = !tieneAtraso && etapas.some(e => producto[e] === 'en_proceso');

      if (tieneAtraso) {
        atrasados++;
      } else if (tieneEnProceso) {
        enProceso++;
      }
    });

    return {
      total: atrasados + enProceso,
      atrasados,
      enProceso
    };
  };

  /**
   * Función para obtener color del badge según criticidad
   */
  const getBadgeColor = (atrasados: number, enProceso: number): string => {
    if (atrasados > 0) {
      // Si hay productos atrasados → ROJO
      return 'bg-rose-500 text-white';
    } else if (enProceso > 0) {
      // Si hay productos en proceso → NARANJA
      return 'bg-amber-500 text-white';
    } else {
      // Si todos están bien → VERDE
      return 'bg-emerald-500 text-white';
    }
  };

  /**
   * Función para obtener el texto del estado (tu función personalizada)
   */
  const getEstadoTexto = (estado: string): string => {
    switch (estado) {
      case 'success':
        return 'Normal';
      case 'warn':
        return 'Atención';
      case 'danger':
        return 'Crítico';
      default:
        return 'Normal';
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
            
            // Contar productos críticos
            const { total, atrasados, enProceso } = contarProductosCriticos(proyecto);
            const badgeColor = getBadgeColor(atrasados, enProceso);

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
                {/* Badge con cantidad de productos críticos */}
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}
                    title={`${total} productos con problemas (${atrasados} atrasados, ${enProceso} en proceso)`}
                  >
                    {total}
                  </span>
                </div>

                {/* Status dot */}
                <div className="mb-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${theme.dot} mr-2`} />
                  <span className={`text-xs font-medium ${theme.text}`}>
                    {getEstadoTexto(proyecto.estado)}
                  </span>
                </div>

                {/* Nombre proyecto */}
                <h4 className="mb-1 pr-8 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {proyecto.nombre}
                </h4>

                {/* Responsable */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {proyecto.responsable}
                </p>

                {/* Stats mini */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-500">Productos:</span>
                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                      {proyecto.resumen.totalProductos}
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