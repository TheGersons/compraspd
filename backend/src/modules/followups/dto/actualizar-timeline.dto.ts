import { ApiProperty } from "@nestjs/swagger";
import { MedioTransporte } from "@prisma/client";
import { Type } from "class-transformer";
import { IsString, IsOptional, IsUUID, IsEnum, ValidateNested } from "class-validator";
import { TimelineConfigDto } from "./timeline-config.dto";

export class ActualizarTimelineDto {
  @ApiProperty({ example: 'TRANSF-500KVA' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'uuid-china', required: false })
  @IsOptional()
  @IsUUID()
  paisOrigenId?: string;

  @ApiProperty({ enum: MedioTransporte, required: false })
  @IsOptional()
  @IsEnum(MedioTransporte)
  medioTransporte?: MedioTransporte;

  @ApiProperty({ type: TimelineConfigDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimelineConfigDto)
  timeline?: TimelineConfigDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}