import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService]
})
export class NotificacionModule {}