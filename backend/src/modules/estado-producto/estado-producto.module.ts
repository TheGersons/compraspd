import { Module } from '@nestjs/common';
import { EstadoProductoController } from './estado-producto.controller';
import { EstadoProductoService } from './estado-producto.service';
import { SyncEstadoProductoController } from './sync-estado-producto.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EstadoProductoSyncService } from './estado-producto-sync.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    EstadoProductoController,
    SyncEstadoProductoController, // ← NUEVO
  ],
  providers: [
    EstadoProductoService,
    EstadoProductoSyncService, // ← NUEVO
  ],
  exports: [EstadoProductoService, EstadoProductoSyncService], // Exportar para usar en quotations
})
export class EstadoProductoModule {}