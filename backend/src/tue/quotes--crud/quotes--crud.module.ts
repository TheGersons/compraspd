import { Module } from '@nestjs/common';
import { QuotesCrudService } from './quotes--crud.service';
import { QuotesCrudController } from './quotes--crud.controller';

@Module({
  controllers: [QuotesCrudController],
  providers: [QuotesCrudService],
})
export class QuotesCrudModule {}
