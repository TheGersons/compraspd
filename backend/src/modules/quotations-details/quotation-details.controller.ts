import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post, 
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuotationDetailsService } from './quotation-details.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuotationDetailDto } from './dto/create-detail.dto';
import { UpdateQuotationDetailDto } from './dto/update-detail.dto';
import { BulkUpdateDetailsDto } from './dto/bulk-update-details.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de detalles de cotización (items)
 * 
 * Endpoints:
 * - POST /quotation-details - Crear un nuevo item
 * - GET /quotation-details/by-quotation/:cotizacionId - Listar items de una cotización
 * - GET /quotation-details/:id - Obtener un item específico
 * - PATCH /quotation-details/:id - Actualizar un item
 * - DELETE /quotation-details/:id - Eliminar un item
 * - POST /quotation-details/bulk/:cotizacionId - Actualización masiva
 */
@Controller('api/v1/quotation-details')
@UseGuards(AuthGuard('jwt'))
export class QuotationDetailsController {
  constructor(private readonly service: QuotationDetailsService) {}

  /**
   * POST /api/v1/quotation-details
   * Crea un nuevo detalle/item en una cotización
   */
  @Post()
  create(
    @Body() dto: CreateQuotationDetailDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.create(dto, user);
  }

  /**
   * GET /api/v1/quotation-details/by-quotation/:cotizacionId
   * Lista todos los items de una cotización específica
   * Incluye información de precios/ofertas si existen
   */
  @Get('by-quotation/:cotizacionId')
  listByCotizacion(
    @Param('cotizacionId', ParseUUIDPipe) cotizacionId: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.listByCotizacion(cotizacionId, user);
  }

  /**
   * GET /api/v1/quotation-details/:id
   * Obtiene un detalle específico con toda su información
   * Incluye precios y ofertas de proveedores
   */
  @Get(':id')
  getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.getById(id, user);
  }

  /**
   * PATCH /api/v1/quotation-details/:id
   * Actualiza un detalle existente
   * Solo campos proporcionados en el body serán actualizados
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDetailDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.update(id, dto, user);
  }

  /**
   * DELETE /api/v1/quotation-details/:id
   * Elimina un detalle de cotización
   * No se puede eliminar si ya tiene ofertas de proveedores asociadas
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.delete(id, user);
  }

  /**
   * POST /api/v1/quotation-details/bulk/:cotizacionId
   * Actualización masiva de items de una cotización
   * Permite crear, actualizar y eliminar múltiples items en una sola operación
   * 
   * Body ejemplo:
   * {
   *   "items": [
   *     { "id": "uuid-existente", "cantidad": 10 },
   *     { "descripcionProducto": "Nuevo item", "cantidad": 5, "tipoUnidad": "UNIDAD" }
   *   ],
   *   "deleteIds": ["uuid-a-eliminar"]
   * }
   */
  @Post('bulk/:cotizacionId')
  bulkUpdate(
    @Param('cotizacionId', ParseUUIDPipe) cotizacionId: string,
    @Body() dto: BulkUpdateDetailsDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.bulkUpdate(cotizacionId, dto, user);
  }
}