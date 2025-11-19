import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'compras' })
  @IsString({ message: 'Módulo debe ser texto' })
  @MinLength(3, { message: 'Módulo debe tener al menos 3 caracteres' })
  @IsOptional()
  modulo?: string;

  @ApiPropertyOptional({ example: 'update' })
  @IsString({ message: 'Acción debe ser texto' })
  @MinLength(3, { message: 'Acción debe tener al menos 3 caracteres' })
  @IsOptional()
  accion?: string;

  @ApiPropertyOptional({ example: 'Permite actualizar compras' })
  @IsString({ message: 'Descripción debe ser texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'Activo debe ser booleano' })
  @IsOptional()
  activo?: boolean;
}