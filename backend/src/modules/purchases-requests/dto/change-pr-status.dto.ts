import { IsString, MinLength } from 'class-validator';


export class ChangePrStatusDto {
    @IsString()
    @MinLength(2)
    status!: string; // DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
}