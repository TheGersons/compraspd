import { PartialType } from '@nestjs/swagger';
import { CreateProductsCrudDto } from './create-products--crud.dto';

export class UpdateProductsCrudDto extends PartialType(CreateProductsCrudDto) {}
