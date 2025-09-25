import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrdersCrudDto } from './create-purchase.dto';

export class UpdatePurchaseOrdersCrudDto extends PartialType(CreatePurchaseOrdersCrudDto) {}
