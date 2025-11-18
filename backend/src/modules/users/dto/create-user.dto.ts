import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'juan.perez@empresa.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password debe ser texto' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'Nombre debe ser texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 'uuid-del-departamento' })
  @IsUUID('4', { message: 'departamentoId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'departamentoId es requerido' })
  departamentoId: string;

  @ApiProperty({ example: 'uuid-del-rol' })
  @IsUUID('4', { message: 'rolId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'rolId es requerido' })
  rolId: string;
}