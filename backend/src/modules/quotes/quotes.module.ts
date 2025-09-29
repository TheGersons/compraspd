import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';


@Module({
  imports: [PrismaModule],
  providers: [QuotesService],
  controllers: [QuotesController],
})
export class QuotesModule { }