import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ 
    example: 'Compras y Logística',
    description: 'Nuevo nombre del departamento'
  })
  @IsString({ message: 'Nombre debe ser texto' })
  @MinLength(3, { message: 'Nombre debe tener al menos 3 caracteres' })
  @IsOptional()
  nombre?: string;
}