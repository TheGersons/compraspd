// ============================================
// DTOs para módulo de COMPRA-DETALLES
// ============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsISO8601, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * Estados válidos para los detalles de compra
 */
export enum EstadoCompraDetalle {
  PRE_COMPRA = 'PRE-COMPRA',
  FABRICACION = 'FABRICACION',
  FORS = 'FORS',
  CIF = 'CIF',
  COMPLETADO = 'COMPLETADO'
}

/**
 * DTO para actualizar el estado de un detalle de compra
 */
export class UpdateEstadoDetalleDto {
  @ApiProperty({
    description: 'Nuevo estado del detalle',
    enum: EstadoCompraDetalle,
    example: 'FABRICACION'
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(EstadoCompraDetalle, {
    message: 'Estado inválido. Valores permitidos: PRE-COMPRA, FABRICACION, FORS, CIF, COMPLETADO'
  })
  estado: EstadoCompraDetalle;

  @ApiPropertyOptional({
    description: 'Comentario adicional sobre el cambio de estado',
    example: 'Producto en proceso de fabricación, tiempo estimado: 2 semanas',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  comentario?: string;
}

/**
 * DTO para actualizar fechas manualmente
 */
export class UpdateFechasDetalleDto {
  @ApiPropertyOptional({
    description: 'Fecha de compra (formato ISO 8601)',
    example: '2025-11-19T10:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha de compra debe estar en formato ISO 8601' })
  fechaCompra?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de fabricación (formato ISO 8601)',
    example: '2025-11-20T10:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha de fabricación debe estar en formato ISO 8601' })
  fechaFabricacion?: string;

  @ApiPropertyOptional({
    description: 'Fecha FORS (formato ISO 8601)',
    example: '2025-11-25T10:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha FORS debe estar en formato ISO 8601' })
  fechaFors?: string;

  @ApiPropertyOptional({
    description: 'Fecha CIF (formato ISO 8601)',
    example: '2025-11-28T10:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha CIF debe estar en formato ISO 8601' })
  fechaCif?: string;

  @ApiPropertyOptional({
    description: 'Fecha de recepción/completado (formato ISO 8601)',
    example: '2025-12-01T10:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha de recibido debe estar en formato ISO 8601' })
  fechaRecibido?: string;
}

/**
 * DTO para respuesta de timeline de un detalle
 */
export class TimelineItemDto {
  @ApiProperty({ example: 'PRE-COMPRA', enum: EstadoCompraDetalle })
  estado: string;

  @ApiPropertyOptional({ example: '2025-11-19T10:00:00.000Z' })
  fecha?: Date | null;

  @ApiProperty({ example: true, description: 'Indica si este estado ya fue completado' })
  completado: boolean;
}

export class TimelineResponseDto {
  @ApiProperty({ example: 'FABRICACION', enum: EstadoCompraDetalle })
  estadoActual: string;

  @ApiProperty({ type: [TimelineItemDto], description: 'Timeline completo del detalle' })
  timeline: TimelineItemDto[];
}

/**
 * DTO para respuesta de detalle de compra
 */
export class CompraDetalleResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  compraId: string;

  @ApiPropertyOptional({ example: 'SKU-12345' })
  sku?: string;

  @ApiProperty({ example: 'Cable HDMI 2.0 - 3 metros' })
  descripcionProducto: string;

  @ApiProperty({ example: 50 })
  cantidad: number;

  @ApiProperty({ example: 'UNIDADES' })
  tipoUnidad: string;

  @ApiPropertyOptional({ example: 'Requiere certificación' })
  notas?: string;

  @ApiProperty({ example: '1250.50' })
  precio: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  proveedorId: string;

  @ApiProperty({ example: 'FABRICACION', enum: EstadoCompraDetalle })
  estado: string;

  @ApiPropertyOptional({ example: '2025-11-19T10:00:00.000Z' })
  fechaCompra?: Date;

  @ApiPropertyOptional({ example: '2025-11-20T10:00:00.000Z' })
  fechaFabricacion?: Date;

  @ApiPropertyOptional({ example: '2025-11-25T10:00:00.000Z' })
  fechaFors?: Date;

  @ApiPropertyOptional({ example: '2025-11-28T10:00:00.000Z' })
  fechaCif?: Date;

  @ApiPropertyOptional({ example: '2025-12-01T10:00:00.000Z' })
  fechaRecibido?: Date;

  @ApiProperty({ example: '2025-11-19T15:30:00.000Z' })
  fechaUltimaActualizacion: Date;
}