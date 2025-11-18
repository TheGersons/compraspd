import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Query, 
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuotationsService } from './quotations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import * as changeStatusDto from './dto/change-status.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de cotizaciones
 * Endpoints:
 * - POST /quotations - Crear cotización
 * - GET /quotations - Listar mis cotizaciones
 * - GET /quotations/all - Listar todas (admin/supervisor)
 * - GET /quotations/:id - Obtener una cotización
 * - PATCH /quotations/:id - Actualizar cotización
 * - PATCH /quotations/:id/status - Cambiar estado
 */
@Controller('api/v1/quotations')
@UseGuards(AuthGuard('jwt'))
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  /**
   * POST /api/v1/quotations
   * Crea una nueva cotización con sus items
   */
  @Post()
  create(
    @Body() dto: CreateQuotationDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.create(dto, user);
  }

  /**
   * GET /api/v1/quotations
   * Lista las cotizaciones del usuario autenticado
   * Query params: page, pageSize
   */
  @Get()
  listMine(
    @CurrentUser() user: UserJwt,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listMine(
      user,
      Number(page || 1),
      Number(pageSize || 20)
    );
  }

  /**
   * GET /api/v1/quotations/all
   * Lista TODAS las cotizaciones (solo supervisores/admin)
   * Query params: estado, tipoId, proyectoId, page, pageSize
   */
  @Get('all')
  listAll(
    @CurrentUser() user: UserJwt,
    @Query('estado') estado?: changeStatusDto.QuotationStatus,
    @Query('tipoId') tipoId?: string,
    @Query('proyectoId') proyectoId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listAll(user, {
      estado,
      tipoId,
      proyectoId,
      page: Number(page || 1),
      pageSize: Number(pageSize || 20),
    });
  }

  /**
   * GET /api/v1/quotations/:id
   * Obtiene una cotización específica con todos sus detalles
   */
  @Get(':id')
  getOne(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.service.getById(id, user);
  }

  /**
   * PATCH /api/v1/quotations/:id
   * Actualiza los datos de cabecera de una cotización
   * No modifica items (usar endpoint de quotation-details)
   */
  @Patch(':id')
  update(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto
  ) {
    return this.service.update(id, dto, user);
  }

  /**
   * PATCH /api/v1/quotations/:id/status
   * Cambia el estado de una cotización
   * Valida transiciones y permisos
   */
  @Patch(':id/status')
  changeStatus(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: changeStatusDto.ChangeQuotationStatusDto
  ) {
    return this.service.changeStatus(id, dto.estado, user);
  }
}