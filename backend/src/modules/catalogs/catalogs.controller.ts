import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CatalogsService } from './catalogs.service';
import { ListQueryDto } from './dto/list.query.dto';


@ApiTags('Catálogos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/catalogs')
export class CatalogsController {
    constructor(private readonly svc: CatalogsService) { }


    private pg(dto: ListQueryDto) {
        const page = dto.page ?? 1;
        const pageSize = dto.pageSize ?? 20;
        return { skip: (page - 1) * pageSize, take: pageSize, q: dto.q };
    }


    @Get('departments')
    departments(@Query() dto: ListQueryDto) {
        return this.svc.listDepartments(this.pg(dto));
    }


    @Get('clients')
    clients(@Query() dto: ListQueryDto) {
        return this.svc.listClients(this.pg(dto));
    }


    @Get('projects')
    projects(@Query() dto: ListQueryDto) {
        return this.svc.listProjects(this.pg(dto));
    }


    @Get('locations')
    locations(@Query() dto: ListQueryDto) {
        return this.svc.listLocations(this.pg(dto));
    }


    @Get('suppliers')
    suppliers(@Query() dto: ListQueryDto) {
        return this.svc.listSuppliers(this.pg(dto));
    }


    @Get('products')
    products(@Query() dto: ListQueryDto) {
        return this.svc.listProducts(this.pg(dto));
    }
}