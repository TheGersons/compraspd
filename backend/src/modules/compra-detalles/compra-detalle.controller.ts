import { 
  Controller, 
  Get, 
  Param, 
  Patch,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompraDetalleService } from './compra-detalle.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CompraDetalleResponseDto, UpdateEstadoDetalleDto, UpdateFechasDetalleDto, TimelineResponseDto } from './dto/update-estado-detalle.dto';


type UserJwt = { sub: string; role?: string };

@ApiTags('Compra-Detalles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/compra-detalles')
export class CompraDetalleController {
  constructor(private readonly compraDetalleService: CompraDetalleService) {}

  @Get('compra/:compraId')
  @ApiOperation({ 
    summary: 'Listar detalles de una compra',
    description: 'Obtiene todos los items/detalles de una compra específica'
  })
  @ApiParam({ name: 'compraId', description: 'ID de la compra', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de detalles obtenida exitosamente',
    type: [CompraDetalleResponseDto]
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  listByCompra(
    @Param('compraId', ParseUUIDPipe) compraId: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraDetalleService.listByCompra(compraId, user);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener detalle específico',
    description: 'Obtiene información completa de un item de compra, incluyendo seguimiento'
  })
  @ApiParam({ name: 'id', description: 'ID del detalle de compra', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalle encontrado',
    type: CompraDetalleResponseDto
  })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraDetalleService.findById(id, user);
  }

  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar estado del detalle',
    description: 'Cambia el estado logístico del item (PRE-COMPRA → FABRICACION → FORS → CIF → COMPLETADO). Solo supervisores.'
  })
  @ApiParam({ name: 'id', description: 'ID del detalle de compra', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado exitosamente',
    type: CompraDetalleResponseDto
  })
  @ApiResponse({ status: 400, description: 'Estado inválido o compra ya completada' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  updateEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEstadoDetalleDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraDetalleService.updateEstado(id, dto, user);
  }

  @Patch(':id/fechas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar fechas manualmente',
    description: 'Permite editar las fechas del timeline de forma manual. Solo supervisores.'
  })
  @ApiParam({ name: 'id', description: 'ID del detalle de compra', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Fechas actualizadas exitosamente',
    type: CompraDetalleResponseDto
  })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  updateFechas(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFechasDetalleDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraDetalleService.updateFechas(id, dto, user);
  }

  @Get(':id/timeline')
  @ApiOperation({ 
    summary: 'Obtener timeline del detalle',
    description: 'Retorna el historial completo del proceso logístico del item'
  })
  @ApiParam({ name: 'id', description: 'ID del detalle de compra', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Timeline obtenido exitosamente',
    type: TimelineResponseDto
  })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.compraDetalleService.getTimeline(id, user);
  }
}