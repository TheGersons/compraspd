import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProyectoDto {
  @ApiPropertyOptional({ example: 'Modernización de Oficinas 2025 - Fase 2' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada del proyecto' })
  @IsString({ message: 'descripcion debe ser texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: true, description: 'true=activo, false=cerrado' })
  @IsBoolean({ message: 'estado debe ser booleano' })
  @IsOptional()
  estado?: boolean;
}