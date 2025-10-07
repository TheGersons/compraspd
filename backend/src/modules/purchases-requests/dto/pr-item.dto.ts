import { IsEnum, IsNumberString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export enum ItemType { PRODUCT = 'PRODUCT', SERVICE = 'SERVICE', RENTAL = 'RENTAL', OTHER = 'OTHER' }

export class PRItemDto {
  @IsString()
  @MinLength(2)
  description!: string;

  // Aceptamos string numérica por compatibilidad con Decimal de Prisma
  @IsNumberString()
  quantity!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

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
}
