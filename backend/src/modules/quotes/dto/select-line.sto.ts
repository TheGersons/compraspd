import { IsOptional, IsString } from 'class-validator';


export class SelectLineDto {
    @IsString()
    lineId!: string;


    @IsOptional()
    @IsString()
    chosenSupplierId?: string;


    @IsOptional()
    @IsString()
    chosenOfferId?: string;


    @IsOptional()
    @IsString()
    chosenCurrency?: string;


    @IsOptional()
    @IsString()
    chosenUnitPrice?: string; // Decimal en string
}