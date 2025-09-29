import { Injectable } from '@nestjs/common';
import { CreateQuotesCrudDto } from './dto/create-quotes.dto';
import { UpdateQuotesCrudDto } from './dto/update-quotes.dto';

@Injectable()
export class QuotesCrudService {
  create(createQuotesCrudDto: CreateQuotesCrudDto) {
    return 'This action adds a new quotesCrud';
  }

  findAll() {
    return `This action returns all quotesCrud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quotesCrud`;
  }

  update(id: number, updateQuotesCrudDto: UpdateQuotesCrudDto) {
    return `This action updates a #${id} quotesCrud`;
  }

  remove(id: number) {
    return `This action removes a #${id} quotesCrud`;
  }
}
