import { Module } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestsService, PrismaClient],
  exports: [PurchaseRequestsService],
  imports: [PrismaModule],
})
export class PurchaseRequestsModule { }
