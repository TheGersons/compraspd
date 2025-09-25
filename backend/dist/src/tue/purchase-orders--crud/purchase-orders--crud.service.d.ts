import { CreatePurchaseOrdersCrudDto } from './dto/create-purchase-orders--crud.dto';
import { UpdatePurchaseOrdersCrudDto } from './dto/update-purchase-orders--crud.dto';
export declare class PurchaseOrdersCrudService {
    create(createPurchaseOrdersCrudDto: CreatePurchaseOrdersCrudDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePurchaseOrdersCrudDto: UpdatePurchaseOrdersCrudDto): string;
    remove(id: number): string;
}
