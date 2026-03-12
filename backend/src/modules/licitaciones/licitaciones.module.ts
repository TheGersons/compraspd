import { Module } from '@nestjs/common';
import { LicitacionesController } from './licitaciones.controller';
import { LicitacionesService } from './licitaciones.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicitacionesController],
  providers: [LicitacionesService],
  exports: [LicitacionesService],
})
export class LicitacionesModule {}
