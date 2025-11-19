import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty({ example: 'Modernización de Oficinas 2025' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({ 
    example: 'Proyecto de actualización de equipos y mobiliario de oficina',
    description: 'Descripción detallada del proyecto'
  })
  @IsString({ message: 'descripcion debe ser texto' })
  @IsOptional()
  descripcion?: string;
}