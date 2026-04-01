import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageService } from '../storage/storage.service';
import { MailModule } from '../Mail/mail.module';
import { NotificacionModule } from '../notifications/notificacion.module';

@Module({
  imports: [PrismaModule, MailModule, NotificacionModule],
  controllers: [MessagesController],
  providers: [MessagesService, StorageService],
  exports: [MessagesService],
})
export class MessagesModule {}
