import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePrDto } from './dto/create-pr.dto';
import { UpdatePrDto } from './dto/update-pr.dto';
import { ListPrQueryDto } from './dto/list-pr.query.dto';
import { ChangePrStatusDto } from './dto/change-pr-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@ApiTags('Solicitudes de Compra')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/purchase-requests')
export class PurchaseRequestsController {
  constructor(private readonly svc: PurchaseRequestsService) { }


  private pg(dto: ListPrQueryDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    return { skip: (page - 1) * pageSize, take: pageSize, q: dto.q, status: dto.status };
  }


  @Post()
  create(@CurrentUser() me: any, @Body() dto: CreatePrDto) {
    return this.svc.create(me?.sub, dto);
  }


  @Get()
  listMine(@CurrentUser() me: any, @Query() dto: ListPrQueryDto) {
    return this.svc.findMine(me?.sub, this.pg(dto));
  }


  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrDto) {
    return this.svc.update(id, dto);
  }


  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangePrStatusDto) {
    return this.svc.changeStatus(id, dto.status);
  }
}