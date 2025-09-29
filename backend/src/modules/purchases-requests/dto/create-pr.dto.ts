import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { PrItemDto } from './pr-item.dto';


export class CreatePrDto {
    @IsString()
    @MinLength(3)
    title!: string;


    @IsOptional()
    @IsString()
    description?: string;


    @IsOptional()
    @IsDateString()
    dueDate?: string;


    @IsOptional()
    @IsUUID()
    projectId?: string;


    @IsOptional()
    @IsUUID()
    locationId?: string; // destino


    @ValidateNested({ each: true })
    @Type(() => PrItemDto)
    items!: PrItemDto[];


    @IsOptional()
    @IsUUID()
    departmentId?: string;


    @IsOptional()
    @IsUUID()
    clientId?: string;


    @IsOptional()
    @IsEnum({ WAREHOUSE: 'WAREHOUSE', PROJECT: 'PROJECT' })
    deliveryType?: 'WAREHOUSE' | 'PROJECT';


    @IsOptional()
    @IsString()
    reference?: string;


    @IsOptional()
    @IsString()
    comment?: string;
}