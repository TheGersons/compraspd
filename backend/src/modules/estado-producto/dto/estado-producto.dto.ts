import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Estados del proceso de compra (10 etapas)
 */
export enum EstadoProceso {
  COTIZADO = 'cotizado',
  CON_DESCUENTO = 'conDescuento',
  APROBACION_COMPRA = 'aprobacionCompra', // ← NUEVO
  COMPRADO = 'comprado',
  PAGADO = 'pagado',
  APROBACION_PLANOS = 'aprobacionPlanos', // ← NUEVO
  PRIMER_SEGUIMIENTO = 'primerSeguimiento',
  EN_FOB = 'enFOB',
  COTIZACION_FLETE_INTERNACIONAL = 'cotizacionFleteInternacional',
  CON_BL = 'conBL',
  SEGUNDO_SEGUIMIENTO = 'segundoSeguimiento',
  EN_CIF = 'enCIF',
  RECIBIDO = 'recibido',
}

/**
 * Estados para compras NACIONALES (5 etapas)
 */
export const ESTADOS_NACIONAL: EstadoProceso[] = [
  EstadoProceso.COTIZADO,
  EstadoProceso.CON_DESCUENTO,
  EstadoProceso.APROBACION_COMPRA,
  EstadoProceso.COMPRADO,
  EstadoProceso.PAGADO,
  EstadoProceso.RECIBIDO,
];

/**
 * Estados para compras INTERNACIONALES (11 etapas)
 */
export const ESTADOS_INTERNACIONAL: EstadoProceso[] = [
  EstadoProceso.COTIZADO,
  EstadoProceso.CON_DESCUENTO,
  EstadoProceso.APROBACION_COMPRA, // ← NUEVO
  EstadoProceso.COMPRADO,
  EstadoProceso.PAGADO,
  EstadoProceso.APROBACION_PLANOS, // ← NUEVO
  EstadoProceso.PRIMER_SEGUIMIENTO,
  EstadoProceso.EN_FOB,
  EstadoProceso.COTIZACION_FLETE_INTERNACIONAL,
  EstadoProceso.CON_BL,
  EstadoProceso.SEGUNDO_SEGUIMIENTO,
  EstadoProceso.EN_CIF,
  EstadoProceso.RECIBIDO,
];

/**
 * Etiquetas legibles para cada estado
 */
export const ESTADO_LABELS: Record<EstadoProceso, string> = {
  [EstadoProceso.COTIZADO]: 'Cotizado',
  [EstadoProceso.CON_DESCUENTO]: 'Con Descuento',
  [EstadoProceso.APROBACION_COMPRA]: 'Aprobación de Compra', // ← NUEVO
  [EstadoProceso.COMPRADO]: 'Comprado',
  [EstadoProceso.PAGADO]: 'Pagado',
  [EstadoProceso.APROBACION_PLANOS]: 'Aprobación de Planos', // ← NUEVO
  [EstadoProceso.PRIMER_SEGUIMIENTO]: '1er Seguimiento / Estado de producto',
  [EstadoProceso.EN_FOB]: 'Incoterms',
  [EstadoProceso.COTIZACION_FLETE_INTERNACIONAL]: 'Cotización Flete Int.',
  [EstadoProceso.CON_BL]: 'Documentos de importación',
  [EstadoProceso.SEGUNDO_SEGUIMIENTO]: '2do Seg. / En Tránsito',
  [EstadoProceso.EN_CIF]: 'Proceso de aduana',
  [EstadoProceso.RECIBIDO]: 'Recibido',
};

// ============================================================================
// DTOs EXISTENTES (mantener compatibilidad)
// ============================================================================

export class CreateEstadoProductoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @ApiProperty()
  @IsUUID()
  cotizacionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cotizacionDetalleId?: string;

  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiProperty()
  @IsString()
  descripcion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paisOrigenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medioTransporte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsable?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  precioUnitario?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  precioTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cantidad?: number;
}

export class AvanzarEstadoDto {
  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsString()
  evidenciaUrl?: string;

  @IsOptional()
  noAplicaEvidencia?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['FOB', 'CIF'])
  tipoEntrega?: 'FOB' | 'CIF'; // ← NUEVO
}

export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoProceso })
  @IsEnum(EstadoProceso)
  estado!: EstadoProceso;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({
    description: 'URL o referencia del archivo de evidencia',
  })
  @IsOptional()
  @IsString()
  evidenciaUrl?: string;

  @ApiPropertyOptional({ description: 'Marcar como "No aplica evidencia"' })
  @IsOptional()
  @IsBoolean()
  noAplicaEvidencia?: boolean;
}

export class ActualizarFechasDto {
  @ApiPropertyOptional()
  @IsOptional()
  fechaCotizado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaConDescuento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaComprado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaPagado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaPrimerSeguimiento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaEnFOB?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaConBL?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaSegundoSeguimiento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaEnCIF?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaRecibido?: Date;
}

export class ActualizarFechasLimiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteCotizado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteConDescuento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteComprado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimitePagado?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimitePrimerSeguimiento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteEnFOB?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteConBL?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteSegundoSeguimiento?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteEnCIF?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  fechaLimiteRecibido?: Date;
}

export class ListEstadoProductoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cotizacionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nivelCriticidad?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de compra' })
  @IsOptional()
  @IsString()
  tipoCompra?: 'NACIONAL' | 'INTERNACIONAL';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;
}

export class AprobarProductoDto {
  @ApiProperty()
  @IsBoolean()
  aprobado!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

// ============================================================================
// NUEVOS DTOs PARA EVIDENCIAS
// ============================================================================

export class RegistrarEvidenciaDto {
  @ApiProperty({
    enum: EstadoProceso,
    description: 'Estado al que pertenece la evidencia',
  })
  @IsEnum(EstadoProceso)
  estado!: EstadoProceso;

  @ApiPropertyOptional({ description: 'URL del archivo de evidencia' })
  @IsOptional()
  @IsString()
  evidenciaUrl?: string;

  @ApiPropertyOptional({ description: 'Marcar como "No aplica"' })
  @IsOptional()
  @IsBoolean()
  noAplica?: boolean;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observacion?: string;
}

// ============================================================================
// DTOs DE RESPUESTA PARA TIMELINE
// ============================================================================

export class TimelineItemResponseDto {
  @ApiProperty()
  estado!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  completado!: boolean;

  @ApiPropertyOptional()
  fecha?: Date | string | null;

  @ApiPropertyOptional()
  fechaLimite?: Date | string | null;

  @ApiProperty()
  diasRetraso!: number;

  @ApiProperty()
  enTiempo!: boolean;

  @ApiPropertyOptional()
  evidencia?: string;

  @ApiProperty()
  tieneEvidencia!: boolean;

  @ApiProperty()
  esNoAplica!: boolean;
}

export class TimelineCompletoResponseDto {
  @ApiProperty()
  estadoActual!: string;

  @ApiProperty()
  progreso!: number;

  @ApiProperty({ type: [TimelineItemResponseDto] })
  timeline!: TimelineItemResponseDto[];

  @ApiProperty()
  criticidad!: number;

  @ApiProperty()
  nivelCriticidad!: string;

  @ApiProperty()
  diasRetrasoTotal!: number;

  @ApiPropertyOptional()
  tipoCompra?: string;

  @ApiPropertyOptional()
  siguienteEstado?: string | null;
}
