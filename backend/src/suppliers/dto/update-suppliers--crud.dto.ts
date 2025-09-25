import { PartialType } from '@nestjs/swagger';
import { CreateSuppliersCrudDto } from './create-suppliers--crud.dto';

export class UpdateSuppliersCrudDto extends PartialType(CreateSuppliersCrudDto) {}
