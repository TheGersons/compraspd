import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ 
    example: 'cotizaciones',
    description: 'Módulo o recurso (se convertirá a minúsculas)'
  })
  @IsString({ message: 'Módulo debe ser texto' })
  @MinLength(3, { message: 'Módulo debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'Módulo es requerido' })
  modulo: string;

  @ApiProperty({ 
    example: 'create',
    description: 'Acción del permiso: create, read, update, delete, approve, etc.'
  })
  @IsString({ message: 'Acción debe ser texto' })
  @MinLength(3, { message: 'Acción debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'Acción es requerida' })
  accion: string;

  @ApiProperty({ 
    example: 'Permite crear nuevas cotizaciones',
    description: 'Descripción del permiso'
  })
  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerida' })
  descripcion: string;
}