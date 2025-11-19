import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePrecioDto {
  @ApiProperty({ example: 'uuid-cotizacion-detalle' })
  @IsUUID('4', { message: 'cotizacionDetalleId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'cotizacionDetalleId es requerido' })
  cotizacionDetalleId: string;

  @ApiProperty({ example: 1250.50 })
  @IsNumber({}, { message: 'precio debe ser un número' })
  @Min(0, { message: 'precio debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'precio es requerido' })
  precio: number;

  @ApiPropertyOptional({ example: 1100.00, description: 'Precio con descuento aplicado' })
  @IsNumber({}, { message: 'precioDescuento debe ser un número' })
  @Min(0, { message: 'precioDescuento debe ser mayor o igual a 0' })
  @IsOptional()
  precioDescuento?: number;

  @ApiProperty({ example: 'uuid-proveedor' })
  @IsUUID('4', { message: 'proveedorId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'proveedorId es requerido' })
  proveedorId: string;

  @ApiPropertyOptional({ 
    example: '/uploads/comprobante-descuento.pdf',
    description: 'Ruta del archivo de comprobante de descuento'
  })
  @IsString({ message: 'comprobanteDescuento debe ser texto' })
  @IsOptional()
  comprobanteDescuento?: string;
}