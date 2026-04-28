import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsIn,
} from 'class-validator';

/**
 * DTO admin para editar campos de una Cotización con propagación a tablas relacionadas.
 * Cualquier campo presente sobreescribe; los ausentes no se modifican.
 */
export class UpdateCotizacionAdminDto {
  @IsOptional()
  @IsString()
  nombreCotizacion?: string;

  @IsOptional()
  @IsUUID()
  tipoId?: string;

  @IsOptional()
  @IsUUID()
  solicitanteId?: string;

  @IsOptional()
  @IsUUID()
  supervisorResponsableId?: string | null;

  @IsOptional()
  @IsUUID()
  proyectoId?: string | null;

  @IsOptional()
  @IsUUID()
  monedaId?: string | null;

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

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  ordenCompra?: string;
}
