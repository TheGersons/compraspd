import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CrearPaisDto {
  @ApiProperty({ example: 'Brasil' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  codigo: string;
}
