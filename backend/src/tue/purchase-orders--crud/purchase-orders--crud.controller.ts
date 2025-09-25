import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseOrdersCrudService } from './purchase-orders--crud.service';
import { CreatePurchaseOrdersCrudDto } from './dto/create-purchase-orders--crud.dto';
import { UpdatePurchaseOrdersCrudDto } from './dto/update-purchase-orders--crud.dto';

@Controller('purchase-orders--crud')
export class PurchaseOrdersCrudController {
  constructor(private readonly purchaseOrdersCrudService: PurchaseOrdersCrudService) {}

  @Post()
  create(@Body() createPurchaseOrdersCrudDto: CreatePurchaseOrdersCrudDto) {
    return this.purchaseOrdersCrudService.create(createPurchaseOrdersCrudDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrdersCrudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersCrudService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseOrdersCrudDto: UpdatePurchaseOrdersCrudDto) {
    return this.purchaseOrdersCrudService.update(+id, updatePurchaseOrdersCrudDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrdersCrudService.remove(+id);
  }
}
