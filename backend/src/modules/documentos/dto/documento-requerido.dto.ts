import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentoRequeridoDto {
  @ApiProperty({ example: 'comprado' })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({ example: 'Orden de Compra' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  obligatorio?: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @IsOptional()
  orden?: number;
}

export class UpdateDocumentoRequeridoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  obligatorio?: boolean;

  @IsInt()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
