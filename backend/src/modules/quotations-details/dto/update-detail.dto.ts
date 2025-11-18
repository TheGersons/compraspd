import { 
  IsString, 
  IsOptional, 
  IsInt, 
  Min 
} from 'class-validator';

/**
 * DTO para actualizar un detalle existente
 * Todos los campos son opcionales
 */
export class UpdateQuotationDetailDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  descripcionProducto?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsString()
  tipoUnidad?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}