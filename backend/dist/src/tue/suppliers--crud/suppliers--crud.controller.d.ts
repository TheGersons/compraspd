import { SuppliersCrudService } from './suppliers--crud.service';
import { CreateSuppliersCrudDto } from './dto/create-suppliers--crud.dto';
import { UpdateSuppliersCrudDto } from './dto/update-suppliers--crud.dto';
export declare class SuppliersCrudController {
    private readonly suppliersCrudService;
    constructor(suppliersCrudService: SuppliersCrudService);
    create(createSuppliersCrudDto: CreateSuppliersCrudDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateSuppliersCrudDto: UpdateSuppliersCrudDto): string;
    remove(id: string): string;
}
