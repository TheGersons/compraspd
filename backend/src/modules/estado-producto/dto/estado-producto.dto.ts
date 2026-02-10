import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Estados del proceso de compra (10 etapas)
 */
export enum EstadoProceso {
  COTIZADO = 'cotizado',
  CON_DESCUENTO = 'conDescuento',
  COMPRADO = 'comprado',
  PAGADO = 'pagado',
  PRIMER_SEGUIMIENTO = 'primerSeguimiento',
  EN_FOB = 'enFOB',
  CON_BL = 'conBL',
  SEGUNDO_SEGUIMIENTO = 'segundoSeguimiento',
  EN_CIF = 'enCIF',
  RECIBIDO = 'recibido'
}

/**
 * Estados para compras NACIONALES (5 etapas)
 */
export const ESTADOS_NACIONAL: EstadoProceso[] = [
  EstadoProceso.COTIZADO,
  EstadoProceso.CON_DESCUENTO,
  EstadoProceso.COMPRADO,
  EstadoProceso.PAGADO,
  EstadoProceso.RECIBIDO
];

/**
 * Estados para compras INTERNACIONALES (10 etapas)
 */
export const ESTADOS_INTERNACIONAL: EstadoProceso[] = [
  EstadoProceso.COTIZADO,
  EstadoProceso.CON_DESCUENTO,
  EstadoProceso.COMPRADO,
  EstadoProceso.PAGADO,
  EstadoProceso.PRIMER_SEGUIMIENTO,
  EstadoProceso.EN_FOB,
  EstadoProceso.CON_BL,
  EstadoProceso.SEGUNDO_SEGUIMIENTO,
  EstadoProceso.EN_CIF,
  EstadoProceso.RECIBIDO
];

/**
 * Etiquetas legibles para cada estado
 */
export const ESTADO_LABELS: Record<EstadoProceso, string> = {
  [EstadoProceso.COTIZADO]: 'Cotizado',
  [EstadoProceso.CON_DESCUENTO]: 'Con Descuento',
  [EstadoProceso.COMPRADO]: 'Comprado',
  [EstadoProceso.PAGADO]: 'Pagado',
  [EstadoProceso.PRIMER_SEGUIMIENTO]: '1er Seguimiento',
  [EstadoProceso.EN_FOB]: 'En FOB',
  [EstadoProceso.CON_BL]: 'Con BL',
  [EstadoProceso.SEGUNDO_SEGUIMIENTO]: '2do Seguimiento',
  [EstadoProceso.EN_CIF]: 'En CIF',
  [EstadoProceso.RECIBIDO]: 'Recibido'
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
  @ApiPropertyOptional({ description: 'Observación del cambio de estado' })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ description: 'URL o referencia del archivo de evidencia' })
  @IsOptional()
  @IsString()
  evidenciaUrl?: string;

  @ApiPropertyOptional({ description: 'Marcar como "No aplica evidencia"' })
  @IsOptional()
  @IsBoolean()
  noAplicaEvidencia?: boolean;
}

export class CambiarEstadoDto {
  @ApiProperty({ enum: EstadoProceso })
  @IsEnum(EstadoProceso)
  estado!: EstadoProceso;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ description: 'URL o referencia del archivo de evidencia' })
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
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
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
  @ApiProperty({ enum: EstadoProceso, description: 'Estado al que pertenece la evidencia' })
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