import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsUUID, IsBoolean } from 'class-validator';

export enum TipoNotificacion {
  COMPRA_CREADA = 'COMPRA_CREADA',
  ESTADO_ACTUALIZADO = 'ESTADO_ACTUALIZADO',
  COMPRA_COMPLETADA = 'COMPRA_COMPLETADA',
  COMENTARIO_NUEVO = 'COMENTARIO_NUEVO',
  ALERTA = 'ALERTA'
}

export class CreateNotificacionDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: TipoNotificacion })
  @IsEnum(TipoNotificacion)
  tipo: TipoNotificacion;

  @ApiProperty()
  @IsString()
  titulo: string;

  @ApiProperty()
  @IsString()
  descripcion: string;
}

export class ListNotificacionesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completada?: boolean;

  @ApiPropertyOptional({ enum: TipoNotificacion })
  @IsOptional()
  @IsEnum(TipoNotificacion)
  tipo?: TipoNotificacion;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class MarcarCompletadaDto {
  @ApiProperty()
  @IsBoolean()
  completada: boolean;
}