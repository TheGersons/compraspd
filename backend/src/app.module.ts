import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersCrudModule } from './modules/suppliers/suppliers.module';
import { ProductsCrudModule } from './modules/products/products.module';
import { QuotesCrudModule } from './modules/quotes/quotes.module';
import { PurchaseOrdersCrudModule } from './modules/purchases-requests/purchase-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SuppliersCrudModule,
    ProductsCrudModule,
    QuotesCrudModule,
    PurchaseOrdersCrudModule,
  ],
})
export class AppModule {}
