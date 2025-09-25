import { PartialType } from '@nestjs/swagger';
import { CreateQuotesCrudDto } from './create-quotes.dto';

export class UpdateQuotesCrudDto extends PartialType(CreateQuotesCrudDto) {}
