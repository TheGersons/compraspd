import { Module } from '@nestjs/common';
import { EstadoProductoController } from './estado-producto.controller';
import { EstadoProductoService } from './estado-producto.service';
import { SyncEstadoProductoController } from './sync-estado-producto.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EstadoProductoSyncService } from './estado-producto-sync.service';
import { MailService } from '../Mail/mail.service';
import { NotificacionService } from '../notifications/notificacion.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    EstadoProductoController,
    SyncEstadoProductoController,
  ],
  providers: [
    EstadoProductoService,
    EstadoProductoSyncService,
    MailService,
    NotificacionService,
  ],
  exports: [EstadoProductoService, EstadoProductoSyncService],
})
export class EstadoProductoModule {}