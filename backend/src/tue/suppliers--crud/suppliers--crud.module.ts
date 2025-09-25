import { Module } from '@nestjs/common';
import { SuppliersCrudService } from './suppliers--crud.service';
import { SuppliersCrudController } from './suppliers--crud.controller';

@Module({
  controllers: [SuppliersCrudController],
  providers: [SuppliersCrudService],
})
export class SuppliersCrudModule {}
