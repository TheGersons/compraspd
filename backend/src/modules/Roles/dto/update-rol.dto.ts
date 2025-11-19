import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateRolDto {
  @ApiPropertyOptional({ example: 'COMPRADOR_SENIOR' })
  @IsString({ message: 'Nombre debe ser texto' })
  @MinLength(3, { message: 'Nombre debe tener al menos 3 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Usuario senior encargado de compras' })
  @IsString({ message: 'Descripción debe ser texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'Activo debe ser booleano' })
  @IsOptional()
  activo?: boolean;
}