import { Module } from '@nestjs/common';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeguimientoController],
  providers: [SeguimientoService],
  exports: [SeguimientoService]
})
export class SeguimientoModule {}