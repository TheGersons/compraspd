import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrdersCrudDto } from './create-pr.dto';

export class UpdatePurchaseOrdersCrudDto extends PartialType(CreatePurchaseOrdersCrudDto) {}
