import { IsInt, IsOptional, IsString } from 'class-validator';


export class UpdateOfferLineDto {
    @IsOptional()
    @IsString()
    unitPrice?: string;


    @IsOptional()
    @IsInt()
    deliveryDays?: number;


    @IsOptional()
    @IsString()
    notes?: string;
}