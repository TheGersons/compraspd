import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum ItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  RENTAL = 'RENTAL',
  OTHER = 'OTHER',
}

export class PRItemDto {
  @IsString()
  @MinLength(2)
  description!: string;

  @IsNumberString()
  quantity!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  productId?: string; // cuid, no UUID

  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  requiredCurrency?: string; // 'HNL' | 'USD'

  @IsOptional()
  @IsString()
  extraSpecs?: string; // Descripción adicional o especificaciones
}
