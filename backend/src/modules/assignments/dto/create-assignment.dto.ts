import { IsOptional, IsString } from 'class-validator';


export class CreateAssignmentDto {
    @IsString()
    entityType!: 'PurchaseRequest' | 'Quote' | 'PurchaseOrder' | 'Shipment';


    @IsString()
    entityId!: string;


    @IsString()
    assigneeId!: string;


    @IsOptional()
    @IsString()
    role?: string; // REVISOR|APROBADOR|COMPRADOR
}