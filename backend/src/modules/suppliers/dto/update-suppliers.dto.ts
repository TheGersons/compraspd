import { PartialType } from '@nestjs/swagger';
import { CreateSuppliersCrudDto } from './create-suppliers.dto';

export class UpdateSuppliersCrudDto extends PartialType(CreateSuppliersCrudDto) {}
