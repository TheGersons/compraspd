import { Module } from '@nestjs/common';
import { QuotesCrudService } from './quotes.service';
import { QuotesCrudController } from './quotes.controller';

@Module({
  controllers: [QuotesCrudController],
  providers: [QuotesCrudService],
})
export class QuotesCrudModule {}
