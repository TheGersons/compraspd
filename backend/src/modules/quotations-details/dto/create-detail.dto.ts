import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  Min,
  IsUUID
} from 'class-validator';

/**
 * DTO para crear un nuevo detalle de cotización
 * Mapea a: CotizacionDetalle
 */
export class CreateQuotationDetailDto {
  @IsNotEmpty()
  @IsUUID()
  cotizacionId: string; // ID de la cotización padre

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  @IsString()
  descripcionProducto: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNotEmpty()
  @IsString()
  tipoUnidad: string; // Ejemplo: "UNIDAD", "CAJA", "METRO", "LITRO"

  @IsOptional()
  @IsString()
  notas?: string;
}