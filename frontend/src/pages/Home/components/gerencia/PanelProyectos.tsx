// components/gerencia/PanelProyectos.tsx
import { Proyecto } from '../../types/gerencia.types';
import { ProductoDetallado } from '../../types/gerencia.types';

const ESTADOS_KEYS = [
  'cotizado', 'conDescuento', 'aprobacionCompra', 'comprado', 'pagado',
  'aprobacionPlanos', 'primerSeguimiento', 'enFOB', 'cotizacionFleteInternacional',
  'conBL', 'segundoSeguimiento', 'enCIF', 'recibido',
];

interface PanelProyectosProps {
  proyectos: Proyecto[];
  proyectoSeleccionado: Proyecto | null;
  onSelectProyecto: (proyecto: Proyecto) => void;
  tipoArea: string;
  productosDetallados?: ProductoDetallado[];
}

export default function PanelProyectos({
  proyectos,
  proyectoSeleccionado,
  onSelectProyecto,
  tipoArea,
  productosDetallados = []
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

  /**
   * Contar productos atrasados y en proceso para un proyecto específico
   */
  const contarProductosCriticos = (proyecto: Proyecto): { total: number; atrasados: number; enProceso: number } => {
    let atrasados = 0;
    let enProceso = 0;

    const productosProyecto = productosDetallados.filter((p: any) => p.proyectoId === proyecto.id);

    productosProyecto.forEach(producto => {
      const tieneAtraso = ESTADOS_KEYS.some(e => producto.estados[e] === 'atrasado');
      const tieneEnProceso = !tieneAtraso && ESTADOS_KEYS.some(e => producto.estados[e] === 'en_proceso');

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
    <div className="w-56 flex-shrink-0">
      <div className="sticky top-4">
        <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Proyectos
        </p>
        <div className="max-h-[calc(100vh-160px)] space-y-1.5 overflow-y-auto pr-1">
          {proyectosOrdenados.map((proyecto) => {
            const theme = colors[proyecto.estado];
            const isSelected = proyectoSeleccionado?.id === proyecto.id;
            const { atrasados, enProceso } = contarProductosCriticos(proyecto);
            const badgeColor = getBadgeColor(atrasados, enProceso);

            return (
              <button
                key={proyecto.id}
                onClick={() => onSelectProyecto(proyecto)}
                className={`group relative w-full rounded-lg border p-2.5 text-left transition-all duration-200 ${
                  isSelected
                    ? `${theme.bg} ${theme.border} border-2 shadow-sm`
                    : 'border-gray-200 bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="absolute right-2 top-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${badgeColor}`}
                    title={`${atrasados} atrasados, ${enProceso} en proceso`}
                  >
                    {atrasados}
                  </span>
                </div>

                <div className="mb-1 flex items-center gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                  <span className={`text-[10px] font-medium ${theme.text}`}>
                    {getEstadoTexto(proyecto.estado)}
                  </span>
                </div>

                <h4 className="pr-6 text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {proyecto.nombre}
                </h4>

                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{proyecto.resumen.totalProductos} prods.</span>
                  <span className={`font-semibold ${theme.text}`}>
                    {proyecto.resumen.totalProductos > 0
                      ? Math.round((proyecto.resumen.recibido / proyecto.resumen.totalProductos) * 100)
                      : 0}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}