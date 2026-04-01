import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificacionController],
  providers: [NotificacionService, NotificationsGateway],
  exports: [NotificacionService, NotificationsGateway],
})
export class NotificacionModule {}