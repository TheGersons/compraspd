import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para eliminar un EstadoProducto puntual desde el panel admin.
 * Requiere la contraseña del admin para confirmar la operación.
 */
export class DeleteEstadoProductoAdminDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
