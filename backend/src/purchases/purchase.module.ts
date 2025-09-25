import { Module } from '@nestjs/common';
import { PurchaseOrdersCrudService } from './purchase.service';
import { PurchaseOrdersCrudController } from './purchase.controller';

@Module({
  controllers: [PurchaseOrdersCrudController],
  providers: [PurchaseOrdersCrudService],
})
export class PurchaseOrdersCrudModule {}
