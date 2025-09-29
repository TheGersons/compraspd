import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuotesCrudService } from './quotes.service';
import { CreateQuotesCrudDto } from './dto/create-quotes.dto';
import { UpdateQuotesCrudDto } from './dto/update-quotes.dto';

@Controller('quotes--crud')
export class QuotesCrudController {
  constructor(private readonly quotesCrudService: QuotesCrudService) {}

  @Post()
  create(@Body() createQuotesCrudDto: CreateQuotesCrudDto) {
    return this.quotesCrudService.create(createQuotesCrudDto);
  }

  @Get()
  findAll() {
    return this.quotesCrudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesCrudService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotesCrudDto: UpdateQuotesCrudDto) {
    return this.quotesCrudService.update(+id, updateQuotesCrudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesCrudService.remove(+id);
  }
}
