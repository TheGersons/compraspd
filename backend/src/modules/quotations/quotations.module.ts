import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService], // Exportar para usar en otros módulos
})
export class QuotationsModule {}