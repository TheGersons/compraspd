import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({ example: 'COMPRADOR', description: 'Nombre del rol (se convertirá a mayúsculas)' })
  @IsString({ message: 'Nombre debe ser texto' })
  @MinLength(3, { message: 'Nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 'Usuario encargado de gestionar compras' })
  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerida' })
  descripcion: string;
}