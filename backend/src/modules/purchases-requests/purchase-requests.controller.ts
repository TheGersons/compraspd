import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { UpdatePurchaseRequestDto } from './dto/update-pr.dto';
import { ChangePrStatusDto } from './dto/change-pr-status.dto';



@Controller('api/v1/purchase-requests')
@UseGuards(AuthGuard('jwt'))
export class PurchaseRequestsController {
  constructor(private readonly service: PurchaseRequestsService) {}

  // Crear solicitud
  @Post()
  create(@CurrentUser() me: any, @Body() dto: CreatePurchaseRequestDto) {
    return this.service.create(dto, me);
  }

  // Listar las mías
  @Get()
  listMine(
    @CurrentUser() me: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listMine(me, Number(page ?? 1), Number(pageSize ?? 20));
  }

  // Obtener una concreta
  @Get(':id')
  getOne(@CurrentUser() me: any, @Param('id') id: string) {
    return this.service.getById(id, me);
  }

  // Actualizar (solo campos de cabecera; los items podrían manejarse con endpoints propios)
  @Patch(':id')
  update(@CurrentUser() me: any, @Param('id') id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.service.update(id, dto, me);
  }

  // Cambiar estado
  @Patch(':id/status')
  changeStatus(@CurrentUser() me: any, @Param('id') id: string, @Body() dto: ChangePrStatusDto) {
    return this.service.changeStatus(id, dto.status, me);
  }

  // Asignadas al supervisor actual
  @Get('supervisor/assigned/list')
  listAssigned(
    @CurrentUser() me: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listAssignedTo(me, Number(page ?? 1), Number(pageSize ?? 20));
  }
}
