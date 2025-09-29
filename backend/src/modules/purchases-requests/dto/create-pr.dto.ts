import { IsArray, IsEnum, IsISO8601, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType, ProcurementType } from '../entities/purchase-request.entity';
export class CreatePrDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() clientId?: string;

  @IsEnum(ProcurementType) procurement: ProcurementType;
  @IsOptional() @IsISO8601() quoteDeadline?: string;

  @IsEnum(DeliveryType) deliveryType: DeliveryType;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() projectId?: string;

  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() comment?: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PRItemDto)
  items: PRItemDto[];
}
