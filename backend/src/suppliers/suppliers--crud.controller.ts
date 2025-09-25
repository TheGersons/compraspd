import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuppliersCrudService } from './suppliers--crud.service';
import { CreateSuppliersCrudDto } from './dto/create-suppliers--crud.dto';
import { UpdateSuppliersCrudDto } from './dto/update-suppliers--crud.dto';

@Controller('suppliers--crud')
export class SuppliersCrudController {
  constructor(private readonly suppliersCrudService: SuppliersCrudService) {}

  @Post()
  create(@Body() createSuppliersCrudDto: CreateSuppliersCrudDto) {
    return this.suppliersCrudService.create(createSuppliersCrudDto);
  }

  @Get()
  findAll() {
    return this.suppliersCrudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersCrudService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuppliersCrudDto: UpdateSuppliersCrudDto) {
    return this.suppliersCrudService.update(+id, updateSuppliersCrudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersCrudService.remove(+id);
  }
}
