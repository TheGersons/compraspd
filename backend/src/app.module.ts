import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersCrudModule } from './modules/suppliers/suppliers.module';
import { ProductsCrudModule } from './modules/products/products.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { OffersModule } from './modules/offers/offers.module';
import { PurchaseRequestsModule } from './modules/purchases-requests/purchase-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SuppliersCrudModule,
    ProductsCrudModule,
    AssignmentsModule,
    AttachmentsModule,
    CatalogsModule,
    OffersModule,
    PurchaseRequestsModule,
  ],
})
export class AppModule { }
