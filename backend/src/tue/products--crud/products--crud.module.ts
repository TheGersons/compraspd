import { Module } from '@nestjs/common';
import { ProductsCrudService } from './products--crud.service';
import { ProductsCrudController } from './products--crud.controller';

@Module({
  controllers: [ProductsCrudController],
  providers: [ProductsCrudService],
})
export class ProductsCrudModule {}
