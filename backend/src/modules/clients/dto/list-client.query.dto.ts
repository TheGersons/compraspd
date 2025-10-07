import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListClientQueryDto {
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize?: number = 20;
}
