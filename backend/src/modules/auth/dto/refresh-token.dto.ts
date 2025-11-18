import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token' 
  })
  @IsString({ message: 'Refresh token debe ser texto' })
  @IsNotEmpty({ message: 'Refresh token es requerido' })
  refresh_token: string;
}