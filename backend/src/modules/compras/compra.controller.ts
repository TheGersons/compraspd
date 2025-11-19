import { 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompraService } from './compra.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Compras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/compras')
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Post('from-cotizacion/:cotizacionId')
  @ApiOperation({ summary: 'Crear compra desde cotización aprobada' })
  @ApiResponse({ status: 201, description: 'Compra creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Cotización no está aprobada o faltan precios' })
  createFromCotizacion(
    @Param('cotizacionId', ParseUUIDPipe) cotizacionId: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraService.createFromCotizacion(cotizacionId, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar compras con filtros' })
  @ApiQuery({ name: 'estado', required: false, enum: ['PENDIENTE', 'COMPLETADA'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de compras obtenida' })
  list(
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser() user?: UserJwt
  ) {
    return this.compraService.list({
      estado,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined
    }, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener compra por ID con detalles completos' })
  @ApiResponse({ status: 200, description: 'Compra encontrada' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraService.findById(id, user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de la compra' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.compraService.getStats(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar compra como completada' })
  @ApiResponse({ status: 200, description: 'Compra completada exitosamente' })
  @ApiResponse({ status: 400, description: 'Hay items pendientes' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraService.complete(id, user);
  }
}