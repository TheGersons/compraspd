import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrdersCrudDto } from './dto/create-purchase.dto';
import { UpdatePurchaseOrdersCrudDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchaseOrdersCrudService {
  create(createPurchaseOrdersCrudDto: CreatePurchaseOrdersCrudDto) {
    return 'This action adds a new purchaseOrdersCrud';
  }

  findAll() {
    return `This action returns all purchaseOrdersCrud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} purchaseOrdersCrud`;
  }

  update(id: number, updatePurchaseOrdersCrudDto: UpdatePurchaseOrdersCrudDto) {
    return `This action updates a #${id} purchaseOrdersCrud`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchaseOrdersCrud`;
  }
}
