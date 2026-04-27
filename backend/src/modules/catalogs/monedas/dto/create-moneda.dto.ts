import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Length,
  Min,
  Max,
} from 'class-validator';

export class CreateMonedaDto {
  @ApiProperty({ description: 'Código ISO 4217 (3 letras)', example: 'HNL' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código debe tener exactamente 3 caracteres' })
  codigo: string;

  @ApiProperty({ description: 'Nombre de la moneda', example: 'Lempira' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nombre: string;

  @ApiProperty({ description: 'Símbolo', example: 'L.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5)
  simbolo: string;

  @ApiProperty({ description: 'Cantidad de decimales', example: 2, default: 2 })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  decimales?: number;

  @ApiProperty({ description: 'Activa para selección', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ description: 'Orden de presentación', default: 0 })
  @IsInt()
  @IsOptional()
  orden?: number;
}
