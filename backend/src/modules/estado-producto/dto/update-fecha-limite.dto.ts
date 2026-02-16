import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFechaLimiteDto {
  @ApiProperty({ 
    description: 'Estado al que corresponde la fecha límite',
    example: 'comprado',
    enum: ['comprado', 'pagado', 'primerSeguimiento', 'enFOB', 'conBL', 'segundoSeguimiento', 'enCIF', 'recibido']
  })
  @IsString()
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: string;

  @ApiProperty({ 
    description: 'Nueva fecha límite en formato ISO',
    example: '2025-03-15T00:00:00.000Z'
  })
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO válido' })
  @IsNotEmpty({ message: 'La nueva fecha límite es requerida' })
  nuevaFechaLimite: string;
}