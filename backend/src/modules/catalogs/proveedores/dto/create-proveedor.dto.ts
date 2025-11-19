import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty({ example: 'Distribuidora XYZ S.A.' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({ example: '0801198812345', description: 'RTN/NIT/RFC del proveedor' })
  @IsString({ message: 'rtn debe ser texto' })
  @IsOptional()
  rtn?: string;

  @ApiPropertyOptional({ example: 'contacto@distribuidoraxyz.com' })
  @IsEmail({}, { message: 'email debe ser válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+504 2222-3333' })
  @IsString({ message: 'telefono debe ser texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Colonia Tepeyac, Tegucigalpa' })
  @IsString({ message: 'direccion debe ser texto' })
  @IsOptional()
  direccion?: string;
}