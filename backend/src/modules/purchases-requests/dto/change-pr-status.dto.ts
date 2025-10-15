import { IsString, MinLength } from 'class-validator';


export class ChangePrStatusDto {
    @IsString()
    @MinLength(2)
    status!: string; //SUBMITTED, IN_PROGRESS, APPROVED, REJECTED, CANCELLED
}