import { PurchaseOrdersCrudService } from './purchase-orders--crud.service';
import { CreatePurchaseOrdersCrudDto } from './dto/create-purchase-orders--crud.dto';
import { UpdatePurchaseOrdersCrudDto } from './dto/update-purchase-orders--crud.dto';
export declare class PurchaseOrdersCrudController {
    private readonly purchaseOrdersCrudService;
    constructor(purchaseOrdersCrudService: PurchaseOrdersCrudService);
    create(createPurchaseOrdersCrudDto: CreatePurchaseOrdersCrudDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePurchaseOrdersCrudDto: UpdatePurchaseOrdersCrudDto): string;
    remove(id: string): string;
}
