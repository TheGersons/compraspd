// ============================================
// DTOs para módulo de TIMELINE-SKU
// Configuración de tiempos estimados por SKU
// ============================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedioTransporte } from '@prisma/client';

/**
 * DTO para crear configuración de timeline de un SKU
 */
export class CreateTimelineSKUDto {
  @ApiProperty({
    description: 'SKU del producto',
    example: 'CABLE-HDMI-001'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  sku: string;

  @ApiPropertyOptional({
    description: 'ID del país de origen',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  paisOrigenId?: string;

  @ApiProperty({
    description: 'Medio de transporte',
    enum: MedioTransporte,
    default: MedioTransporte.MARITIMO
  })
  @IsEnum(MedioTransporte)
  medioTransporte: MedioTransporte;

  // Días entre procesos (null = proceso no aplica)
  
  @ApiPropertyOptional({
    description: 'Días desde cotizado hasta con descuento',
    example: 2
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCotizadoADescuento?: number;

  @ApiPropertyOptional({
    description: 'Días desde con descuento hasta comprado',
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasDescuentoAComprado?: number;

  @ApiPropertyOptional({
    description: 'Días desde comprado hasta pagado',
    example: 3
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCompradoAPagado?: number;

  @ApiPropertyOptional({
    description: 'Días desde pagado hasta primer seguimiento',
    example: 7
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasPagadoASeguimiento1?: number;

  @ApiPropertyOptional({
    description: 'Días desde primer seguimiento hasta FOB',
    example: 14
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento1AFob?: number;

  @ApiPropertyOptional({
    description: 'Días desde FOB hasta BL (solo marítimo)',
    example: 2
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasFobABl?: number;

  @ApiPropertyOptional({
    description: 'Días desde BL hasta segundo seguimiento',
    example: 21
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasBlASeguimiento2?: number;

  @ApiPropertyOptional({
    description: 'Días desde segundo seguimiento hasta CIF',
    example: 7
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento2ACif?: number;

  @ApiPropertyOptional({
    description: 'Días desde CIF hasta recibido',
    example: 3
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCifARecibido?: number;

  @ApiPropertyOptional({
    description: 'Observaciones o notas sobre el timeline',
    example: 'Timeline estimado para productos de China vía marítima'
  })
  @IsOptional()
  @IsString()
  notas?: string;
}

/**
 * DTO para actualizar timeline de SKU
 */
export class UpdateTimelineSKUDto {
  @ApiPropertyOptional({
    description: 'ID del país de origen'
  })
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

  @ApiPropertyOptional({ description: 'Días desde cotizado hasta con descuento' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCotizadoADescuento?: number;

  @ApiPropertyOptional({ description: 'Días desde con descuento hasta comprado' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasDescuentoAComprado?: number;

  @ApiPropertyOptional({ description: 'Días desde comprado hasta pagado' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCompradoAPagado?: number;

  @ApiPropertyOptional({ description: 'Días desde pagado hasta primer seguimiento' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasPagadoASeguimiento1?: number;

  @ApiPropertyOptional({ description: 'Días desde primer seguimiento hasta FOB' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento1AFob?: number;

  @ApiPropertyOptional({ description: 'Días desde FOB hasta BL' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasFobABl?: number;

  @ApiPropertyOptional({ description: 'Días desde BL hasta segundo seguimiento' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasBlASeguimiento2?: number;

  @ApiPropertyOptional({ description: 'Días desde segundo seguimiento hasta CIF' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento2ACif?: number;

  @ApiPropertyOptional({ description: 'Días desde CIF hasta recibido' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCifARecibido?: number;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  notas?: string;
}

/**
 * DTO para filtros de listado
 */
export class ListTimelineSKUQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por medio de transporte' })
  @IsOptional()
  @IsEnum(MedioTransporte)
  medioTransporte?: MedioTransporte;

  @ApiPropertyOptional({ description: 'Filtrar por país de origen' })
  @IsOptional()
  @IsUUID()
  paisOrigenId?: string;

  @ApiPropertyOptional({ description: 'Buscar por SKU (parcial)' })
  @IsOptional()
  @IsString()
  sku?: string;

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
  pageSize?: number;
}

/**
 * DTO de respuesta de timeline SKU
 */
export class TimelineSKUResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiPropertyOptional()
  paisOrigenId?: string;

  @ApiProperty()
  medioTransporte: MedioTransporte;

  @ApiPropertyOptional()
  diasCotizadoADescuento?: number;

  @ApiPropertyOptional()
  diasDescuentoAComprado?: number;

  @ApiPropertyOptional()
  diasCompradoAPagado?: number;

  @ApiPropertyOptional()
  diasPagadoASeguimiento1?: number;

  @ApiPropertyOptional()
  diasSeguimiento1AFob?: number;

  @ApiPropertyOptional()
  diasFobABl?: number;

  @ApiPropertyOptional()
  diasBlASeguimiento2?: number;

  @ApiPropertyOptional()
  diasSeguimiento2ACif?: number;

  @ApiPropertyOptional()
  diasCifARecibido?: number;

  @ApiProperty({
    description: 'Total de días estimados (suma de todos los días no nulos)'
  })
  diasTotalesEstimados: number;

  @ApiPropertyOptional()
  notas?: string;

  @ApiProperty()
  creado: Date;

  @ApiProperty()
  actualizado: Date;
}