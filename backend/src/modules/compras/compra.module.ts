import { Module } from '@nestjs/common';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Compras
 * Gestiona la creación y seguimiento de compras generadas desde cotizaciones aprobadas
 */
@Module({
  imports: [PrismaModule],
  controllers: [CompraController],
  providers: [CompraService],
  exports: [CompraService]
})
export class CompraModule {}