import { Module } from '@nestjs/common';
import { EstadoProductoController } from './estado-producto.controller';
import { EstadoProductoService } from './estado-producto.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstadoProductoController],
  providers: [EstadoProductoService],
  exports: [EstadoProductoService], // Exportar para usar en quotations al aprobar
})
export class EstadoProductoModule {}