import { Module } from '@nestjs/common';
import { PurchaseOrdersCrudService } from './purchase-requests.service';
import { PurchaseOrdersCrudController } from './purchase-requests.controller';

@Module({
  controllers: [PurchaseOrdersCrudController],
  providers: [PurchaseOrdersCrudService],
})
export class PurchaseOrdersCrudModule {}
