import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePrecioDto {
  @ApiPropertyOptional({ example: 1300.00 })
  @IsNumber({}, { message: 'precio debe ser un número' })
  @Min(0, { message: 'precio debe ser mayor o igual a 0' })
  @IsOptional()
  precio?: number;

  @ApiPropertyOptional({ example: 1150.00 })
  @IsNumber({}, { message: 'precioDescuento debe ser un número' })
  @Min(0, { message: 'precioDescuento debe ser mayor o igual a 0' })
  @IsOptional()
  precioDescuento?: number;

  @ApiPropertyOptional({ example: '/uploads/nuevo-comprobante.pdf' })
  @IsString({ message: 'comprobanteDescuento debe ser texto' })
  @IsOptional()
  comprobanteDescuento?: string;
}