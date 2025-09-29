export class PrItemEntity {
    id!: string;
    description!: string;
    quantity!: string;
    unit?: string;
    requiredCurrency?: string;
    itemType?: string;
    sku?: string;
    barcode?: string;
}


export class PurchaseRequestEntity {
    id!: string;
    title!: string;
    description?: string;
    dueDate?: Date;
    status!: string;
    requesterId!: string;
    projectId?: string;
    locationId?: string;
    createdAt!: Date;
    updatedAt!: Date;
    items: PrItemEntity[] = [];
}