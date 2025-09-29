import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';


export class PaginationDto {
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page?: number = 1;


@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
pageSize?: number = 20;


@IsOptional()
@IsString()
q?: string;
}