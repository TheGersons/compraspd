import { IsString } from 'class-validator';


export class CreateOfferDto {
    @IsString()
    quoteId!: string;


    @IsString()
    supplierId!: string;


    @IsString()
    currency!: string; // HNL|USD
}