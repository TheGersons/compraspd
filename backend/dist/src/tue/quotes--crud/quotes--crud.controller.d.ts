import { QuotesCrudService } from './quotes--crud.service';
import { CreateQuotesCrudDto } from './dto/create-quotes--crud.dto';
import { UpdateQuotesCrudDto } from './dto/update-quotes--crud.dto';
export declare class QuotesCrudController {
    private readonly quotesCrudService;
    constructor(quotesCrudService: QuotesCrudService);
    create(createQuotesCrudDto: CreateQuotesCrudDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateQuotesCrudDto: UpdateQuotesCrudDto): string;
    remove(id: string): string;
}
