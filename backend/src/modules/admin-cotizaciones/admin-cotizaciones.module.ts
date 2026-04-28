import { Module } from '@nestjs/common';
import { AdminCotizacionesController } from './admin-cotizaciones.controller';
import { AdminCotizacionesService } from './admin-cotizaciones.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminCotizacionesController],
  providers: [AdminCotizacionesService],
})
export class AdminCotizacionesModule {}
