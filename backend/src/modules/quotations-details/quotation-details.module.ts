import { Module } from '@nestjs/common';
import { QuotationDetailsController } from './quotation-details.controller';
import { QuotationDetailsService } from './quotation-details.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuotationDetailsController],
  providers: [QuotationDetailsService],
  exports: [QuotationDetailsService], // Exportar para usar en otros módulos
})
export class QuotationDetailsModule {}