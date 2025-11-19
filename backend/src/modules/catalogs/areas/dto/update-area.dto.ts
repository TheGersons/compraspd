import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAreaDto {
  @ApiPropertyOptional({ example: 'Compras y Logística' })
  @IsString({ message: 'nombreArea debe ser texto' })
  @MinLength(3, { message: 'nombreArea debe tener al menos 3 caracteres' })
  @IsOptional()
  nombreArea?: string;
}