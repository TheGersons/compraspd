import { Module } from '@nestjs/common';
import { PurchaseOrdersCrudService } from './purchase-orders--crud.service';
import { PurchaseOrdersCrudController } from './purchase-orders--crud.controller';

@Module({
  controllers: [PurchaseOrdersCrudController],
  providers: [PurchaseOrdersCrudService],
})
export class PurchaseOrdersCrudModule {}
