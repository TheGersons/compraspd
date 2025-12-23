import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EstadoProductoModule } from '../estado-producto/estado-producto.module';

@Module({
  imports: [PrismaModule, EstadoProductoModule],
  controllers: [PreciosController],
  providers: [PreciosService],
  exports: [PreciosService],
})
export class PreciosModule {}