import { IsDecimal, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';


export class PrItemDto {
    @IsOptional()
    @IsUUID()
    productId?: string;


    @IsString()
    @MinLength(1)
    description!: string;


    @IsDecimal({ decimal_digits: '0,6' })
    quantity!: any; // usar Decimal.js si deseas


    @IsOptional()
    @IsString()
    unit?: string;


    @IsOptional()
    @IsString()
    requiredCurrency?: string; // HNL|USD


    @IsOptional()
    @IsEnum({ PRODUCT: 'PRODUCT', SERVICE: 'SERVICE', RENTAL: 'RENTAL', OTHER: 'OTHER' })
    itemType?: 'PRODUCT' | 'SERVICE' | 'RENTAL' | 'OTHER';


    @IsOptional()
    @IsString()
    sku?: string;


    @IsOptional()
    @IsString()
    barcode?: string;


    @IsOptional()
    extraSpecs?: Record<string, any>;
}