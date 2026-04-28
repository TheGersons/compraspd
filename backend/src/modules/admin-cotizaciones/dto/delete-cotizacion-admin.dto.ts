import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para eliminar una Cotización completa (hard delete).
 * Requiere la contraseña del admin para confirmar la operación.
 */
export class DeleteCotizacionAdminDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
