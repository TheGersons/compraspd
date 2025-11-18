import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Juan Pérez Actualizado' })
  @IsString({ message: 'nombre debe ser texto' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'uuid-del-departamento' })
  @IsUUID('4', { message: 'departamentoId debe ser un UUID válido' })
  @IsOptional()
  departamentoId?: string;

  @ApiPropertyOptional({ example: 'uuid-del-rol' })
  @IsUUID('4', { message: 'rolId debe ser un UUID válido' })
  @IsOptional()
  rolId?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'activo debe ser booleano' })
  @IsOptional()
  activo?: boolean;
}
