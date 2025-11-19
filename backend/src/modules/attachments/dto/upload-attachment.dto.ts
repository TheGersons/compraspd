import { 
  IsNotEmpty, 
  IsUUID,
  IsOptional,
  IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para subir un adjunto
 * El adjunto se sube primero, luego se asocia al mensaje
 */
export class UploadAttachmentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file?: any; // Para documentación de Swagger

  @IsOptional()
  @IsUUID()
  mensajeId?: string; // Opcional: si se sube directo con mensaje

  @IsOptional()
  @IsString()
  descripcion?: string; // Descripción opcional del archivo
}