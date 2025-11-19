import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID,
  IsArray,
  IsIn
} from 'class-validator';

/**
 * DTO para crear un mensaje en un chat
 */
export class CreateMessageDto {
  @IsNotEmpty()
  @IsUUID()
  chatId: string; // ID del chat donde se enviará el mensaje

  @IsNotEmpty()
  @IsString()
  contenido: string; // body → contenido

  @IsOptional()
  @IsIn(['TEXTO', 'IMAGEN', 'DOCUMENTO', 'AUDIO', 'VIDEO'])
  tipoMensaje?: 'TEXTO' | 'IMAGEN' | 'DOCUMENTO' | 'AUDIO' | 'VIDEO';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  adjuntosIds?: string[]; // IDs de adjuntos previamente subidos
}