// ============================================
// DTOs para módulo de COMPRAS
// ============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO para crear compra desde cotización
 * No necesita body, solo el cotizacionId viene del param
 */
export class CreateCompraFromCotizacionDto {
  @ApiProperty({
    description: 'ID de la cotización aprobada',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  cotizacionId: string;
}

/**
 * DTO para filtros de listado de compras
 */
export class ListComprasQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ['PENDIENTE', 'COMPLETADA'],
    example: 'PENDIENTE'
  })
  @IsOptional()
  @IsEnum(['PENDIENTE', 'COMPLETADA'])
  estado?: 'PENDIENTE' | 'COMPLETADA';

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Tamaño de página',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

/**
 * DTO para respuesta de compra
 */
export class CompraResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cotizacionId: string;

  @ApiProperty({ example: 'PENDIENTE', enum: ['PENDIENTE', 'COMPLETADA'] })
  estado: string;

  @ApiProperty({ example: '2025-11-19T10:30:00.000Z' })
  creacion: Date;

  @ApiProperty({ example: '2025-11-19T10:30:00.000Z' })
  actualizado: Date;
}

/**
 * DTO para respuesta de estadísticas de compra
 */
export class CompraStatsDto {
  @ApiProperty({ example: 'PENDIENTE', enum: ['PENDIENTE', 'COMPLETADA'] })
  estado: string;

  @ApiProperty({ example: 15, description: 'Total de items en la compra' })
  totalItems: number;

  @ApiProperty({
    example: { 'PRE-COMPRA': 5, 'FABRICACION': 3, 'FORS': 4, 'CIF': 2, 'COMPLETADO': 1 },
    description: 'Conteo de items por estado'
  })
  itemsPorEstado: Record<string, number>;

  @ApiProperty({ example: 125000.50, description: 'Monto total de la compra' })
  montoTotal: number;

  @ApiProperty({ example: '2025-11-19T10:30:00.000Z' })
  fechaCreacion: Date;

  @ApiProperty({ example: '2025-11-19T15:45:00.000Z' })
  ultimaActualizacion: Date;
}