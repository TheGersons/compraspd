import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class PaginateUsersDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser al menos 1' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt({ message: 'pageSize debe ser un número entero' })
  @Min(1, { message: 'pageSize debe ser al menos 1' })
  @Max(100, { message: 'pageSize no puede ser mayor a 100' })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ example: 'juan' })
  @IsString({ message: 'search debe ser texto' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-del-rol' })
  @IsUUID('4', { message: 'rolId debe ser un UUID válido' })
  @IsOptional()
  rolId?: string;

  @ApiPropertyOptional({ example: 'uuid-del-departamento' })
  @IsUUID('4', { message: 'departamentoId debe ser un UUID válido' })
  @IsOptional()
  departamentoId?: string;

  @ApiPropertyOptional({ example: true })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'activo debe ser booleano' })
  @IsOptional()
  activo?: boolean;
}