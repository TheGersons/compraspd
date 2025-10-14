// src/modules/tracking-quotes/dto/add-comment.dto.ts
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty({ message: 'El cuerpo del comentario no puede estar vacío.' })
  @IsString()
  @Length(3, 500, { message: 'El comentario debe tener entre 3 y 500 caracteres.' })
  body: string;
}