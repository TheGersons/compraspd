// types/gerencia.types.ts

export type EstadoGeneral = 'success' | 'warn' | 'danger';

export type AreaType = 'proyectos' | 'comercial' | 'tecnica' | 'operativa';

// Nivel 1: Áreas principales con tabla de resumen
export interface Area {
  id: string;
  nombre: string;
  tipo: AreaType;
  icono: string;
  resumen: ResumenProcesos;
  totalProyectos?: number;
}

// Resumen de procesos para tabla - 13 estados del proceso
export interface ResumenProcesos {
  totalProductos: number;
  cotizado: number;
  conDescuento: number;
  aprobacionCompra: number;
  comprado: number;
  pagado: number;
  aprobacionPlanos: number;
  primerSeguimiento: number;
  enFOB: number;
  cotizacionFleteInternacional: number;
  conBL: number;
  segundoSeguimiento: number;
  enCIF: number;
  recibido: number;
}

// Proyecto con estado y resumen
export interface Proyecto {
  id: string;
  nombre: string;
  estado: EstadoGeneral;
  criticidad: number; // 1-10 (10 más crítico)
  resumen: ResumenProcesos;
  responsable: string;
  fechaInicio: string;
  fechaLimite: string;
}

// Detalle de producto para tabla final
export interface DetalleProducto {
  id: string;
  sku: string;
  descripcion: string;
  cantidad: number;
  cotizacionId: string;
  cotizacionNombre: string;
  proveedor: string;
  responsable: string;
  proceso: string; // cotizados, comprados, pagados, etc.
  estado: EstadoGeneral;
  fechaSolicitud: string;
  fechaEstimada: string;
  diasRetraso?: number;
  observaciones?: string;
  precioUnitario?: number;
  precioTotal?: number;
}

// Contexto de navegación
export interface NavegacionContext {
  nivel: 1 | 2 | 3;
  area?: Area;
  proyecto?: Proyecto;
}

// types/gerencia.types.ts - AGREGAR ESTOS TYPES AL ARCHIVO EXISTENTE

// Producto detallado para modal
export interface ProductoDetallado {
  id: string;
  sku: string;
  descripcion: string;
  cotizacionNombre: string;
  tipoCompra: 'NACIONAL' | 'INTERNACIONAL';
  responsable?: string;
  ordenCompra?: string | null;
  // True cuando el producto aún no tiene EstadoProducto asociado
  // (no se ha cargado el followup ni se calcularon fechas límite).
  sinFechasDefinidas?: boolean;

  // Estados por etapa
  estados: Record<string, 'completado' | 'en_proceso' | 'atrasado' | 'pendiente'>;

  // Días de atraso por etapa (key: diasAtraso_<etapa>)
  diasAtraso: Record<string, number | undefined>;

  // Fechas límite estimadas por etapa (ISO string o null)
  fechasLimite?: Record<string, string | null>;

  // Fechas reales de completado por etapa (ISO string o null)
  fechasReales?: Record<string, string | null>;
}

// Para el modal
export type EtapaDetalle =
  | 'cotizado'
  | 'conDescuento'
  | 'aprobacionCompra'
  | 'comprado'
  | 'pagado'
  | 'aprobacionPlanos'
  | 'primerSeguimiento'
  | 'enFOB'
  | 'cotizacionFleteInternacional'
  | 'conBL'
  | 'segundoSeguimiento'
  | 'enCIF'
  | 'recibido'
  | 'total';

export interface ModalDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  etapa: EtapaDetalle;
  productos: ProductoDetallado[];
  nombreProyecto: string;
}