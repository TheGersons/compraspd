import { Injectable } from '@nestjs/common';
import { CreateProductsCrudDto } from './dto/create-products--crud.dto';
import { UpdateProductsCrudDto } from './dto/update-products--crud.dto';

@Injectable()
export class ProductsCrudService {
  create(createProductsCrudDto: CreateProductsCrudDto) {
    return 'This action adds a new productsCrud';
  }

  findAll() {
    return `This action returns all productsCrud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productsCrud`;
  }

  update(id: number, updateProductsCrudDto: UpdateProductsCrudDto) {
    return `This action updates a #${id} productsCrud`;
  }

  remove(id: number) {
    return `This action removes a #${id} productsCrud`;
  }
}
