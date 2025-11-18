import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString({ message: 'Contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'Contraseña actual es requerida' })
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString({ message: 'Nueva contraseña debe ser texto' })
  @MinLength(6, { message: 'Nueva contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'Nueva contraseña es requerida' })
  newPassword: string;
}
