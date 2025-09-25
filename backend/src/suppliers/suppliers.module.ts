import { Module } from '@nestjs/common';
import { SuppliersCrudService } from './suppliers.service';
import { SuppliersCrudController } from './suppliers.controller';

@Module({
  controllers: [SuppliersCrudController],
  providers: [SuppliersCrudService],
})
export class SuppliersCrudModule {}
