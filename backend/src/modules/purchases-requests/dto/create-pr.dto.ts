import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { PRItemDto } from './pr-item.dto';

export enum ProcurementType { NATIONAL = 'NATIONAL', INTERNATIONAL = 'INTERNATIONAL' }
export enum DeliveryType { WAREHOUSE = 'WAREHOUSE', PROJECT = 'PROJECT' }

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
  @IsUUID()
  projectId?: string;

  // Si se entrega a un proyecto concreto, podemos inferir location según tus reglas de negocio después.
  @IsOptional()
  @IsUUID()
  locationId?: string;

  // Extras (opcionales pero ya contemplados en tu modelo extendido)
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
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
  @IsUUID()
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
