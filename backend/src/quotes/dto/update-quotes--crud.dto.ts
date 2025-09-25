import { PartialType } from '@nestjs/swagger';
import { CreateQuotesCrudDto } from './create-quotes--crud.dto';

export class UpdateQuotesCrudDto extends PartialType(CreateQuotesCrudDto) {}
