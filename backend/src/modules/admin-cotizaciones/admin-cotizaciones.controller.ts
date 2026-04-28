import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminCotizacionesService } from './admin-cotizaciones.service';
import { UpdateCotizacionAdminDto } from './dto/update-cotizacion-admin.dto';
import { UpdateEstadoProductoAdminDto } from './dto/update-estado-producto-admin.dto';
import { DeleteCotizacionAdminDto } from './dto/delete-cotizacion-admin.dto';

type UserJwt = { sub: string; email?: string; role?: string };

@Controller('api/v1/admin/cotizaciones')
@UseGuards(AuthGuard('jwt'))
export class AdminCotizacionesController {
  constructor(private readonly service: AdminCotizacionesService) {}

  @Get()
  list(
    @CurrentUser() user: UserJwt,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('tipoCompra') tipoCompra?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listAll(user, {
      search,
      estado,
      tipoCompra,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('catalogos')
  catalogos(@CurrentUser() user: UserJwt) {
    return this.service.getCatalogosEdicion(user);
  }

  @Get(':id')
  detalle(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getDetalle(user, id);
  }

  @Get(':id/resumen-eliminacion')
  resumenEliminacion(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getResumenEliminacion(user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCotizacionAdminDto,
  ) {
    return this.service.updateCotizacion(user, id, dto);
  }

  @Patch('estado-producto/:id')
  updateEstadoProducto(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEstadoProductoAdminDto,
  ) {
    return this.service.updateEstadoProducto(user, id, dto);
  }

  @Delete(':id')
  delete(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeleteCotizacionAdminDto,
  ) {
    return this.service.deleteCompleto(user, id, dto);
  }
}
