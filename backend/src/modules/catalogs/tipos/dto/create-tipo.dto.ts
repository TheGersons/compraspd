import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTipoDto {
  @ApiProperty({ example: 'Equipos de Oficina' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'nombre es requerido' })
  nombre: string;

  @ApiProperty({ example: 'uuid-del-area' })
  @IsUUID('4', { message: 'areaId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'areaId es requerido' })
  areaId: string;
}