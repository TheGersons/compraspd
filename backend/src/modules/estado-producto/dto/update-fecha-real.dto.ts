import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFechaRealDto {
  @ApiProperty({
    description: 'Estado al que corresponde la fecha real',
    example: 'comprado',
    enum: [
      'aprobacionCompra',
      'comprado',
      'pagado',
      'aprobacionPlanos',
      'primerSeguimiento',
      'enFOB',
      'cotizacionFleteInternacional',
      'conBL',
      'segundoSeguimiento',
      'enCIF',
      'recibido',
    ],
  })
  @IsString()
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: string;

  @ApiProperty({
    description: 'Nueva fecha real en formato ISO',
    example: '2025-03-15T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO válido' })
  @IsNotEmpty({ message: 'La nueva fecha real es requerida' })
  nuevaFechaReal: string;
}
