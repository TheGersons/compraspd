import { ProductsCrudService } from './products--crud.service';
import { CreateProductsCrudDto } from './dto/create-products--crud.dto';
import { UpdateProductsCrudDto } from './dto/update-products--crud.dto';
export declare class ProductsCrudController {
    private readonly productsCrudService;
    constructor(productsCrudService: ProductsCrudService);
    create(createProductsCrudDto: CreateProductsCrudDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateProductsCrudDto: UpdateProductsCrudDto): string;
    remove(id: string): string;
}
