import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersCrudModule } from './suppliers/suppliers--crud.module';
import { ProductsCrudModule } from './products/products--crud.module';
import { QuotesCrudModule } from './quotes/quotes--crud.module';
import { PurchaseOrdersCrudModule } from './purchases/purchase-orders--crud.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UsersModule, SuppliersCrudModule, ProductsCrudModule, QuotesCrudModule, PurchaseOrdersCrudModule],
})
export class AppModule {}
