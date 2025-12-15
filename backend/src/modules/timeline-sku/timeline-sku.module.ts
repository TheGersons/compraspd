import { Module } from '@nestjs/common';
import { TimelineSKUController } from './timeline-sku.controller';
import { TimelineSKUService } from './timeline-sku.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimelineSKUController],
  providers: [TimelineSKUService],
  exports: [TimelineSKUService], // Exportar para usar en estado-producto
})
export class TimelineSKUModule {}