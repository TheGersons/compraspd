// ============================================
// DTOs para módulo de ESTADO-PRODUCTO
// Sistema de tracking de las 10 etapas
// ============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  IsUUID,
  Min, 
  Max,
  IsISO8601,
  IsNotEmpty 
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedioTransporte } from '@prisma/client';

/**
 * Enum para los 10 estados del proceso
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
 * DTO para crear EstadoProducto al aprobar cotización
 * Se crea automáticamente desde el service de quotations
 */
export class CreateEstadoProductoDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @ApiProperty({ description: 'ID de la cotización' })
  @IsUUID()
  cotizacionId: string;

  @ApiProperty({ description: 'ID del detalle de cotización' })
  @IsUUID()
  cotizacionDetalleId: string;

  @ApiProperty({ description: 'SKU del producto' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ description: 'ID del país de origen' })
  @IsOptional()
  @IsUUID()
  paisOrigenId?: string;

  @ApiPropertyOptional({ 
    description: 'Medio de transporte',
    enum: MedioTransporte
  })
  @IsOptional()
  @IsEnum(MedioTransporte)
  medioTransporte?: MedioTransporte;

  @ApiPropertyOptional({ description: 'Nombre del proveedor' })
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional({ description: 'Responsable del producto' })
  @IsOptional()
  @IsString()
  responsable?: string;

  @ApiPropertyOptional({ description: 'Precio unitario' })
  @IsOptional()
  precioUnitario?: number;

  @ApiPropertyOptional({ description: 'Precio total' })
  @IsOptional()
  precioTotal?: number;

  @ApiPropertyOptional({ description: 'Cantidad' })
  @IsOptional()
  @IsInt()
  cantidad?: number;
}

/**
 * DTO para avanzar al siguiente estado
 */
export class AvanzarEstadoDto {
  @ApiPropertyOptional({ description: 'Observación del cambio de estado' })
  @IsOptional()
  @IsString()
  observacion?: string;
}

/**
 * DTO para cambiar a un estado específico
 */
export class CambiarEstadoDto {
  @ApiProperty({ 
    description: 'Estado al que se quiere cambiar',
    enum: EstadoProceso
  })
  @IsNotEmpty()
  @IsEnum(EstadoProceso)
  estado: EstadoProceso;

  @ApiPropertyOptional({ description: 'Observación del cambio' })
  @IsOptional()
  @IsString()
  observacion?: string;
}

/**
 * DTO para actualizar fechas manualmente
 */
export class ActualizarFechasDto {
  @ApiPropertyOptional({ description: 'Fecha cotizado' })
  @IsOptional()
  @IsISO8601()
  fechaCotizado?: string;

  @ApiPropertyOptional({ description: 'Fecha con descuento' })
  @IsOptional()
  @IsISO8601()
  fechaConDescuento?: string;

  @ApiPropertyOptional({ description: 'Fecha comprado' })
  @IsOptional()
  @IsISO8601()
  fechaComprado?: string;

  @ApiPropertyOptional({ description: 'Fecha pagado' })
  @IsOptional()
  @IsISO8601()
  fechaPagado?: string;

  @ApiPropertyOptional({ description: 'Fecha primer seguimiento' })
  @IsOptional()
  @IsISO8601()
  fechaPrimerSeguimiento?: string;

  @ApiPropertyOptional({ description: 'Fecha en FOB' })
  @IsOptional()
  @IsISO8601()
  fechaEnFOB?: string;

  @ApiPropertyOptional({ description: 'Fecha con BL' })
  @IsOptional()
  @IsISO8601()
  fechaConBL?: string;

  @ApiPropertyOptional({ description: 'Fecha segundo seguimiento' })
  @IsOptional()
  @IsISO8601()
  fechaSegundoSeguimiento?: string;

  @ApiPropertyOptional({ description: 'Fecha en CIF' })
  @IsOptional()
  @IsISO8601()
  fechaEnCIF?: string;

  @ApiPropertyOptional({ description: 'Fecha recibido' })
  @IsOptional()
  @IsISO8601()
  fechaRecibido?: string;
}

/**
 * DTO para actualizar fechas límite manualmente
 */
export class ActualizarFechasLimiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteCotizado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteConDescuento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteComprado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimitePagado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimitePrimerSeguimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteEnFOB?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteConBL?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteSegundoSeguimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteEnCIF?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  fechaLimiteRecibido?: string;
}

/**
 * DTO para filtros de listado
 */
export class ListEstadoProductoQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por proyecto' })
  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por cotización' })
  @IsOptional()
  @IsUUID()
  cotizacionId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por nivel de criticidad',
    enum: ['BAJO', 'MEDIO', 'ALTO']
  })
  @IsOptional()
  @IsEnum(['BAJO', 'MEDIO', 'ALTO'])
  nivelCriticidad?: string;

  @ApiPropertyOptional({ description: 'Página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Tamaño de página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

/**
 * DTO para aprobar producto por supervisor
 */
export class AprobarProductoDto {
  @ApiProperty({ description: 'Aprobar o rechazar' })
  @IsBoolean()
  aprobado: boolean;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO de respuesta con timeline item
 */
export class TimelineItemResponseDto {
  @ApiProperty()
  estado: string;

  @ApiProperty()
  completado: boolean;

  @ApiPropertyOptional()
  fecha?: Date;

  @ApiPropertyOptional()
  fechaLimite?: Date;

  @ApiProperty()
  diasRetraso: number;

  @ApiProperty()
  enTiempo: boolean;
}

/**
 * DTO de respuesta de timeline completo
 */
export class TimelineCompletoResponseDto {
  @ApiProperty()
  estadoActual: string;

  @ApiProperty()
  progreso: number; // 0-100

  @ApiProperty({ type: [TimelineItemResponseDto] })
  timeline: TimelineItemResponseDto[];

  @ApiProperty()
  criticidad: number;

  @ApiProperty()
  nivelCriticidad: string;

  @ApiProperty()
  diasRetrasoTotal: number;
}