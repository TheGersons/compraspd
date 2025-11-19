import { 
  IsArray, 
  IsUUID, 
  ArrayMinSize,
  IsOptional
} from 'class-validator';

/**
 * DTO para crear un nuevo chat
 * Un chat puede ser entre 2 o más usuarios
 */
export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos 1 participante' })
  @IsUUID('4', { each: true })
  participantesIds: string[]; // IDs de usuarios participantes (sin incluir el creador)
}

/**
 * DTO para agregar participantes a un chat existente
 */
export class AddParticipantsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  participantesIds: string[];
}