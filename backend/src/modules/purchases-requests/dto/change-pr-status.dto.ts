import { IsIn, IsOptional, IsString } from 'class-validator';
export class ChangePrStatusDto {
  @IsIn(['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED']) status: string;
  @IsOptional() @IsString() comment?: string;
}
