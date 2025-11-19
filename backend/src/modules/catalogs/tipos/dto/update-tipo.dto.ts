import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateTipoDto {
  @ApiPropertyOptional({ example: 'Equipos Tecnológicos' })
  @IsString({ message: 'nombre debe ser texto' })
  @MinLength(3, { message: 'nombre debe tener al menos 3 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'uuid-del-area' })
  @IsUUID('4', { message: 'areaId debe ser un UUID válido' })
  @IsOptional()
  areaId?: string;
}