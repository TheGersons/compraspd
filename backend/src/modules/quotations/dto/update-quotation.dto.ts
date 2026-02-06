import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsUUID,
  IsIn
} from 'class-validator';

/**
 * DTO para actualizar una cotización
 * Solo campos de cabecera (NO items, esos se editan por separado)
 */
export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  nombreCotizacion?: string;

  @IsOptional()
  @IsUUID()
  tipoId?: string;

  @IsOptional()
  @IsUUID()
  proyectoId?: string;

  @IsOptional()
  @IsIn(['NACIONAL', 'INTERNACIONAL'])
  tipoCompra?: 'NACIONAL' | 'INTERNACIONAL';

  @IsOptional()
  @IsIn(['ALMACEN', 'PROYECTO', 'OFICINA'])
  lugarEntrega?: 'ALMACEN' | 'PROYECTO' | 'OFICINA';

  @IsOptional()
  @IsDateString()
  fechaLimite?: string;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @IsOptional()
  @IsString()
  comentarios?: string;
}