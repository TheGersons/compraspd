import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersCrudModule } from './tue/suppliers--crud/suppliers--crud.module';
import { ProductsCrudModule } from './tue/products--crud/products--crud.module';
import { QuotesCrudModule } from './tue/quotes--crud/quotes--crud.module';
import { PurchaseOrdersCrudModule } from './tue/purchase-orders--crud/purchase-orders--crud.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UsersModule, SuppliersCrudModule, ProductsCrudModule, QuotesCrudModule, PurchaseOrdersCrudModule],
})
export class AppModule {}
