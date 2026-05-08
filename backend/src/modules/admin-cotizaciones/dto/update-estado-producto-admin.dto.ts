import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Matches,
  ValidateIf,
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

  // Número de OC en formato "P00000". Vacío/null = desvincular OC.
  // Si la OC no existe para esta cotización, se crea automáticamente.
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @Matches(/^P\d{5}$/, { message: 'Formato de OC inválido. Debe ser P00000' })
  numeroOC?: string | null;
}
