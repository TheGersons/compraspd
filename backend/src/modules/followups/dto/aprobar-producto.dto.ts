import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsBoolean, IsOptional, IsString } from "class-validator";

export class AprobarProductoDto {
  @ApiProperty({ example: 'uuid-estado-producto' })
  @IsUUID()
  estadoProductoId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  aprobado: boolean;

  @ApiProperty({ example: 'Aprobado para proceder con compra', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}