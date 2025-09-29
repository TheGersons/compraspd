import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProcurementType, DeliveryType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListPrQueryDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsEnum(DeliveryType) deliveryType?: DeliveryType;
  @IsOptional() @IsEnum(ProcurementType) procurement?: ProcurementType;
  @IsOptional() from?: string; // ISO
  @IsOptional() to?: string;   // ISO
}
