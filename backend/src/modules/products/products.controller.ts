import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsCrudService } from './products.service';
import { CreateProductsCrudDto } from './dto/create-products.dto';
import { UpdateProductsCrudDto } from './dto/update-products.dto';

@Controller('products--crud')
export class ProductsCrudController {
  constructor(private readonly productsCrudService: ProductsCrudService) {}

  @Post()
  create(@Body() createProductsCrudDto: CreateProductsCrudDto) {
    return this.productsCrudService.create(createProductsCrudDto);
  }

  @Get()
  findAll() {
    return this.productsCrudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsCrudService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductsCrudDto: UpdateProductsCrudDto) {
    return this.productsCrudService.update(+id, updateProductsCrudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsCrudService.remove(+id);
  }
}
