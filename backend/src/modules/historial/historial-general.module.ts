// src/historial-general/historial-general.module.ts
import { Module } from '@nestjs/common';
import { HistorialGeneralController } from './historial-general.controller';
import { HistorialGeneralService } from './historial-general.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HistorialGeneralController],
  providers: [HistorialGeneralService],
  exports: [HistorialGeneralService],
})
export class HistorialGeneralModule {}