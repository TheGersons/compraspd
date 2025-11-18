import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';


export class OfferLineDto {
    @IsString()
    prItemId!: string;


    @IsString()
    unitPrice!: string; // Decimal string


    @IsOptional()
    @IsInt()
    deliveryDays?: number;


    @IsOptional()
    @IsString()
    notes?: string;
}


export class AddOfferLinesDto {
    @ValidateNested({ each: true })
    @Type(() => OfferLineDto)
    @IsArray()
    lines!: OfferLineDto[];
}