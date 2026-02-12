import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeTempPasswordDto {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email!: string;

  @ApiProperty({ description: 'Contraseña temporal recibida por correo', example: 'Abc123!@#' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña temporal es requerida' })
  tempPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña (mínimo 6 caracteres)', example: 'nuevaPassword123' })
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}