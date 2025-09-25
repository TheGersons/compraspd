import { CreateQuotesCrudDto } from './dto/create-quotes--crud.dto';
import { UpdateQuotesCrudDto } from './dto/update-quotes--crud.dto';
export declare class QuotesCrudService {
    create(createQuotesCrudDto: CreateQuotesCrudDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateQuotesCrudDto: UpdateQuotesCrudDto): string;
    remove(id: number): string;
}
