import { IsString, MinLength } from 'class-validator';


export class ChangeQuoteStatusDto {
    @IsString()
    @MinLength(2)
    status!: string; // REQUESTED, COMPARING, SELECTED, APPROVED, REJECTED
}