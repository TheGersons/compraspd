import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Length,
  Min,
  Max,
} from 'class-validator';

export class UpdateMonedaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  codigo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Length(1, 5)
  simbolo?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  decimales?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  orden?: number;
}
