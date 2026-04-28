import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * DTO admin para editar campos de un EstadoProducto.
 * Solo se actualizan los campos presentes.
 */
export class UpdateEstadoProductoAdminDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @IsOptional()
  @IsUUID()
  monedaId?: string | null;

  @IsOptional()
  @IsUUID()
  paisOrigenId?: string | null;

  @IsOptional()
  @IsUUID()
  responsableSeguimientoId?: string | null;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
