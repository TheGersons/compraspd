import { IsBooleanString, IsNumberString, IsOptional, IsString } from "class-validator";

export class QueryUsersDto {
    @IsNumberString() @IsOptional() page?: string;
    @IsNumberString() @IsOptional() pageSize?: string;
    @IsString() @IsOptional() search?: string;
    @IsString() @IsOptional() roleId?: string;
    @IsBooleanString() @IsOptional() isActive?: string;
}
