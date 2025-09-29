import { IsOptional, IsString } from 'class-validator';


export class UpdateQuoteDto {
    @IsOptional()
    @IsString()
    status?: string;


    @IsOptional()
    @IsString()
    validUntil?: string;
}