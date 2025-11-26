import { ApiProperty } from "@nestjs/swagger";
import { MedioTransporte } from "@prisma/client";
import { Type } from "class-transformer";
import { IsString, IsUUID, IsEnum, ValidateNested, IsOptional } from "class-validator";
import { TimelineConfigDto } from "./timeline-config.dto";

export class ConfigurarProductoDto {
  @ApiProperty({ example: 'TRANSF-500KVA', description: 'SKU del producto' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'uuid-china', description: 'ID del país de origen' })
  @IsUUID()
  paisOrigenId: string;

  @ApiProperty({ enum: MedioTransporte, example: MedioTransporte.MARITIMO })
  @IsEnum(MedioTransporte)
  medioTransporte: MedioTransporte;

  @ApiProperty({ type: TimelineConfigDto })
  @ValidateNested()
  @Type(() => TimelineConfigDto)
  timeline: TimelineConfigDto;

  @ApiProperty({ example: 'Producto requiere fabricación especial', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}