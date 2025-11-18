import { IsString } from 'class-validator';


export class EnsureThreadDto {
    @IsString()
    entityType!: 'PurchaseRequest' | 'Quote';


    @IsString()
    entityId!: string;
}