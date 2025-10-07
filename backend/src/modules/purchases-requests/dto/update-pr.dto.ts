import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseRequestDto } from './create-pr.dto';

export class UpdatePurchaseRequestDto extends PartialType(CreatePurchaseRequestDto) {}
