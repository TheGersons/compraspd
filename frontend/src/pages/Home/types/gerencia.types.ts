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
}

// Resumen de procesos para tabla
export interface ResumenProcesos {
  totalProductos: number;
  cotizados: number;
  conDescuento: number;
  comprados: number;
  pagados: number;
  primerSeguimiento: number;
  enFOB: number;
  conBL: number;
  segundoSeguimiento: number;
  enCIF: number;
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
  
  // Estados por etapa (boolean con 3 estados: completado, en proceso, atrasado)
  cotizado: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  conDescuento: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  comprado: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  pagado: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  primerSeguimiento: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  enFOB: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  conBL: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  segundoSeguimiento: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  enCIF: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  recibido: 'completado' | 'en_proceso' | 'atrasado' | 'pendiente';
  
  // Días de atraso por etapa
  diasAtrasoCotizado?: number;
  diasAtrasoDescuento?: number;
  diasAtrasoComprado?: number;
  diasAtrasoPagado?: number;
  diasAtrasoPrimerSeguimiento?: number;
  diasAtrasoFOB?: number;
  diasAtrasoBL?: number;
  diasAtrasoSegundoSeguimiento?: number;
  diasAtrasoCIF?: number;
  diasAtrasoRecibido?: number;
}

// Para el modal
export type EtapaDetalle = 
  | 'cotizado'
  | 'conDescuento'
  | 'comprado'
  | 'pagado'
  | 'primerSeguimiento'
  | 'enFOB'
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