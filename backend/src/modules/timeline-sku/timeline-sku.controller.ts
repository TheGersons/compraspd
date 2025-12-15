import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TimelineSKUService } from './timeline-sku.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateTimelineSKUDto,
  UpdateTimelineSKUDto,
  ListTimelineSKUQueryDto,
  TimelineSKUResponseDto
} from './dto/timeline-sku.dto';

type UserJwt = { sub: string; role?: string };

@ApiTags('Timeline-SKU')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/timeline-sku')
export class TimelineSKUController {
  constructor(private readonly service: TimelineSKUService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear configuración de timeline para un SKU',
    description: 'Define los tiempos estimados entre cada proceso para un SKU específico. Solo supervisores.'
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración creada exitosamente',
    type: TimelineSKUResponseDto
  })
  @ApiResponse({ status: 400, description: 'Ya existe configuración para este SKU' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  create(
    @Body() dto: CreateTimelineSKUDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar configuraciones de timeline',
    description: 'Obtiene todas las configuraciones con filtros opcionales'
  })
  @ApiQuery({ name: 'medioTransporte', required: false, enum: ['MARITIMO', 'TERRESTRE', 'AEREO'] })
  @ApiQuery({ name: 'paisOrigenId', required: false })
  @ApiQuery({ name: 'sku', required: false, description: 'Búsqueda parcial por SKU' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones',
    type: [TimelineSKUResponseDto]
  })
  list(
    @Query() filters: ListTimelineSKUQueryDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.list(filters, user);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de configuraciones',
    description: 'Resumen de configuraciones y promedios de días'
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getStats(@CurrentUser() user: UserJwt) {
    return this.service.getStats(user);
  }

  @Get('by-sku/:sku')
  @ApiOperation({
    summary: 'Obtener timeline de un SKU específico',
    description: 'Busca la configuración por SKU exacto'
  })
  @ApiParam({ name: 'sku', description: 'SKU del producto', example: 'CABLE-HDMI-001' })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: TimelineSKUResponseDto
  })
  @ApiResponse({ status: 404, description: 'No se encontró configuración para este SKU' })
  findBySKU(
    @Param('sku') sku: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.findBySKU(sku, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener timeline por ID',
    description: 'Busca la configuración por ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la configuración' })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: TimelineSKUResponseDto
  })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findById(
    @Param('id') id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.findById(id, user);
  }

  @Patch(':sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de timeline',
    description: 'Modifica los tiempos estimados de un SKU. Solo supervisores.'
  })
  @ApiParam({ name: 'sku', description: 'SKU del producto' })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada',
    type: TimelineSKUResponseDto
  })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  update(
    @Param('sku') sku: string,
    @Body() dto: UpdateTimelineSKUDto,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.update(sku, dto, user);
  }

  @Delete(':sku')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar configuración de timeline',
    description: 'Elimina la configuración de un SKU. Solo supervisores.'
  })
  @ApiParam({ name: 'sku', description: 'SKU del producto' })
  @ApiResponse({ status: 200, description: 'Configuración eliminada' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  delete(
    @Param('sku') sku: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.delete(sku, user);
  }
}