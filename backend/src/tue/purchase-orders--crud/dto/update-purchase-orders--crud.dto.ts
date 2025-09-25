import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrdersCrudDto } from './create-purchase-orders--crud.dto';

export class UpdatePurchaseOrdersCrudDto extends PartialType(CreatePurchaseOrdersCrudDto) {}
