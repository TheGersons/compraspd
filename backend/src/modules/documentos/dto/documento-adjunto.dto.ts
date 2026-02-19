import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentoAdjuntoDto {
  @ApiProperty({ description: 'ID del estado producto' })
  @IsUUID()
  @IsNotEmpty()
  estadoProductoId: string;

  @ApiProperty({
    description: 'ID del documento requerido (opcional si es extra)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  documentoRequeridoId?: string;

  @ApiProperty({ example: 'comprado' })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({ example: 'Orden de Compra' })
  @IsString()
  @IsNotEmpty()
  nombreDocumento: string;
}
