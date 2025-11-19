import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
//import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';

//import { PurchaseRequestsModule } from './modules/purchases-requests/purchase-requests.module';
//import { FollowupsModule } from './modules/followups/followups.module';

import { DepartmentsModule } from './modules/departments/departments.module';
import { RolesModule } from './modules/Roles/roles.module';
import { MessagesModule } from './modules/messages/messages.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { QuotationDetailsModule } from './modules/quotations-details/quotation-details.module';




@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MessagesModule,
    PermissionsModule,
    QuotationsModule,
    QuotationDetailsModule,
    // AssignmentsModule,
    AttachmentsModule,
    //CatalogsModule,
    // PurchaseRequestsModule,
    //FollowupsModule,
    RolesModule,
    DepartmentsModule,

  ],
})
export class AppModule { }
