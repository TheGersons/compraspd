import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsUUID } from 'class-validator';

export enum TipoSeguimiento {
  CAMBIO_ESTADO = 'CAMBIO_ESTADO',
  COMENTARIO = 'COMENTARIO',
  NOTA = 'NOTA',
  ALERTA = 'ALERTA'
}

export class CreateSeguimientoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  compraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  compraDetalleId?: string;

  @ApiProperty({ enum: TipoSeguimiento })
  @IsEnum(TipoSeguimiento)
  tipo: TipoSeguimiento;

  @ApiProperty()
  @IsString()
  detalle: string;
}

export class ListSeguimientoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  compraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  compraDetalleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: TipoSeguimiento })
  @IsOptional()
  @IsEnum(TipoSeguimiento)
  tipo?: TipoSeguimiento;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}