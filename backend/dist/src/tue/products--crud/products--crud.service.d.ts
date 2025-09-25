import { CreateProductsCrudDto } from './dto/create-products--crud.dto';
import { UpdateProductsCrudDto } from './dto/update-products--crud.dto';
export declare class ProductsCrudService {
    create(createProductsCrudDto: CreateProductsCrudDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateProductsCrudDto: UpdateProductsCrudDto): string;
    remove(id: number): string;
}
