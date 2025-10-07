import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PRItemDto } from './pr-item.dto';

export enum ProcurementType {
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
}
export enum DeliveryType {
  WAREHOUSE = 'WAREHOUSE',
  PROJECT = 'PROJECT',
}

export class CreatePurchaseRequestDto {
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
  @IsString()
  projectId?: string; // cuid, no UUID

  @IsOptional()
  @IsString()
  locationId?: string; // cuid

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(ProcurementType)
  procurement?: ProcurementType;

  @IsOptional()
  @IsDateString()
  quoteDeadline?: string;

  @IsOptional()
  @IsEnum(DeliveryType)
  deliveryType?: DeliveryType;

  @IsOptional()
  @IsString()
  warehouseId?: string; // si DeliveryType = WAREHOUSE

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PRItemDto)
  items!: PRItemDto[];
}
