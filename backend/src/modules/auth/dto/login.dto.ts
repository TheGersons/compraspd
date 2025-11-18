import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin@empresa.com',
    description: 'Email del usuario' 
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({ 
    example: 'Admin123!',
    description: 'Contraseña del usuario' 
  })
  @IsString({ message: 'Password debe ser texto' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}