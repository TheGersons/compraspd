import { Injectable } from '@nestjs/common';
import { CreateSuppliersCrudDto } from './dto/create-suppliers.dto';
import { UpdateSuppliersCrudDto } from './dto/update-suppliers.dto';

@Injectable()
export class SuppliersCrudService {
  create(createSuppliersCrudDto: CreateSuppliersCrudDto) {
    return 'This action adds a new suppliersCrud';
  }

  findAll() {
    return `This action returns all suppliersCrud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suppliersCrud`;
  }

  update(id: number, updateSuppliersCrudDto: UpdateSuppliersCrudDto) {
    return `This action updates a #${id} suppliersCrud`;
  }

  remove(id: number) {
    return `This action removes a #${id} suppliersCrud`;
  }
}
