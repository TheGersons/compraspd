import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../Mail/mail.module';
import { NotificacionModule } from '../notifications/notificacion.module';

@Module({
  imports: [PrismaModule, MailModule, NotificacionModule],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}