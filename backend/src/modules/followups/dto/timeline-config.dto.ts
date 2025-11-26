import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsInt, Min } from "class-validator";


export class TimelineConfigDto {
  @ApiProperty({ example: 2, required: false, description: 'Días de Cotizado a Con Descuento' })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCotizadoADescuento?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasDescuentoAComprado?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasCompradoAPagado?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasPagadoASeguimiento1?: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  diasSeguimiento1AFob?: number;

  @ApiProperty({ example: 3, required: false })
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