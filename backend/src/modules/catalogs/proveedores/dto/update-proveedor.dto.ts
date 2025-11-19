import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProveedorDto {
  @ApiPropertyOptional({ example: 'Distribuidora XYZ S.A. de C.V.' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: '0801198812345' })
  @IsString({ message: 'rtn debe ser texto' })
  @IsOptional()
  rtn?: string;

  @ApiPropertyOptional({ example: 'nuevo@distribuidoraxyz.com' })
  @IsEmail({}, { message: 'email debe ser válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+504 2222-4444' })
  @IsString({ message: 'telefono debe ser texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Nueva dirección' })
  @IsString({ message: 'direccion debe ser texto' })
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'activo debe ser booleano' })
  @IsOptional()
  activo?: boolean;
}