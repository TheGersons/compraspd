import { 
  IsArray, 
  ValidateNested, 
  IsOptional,
  IsUUID,
  IsString,
  IsInt,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Item individual para actualización masiva
 */
export class BulkDetailItemDto {
  @IsOptional()
  @IsUUID()
  id?: string; // Si existe, actualiza; si no, crea nuevo

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @IsOptional()
  descripcionProducto?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  cantidad?: number;

  @IsString()
  @IsOptional()
  tipoUnidad?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

/**
 * DTO para actualización masiva de detalles de una cotización
 * Permite crear, actualizar y eliminar múltiples items en una sola operación
 */
export class BulkUpdateDetailsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkDetailItemDto)
  items: BulkDetailItemDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  deleteIds?: string[]; // IDs de items a eliminar
}