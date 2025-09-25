import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersCrudModule } from './suppliers/suppliers.module';
import { ProductsCrudModule } from './products/products.module';
import { QuotesCrudModule } from './quotes/quotes.module';
import { PurchaseOrdersCrudModule } from './purchases/purchase.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UsersModule, SuppliersCrudModule, ProductsCrudModule, QuotesCrudModule, PurchaseOrdersCrudModule],
})
export class AppModule {}
