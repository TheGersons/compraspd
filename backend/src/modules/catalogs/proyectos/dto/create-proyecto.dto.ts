// ============================================================================
// dto/create-proyecto.dto.ts
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  MaxLength,
  IsInt,
  Min,
  Max
} from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty({ 
    description: 'Nombre del proyecto', 
    example: 'Renovación de Infraestructura IT' 
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({ 
    description: 'Descripción detallada del proyecto', 
    required: false,
    example: 'Renovación completa de servidores y equipos de red' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion?: string;

  @ApiProperty({
    description: 'Nivel de criticidad del proyecto (1-10, donde 10 es más crítico)',
    example: 7,
    minimum: 1,
    maximum: 10,
    default: 5,
    required: false
  })
  @IsInt({ message: 'La criticidad debe ser un número entero' })
  @Min(1, { message: 'La criticidad mínima es 1' })
  @Max(10, { message: 'La criticidad máxima es 10' })
  @IsOptional()
  criticidad?: number;
}