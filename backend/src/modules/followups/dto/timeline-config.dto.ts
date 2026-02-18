import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class TimelineConfigDto {
  @ApiProperty({
    example: 2,
    required: false,
    description: 'Días de Cotizado a Con Descuento',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCotizadoADescuento?: number;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Días desde Con Descuento hasta Aprobación de Compra',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasDescuentoAAprobacionCompra?: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Días desde Aprobación de Compra hasta Comprado',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasAprobacionCompraAComprado?: number;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Días de Descuento a Comprado (compatibilidad)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasDescuentoAComprado?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCompradoAPagado?: number;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Días desde Pagado hasta Aprobación de Planos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasPagadoAAprobacionPlanos?: number;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Días desde Aprobación de Planos hasta 1er Seguimiento',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasAprobacionPlanosASeguimiento1?: number;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Días de Pagado a 1er Seguimiento (compatibilidad)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasPagadoASeguimiento1?: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento1AFob?: number;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Días desde FOB hasta Cotización Flete',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasFobACotizacionFlete?: number;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Días desde Cotización Flete hasta BL',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCotizacionFleteABl?: number;

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Días de FOB a BL (compatibilidad)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasFobABl?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasBlASeguimiento2?: number;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento2ACif?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCifARecibido?: number;
}
