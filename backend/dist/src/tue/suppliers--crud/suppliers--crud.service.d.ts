import { CreateSuppliersCrudDto } from './dto/create-suppliers--crud.dto';
import { UpdateSuppliersCrudDto } from './dto/update-suppliers--crud.dto';
export declare class SuppliersCrudService {
    create(createSuppliersCrudDto: CreateSuppliersCrudDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSuppliersCrudDto: UpdateSuppliersCrudDto): string;
    remove(id: number): string;
}
