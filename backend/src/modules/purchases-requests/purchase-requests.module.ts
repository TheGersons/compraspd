import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsController } from './purchase-requests.controller';


@Module({
  imports: [PrismaModule],
  providers: [PurchaseRequestsService],
  controllers: [PurchaseRequestsController],
})
export class PurchaseRequestsModule { }