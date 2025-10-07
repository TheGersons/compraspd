import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  taxId?: string;   // RTN u otro identificador

  @IsOptional()
  @IsString()
  contact?: string; // email/teléfono u otro medio
}
