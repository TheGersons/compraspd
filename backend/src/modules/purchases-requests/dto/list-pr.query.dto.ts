import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';


export class ListPrQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    status?: string;
}