import { Module } from '@nestjs/common';
import { ProductsCrudService } from './products.service';
import { ProductsCrudController } from './products.controller';

@Module({
  controllers: [ProductsCrudController],
  providers: [ProductsCrudService],
})
export class ProductsCrudModule {}
