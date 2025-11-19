import { Module } from '@nestjs/common';
import { CompraDetalleService } from './compra-detalle.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CompraDetalleController } from './compra-detalle.controller';

/**
 * Módulo de Compra-Detalles
 * Gestiona el tracking logístico de cada item de una compra
 * Estados: PRE-COMPRA → FABRICACION → FORS → CIF → COMPLETADO
 */
@Module({
  imports: [PrismaModule],
  controllers: [CompraDetalleController],
  providers: [CompraDetalleService],
  exports: [CompraDetalleService]
})
export class CompraDetalleModule {}