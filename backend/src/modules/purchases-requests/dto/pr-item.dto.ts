import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItemType } from '@prisma/client';

export class PRItemDto {
  @IsEnum(ItemType) itemType: ItemType;
  @IsString() description: string;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() requiredCurrency?: string;
  @IsOptional() productId?: string;
  @IsOptional() extraSpecs?: Record<string, any>;
}
