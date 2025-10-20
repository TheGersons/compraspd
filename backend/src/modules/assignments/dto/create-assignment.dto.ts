import { IsOptional, isString, IsString } from 'class-validator';


export class CreateAssignmentDto {
    @IsString()
    entityType!: 'PurchaseRequest' | 'Quote' | 'PurchaseOrder' | 'Shipment';


    @IsString()
    entityId!: string;


    @IsOptional()
    @IsString()
    role?: string; // REVISOR|APROBADOR|COMPRADOR

    @IsString()
    assignedToId!: string;

    @IsOptional()
    progress?: number; // 0-100

    @IsOptional()
    followStatus?: 'IN_PROGRESS' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';

    @IsString()
    requesterId!: string;
}