// ============================================================================
// dto/update-proyecto.dto.ts
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  MaxLength,
  IsInt,
  Min,
  Max
} from 'class-validator';

export class UpdateProyectoDto {
  @ApiProperty({ 
    description: 'Nombre del proyecto',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @ApiProperty({ 
    description: 'Descripción del proyecto',
    required: false 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @ApiProperty({
    description: 'Nivel de criticidad del proyecto (1-10)',
    required: false,
    minimum: 1,
    maximum: 10
  })
  @IsInt({ message: 'La criticidad debe ser un número entero' })
  @Min(1, { message: 'La criticidad mínima es 1' })
  @Max(10, { message: 'La criticidad máxima es 10' })
  @IsOptional()
  criticidad?: number;

  @ApiProperty({ 
    description: 'Estado del proyecto (true=activo, false=cerrado)',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
