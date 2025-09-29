import { IsOptional, IsString } from 'class-validator';


export class UploadAttachmentDto {
    @IsString()
    entityType!: string; // PurchaseRequest|Quote|QuoteOffer|PurchaseOrder|Message


    @IsString()
    entityId!: string;


    @IsOptional()
    @IsString()
    fileName?: string;
}