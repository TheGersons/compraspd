import { ApiProperty } from '@nestjs/swagger';

export class PaisResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  creado: Date;

  @ApiProperty()
  actualizado: Date;
}