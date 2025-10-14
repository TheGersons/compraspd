// src/modules/tracking-quotes/dto/assign-user.dto.ts
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignUserDto {
  @IsNotEmpty({ message: 'El ID del asignado es requerido.' })
  @IsString()
  assigneeId: string;

  @IsOptional()
  @IsString()
  @IsIn(['REVISOR', 'APROBADOR'], { message: 'El rol debe ser REVISOR o APROBADOR.' })
  role?: 'REVISOR' | 'APROBADOR';
}