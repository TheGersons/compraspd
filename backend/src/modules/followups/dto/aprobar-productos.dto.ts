import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { AprobarProductoDto } from "./aprobar-producto.dto";

export class AprobarProductosDto {
  @ApiProperty({ 
    type: [AprobarProductoDto],
    description: 'Lista de productos a aprobar/desaprobar'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AprobarProductoDto)
  productos: AprobarProductoDto[];
}