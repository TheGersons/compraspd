import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { ConfigurarProductoDto } from "./configurar-producto.dto";

export class ConfigurarCotizacionDto {
  @ApiProperty({ 
    type: [ConfigurarProductoDto],
    description: 'Configuración de timeline por producto'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigurarProductoDto)
  productos: ConfigurarProductoDto[];
}