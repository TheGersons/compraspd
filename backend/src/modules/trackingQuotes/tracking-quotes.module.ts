
//modulo de seguimiento de cotizaciones
import { Module } from '@nestjs/common';
import { TrackingQuotesService } from './tracking-quotes.service';
import { TrackingQuotesController } from './tracking-quotes.controller';
import { PrismaService } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaService],
  controllers: [TrackingQuotesController],
  providers: [TrackingQuotesService],
})
export class TrackingQuotesModule {}
