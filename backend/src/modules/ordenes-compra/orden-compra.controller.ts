import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrdenCompraService } from './orden-compra.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('OrdenesCompra')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/ordenes-compra')
export class OrdenCompraController {
  constructor(private readonly service: OrdenCompraService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva OC dentro de una cotización' })
  @ApiResponse({ status: 201, description: 'OC creada' })
  crear(
    @Body()
    body: {
      cotizacionId: string;
      nombre: string;
      estadoProductoIds: string[];
      numeroOC?: string;
    },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.crear(body, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar OCs de una cotización' })
  list(@Query('cotizacionId', ParseUUIDPipe) cotizacionId: string) {
    return this.service.listarPorCotizacion(cotizacionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre, número de OC o estado' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { nombre?: string; numeroOC?: string | null; estado?: string },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.actualizar(id, body, user);
  }

  @Patch(':id/mover-productos')
  @ApiOperation({ summary: 'Mover productos entre OCs de la misma cotización' })
  moverProductos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { estadoProductoIds: string[]; ordenDestinoId: string | null },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.moverProductos(id, body, user);
  }

  @Patch(':id/agregar-productos')
  @ApiOperation({
    summary: 'Agregar productos sin OC (cotización base) a una OC existente',
  })
  agregarProductosDesdeBase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { estadoProductoIds: string[] },
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.agregarProductosDesdeBase(id, body, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una OC (los productos quedan sin asignar)' })
  eliminar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserJwt) {
    return this.service.eliminar(id, user);
  }
}
