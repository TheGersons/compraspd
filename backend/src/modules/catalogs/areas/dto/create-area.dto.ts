import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: 'Compras', description: 'Nombre del área' })
  @IsString({ message: 'nombreArea debe ser texto' })
  @MinLength(3, { message: 'nombreArea debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'nombreArea es requerido' })
  nombreArea: string;
}