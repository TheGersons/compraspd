import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ 
    example: 'Compras',
    description: 'Nombre del departamento'
  })
  @IsString({ message: 'Nombre debe ser texto' })
  @MinLength(3, { message: 'Nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  nombre: string;
}