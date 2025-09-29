import { IsOptional, IsString } from 'class-validator';


export class CreateQuoteDto {
    @IsString()
    purchaseRequestId!: string;


    @IsOptional()
    @IsString()
    baseCurrency?: string; // HNL por defecto
}