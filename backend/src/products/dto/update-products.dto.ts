import { PartialType } from '@nestjs/swagger';
import { CreateProductsCrudDto } from './create-products.dto';

export class UpdateProductsCrudDto extends PartialType(CreateProductsCrudDto) {}
