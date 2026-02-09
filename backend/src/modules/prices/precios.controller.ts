import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PreciosService } from './precios.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';
import { EstadoProductoSyncService } from '../estado-producto/estado-producto-sync.service';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de precios/ofertas de proveedores
 * Los proveedores envían precios para cada item de cotización
 */
@ApiTags('Precios (Ofertas)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/precios')
export class PreciosController {
  constructor(private readonly preciosService: PreciosService, private readonly estadoProductoSyncService: EstadoProductoSyncService,) { }

  /**
   * POST /api/v1/precios
   * Registrar oferta de proveedor para un item
   */
  @Post()
  @ApiOperation({ summary: 'Registrar oferta de proveedor' })
  @ApiResponse({ status: 201, description: 'Oferta creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo supervisores pueden registrar ofertas' })
  create(
    @Body() dto: CreatePrecioDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.create(dto, user);
  }

  /**
   * GET /api/v1/precios/detalle/:cotizacionDetalleId
   * Listar todas las ofertas de un item específico
   */
  @Get('detalle/:cotizacionDetalleId')
  @ApiOperation({ summary: 'Listar ofertas de un item' })
  @ApiResponse({ status: 200, description: 'Lista de ofertas obtenida' })
  listByDetalle(
    @Param('cotizacionDetalleId', ParseUUIDPipe) cotizacionDetalleId: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.listByDetalle(cotizacionDetalleId, user);
  }

  /**
   * GET /api/v1/precios/comparativa/:cotizacionId
   * Obtener comparativa de precios de toda la cotización
   */
  @Get('comparativa/:cotizacionId')
  @ApiOperation({ summary: 'Comparativa de precios por cotización' })
  @ApiResponse({ status: 200, description: 'Comparativa obtenida' })
  getComparativa(
    @Param('cotizacionId', ParseUUIDPipe) cotizacionId: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.getComparativaByCotizacion(cotizacionId, user);
  }

  /**
   * GET /api/v1/precios/:id
   * Obtener una oferta específica
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener oferta por ID' })
  @ApiResponse({ status: 200, description: 'Oferta encontrada' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.findById(id, user);
  }

  /**
   * PATCH /api/v1/precios/:id
   * Actualizar una oferta
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar oferta' })
  @ApiResponse({ status: 200, description: 'Oferta actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrecioDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.update(id, dto, user);
  }

  /**
   * POST /api/v1/precios/:id/select
   * Seleccionar oferta ganadora
   */
  @Post(':id/select')
  @ApiOperation({ summary: 'Seleccionar oferta ganadora' })
  @ApiResponse({ status: 200, description: 'Oferta seleccionada' })
  async selectOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    const resultado = this.preciosService.selectOffer(id, user);


    return resultado;

  }

  /**
   * DELETE /api/v1/precios/:id
   * Eliminar una oferta
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar oferta' })
  @ApiResponse({ status: 200, description: 'Oferta eliminada' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.delete(id, user);
  }

  /**
   * PATCH /api/v1/precios/:id/solicitar-descuento
   * Solicita descuento para un precio
   */
  @Patch(':id/solicitar-descuento')
  @ApiOperation({ summary: 'Solicitar descuento para un precio' })
  @ApiResponse({ status: 200, description: 'Descuento solicitado' })
  solicitarDescuento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { comprobanteDescuento: string },
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.solicitarDescuento(id, dto.comprobanteDescuento, user);
  }

  /**
   * PATCH /api/v1/precios/:id/resultado-descuento
   * Agrega resultado de solicitud de descuento
   */
  @Patch(':id/resultado-descuento')
  @ApiOperation({ summary: 'Agregar resultado de descuento' })
  @ApiResponse({ status: 200, description: 'Resultado agregado' })
  resultadoDescuento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { precioDescuento: number },
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.resultadoDescuento(id, dto.precioDescuento, user);
  }

  /**
 * POST /api/v1/precios/:id/deselect
 * Deseleccionar una oferta
 */
  @Post(':id/deselect')
  @ApiOperation({ summary: 'Deseleccionar oferta' })
  @ApiResponse({ status: 200, description: 'Oferta deseleccionada' })
  deselectOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.preciosService.deselectOffer(id, user);
  }
}