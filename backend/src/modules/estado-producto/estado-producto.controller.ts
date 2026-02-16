import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EstadoProductoService } from './estado-producto.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateEstadoProductoDto,
  AvanzarEstadoDto,
  CambiarEstadoDto,
  ActualizarFechasDto,
  ActualizarFechasLimiteDto,
  ListEstadoProductoQueryDto,
  AprobarProductoDto,
  TimelineCompletoResponseDto,
} from './dto/estado-producto.dto';
import { UpdateFechaLimiteDto } from './dto/update-fecha-limite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type UserJwt = { sub: string; role?: string };

@ApiTags('Estado-Producto')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/estado-productos')
export class EstadoProductoController {
  constructor(private readonly service: EstadoProductoService) {}

  // ============================================
  // GESTIÓN DE ESTADOS
  // ============================================

  @Post()
  @ApiOperation({
    summary: 'Crear registro de estado de producto',
    description:
      'Se crea automáticamente al aprobar una cotización. Estado inicial: COTIZADO',
  })
  @ApiResponse({ status: 201, description: 'Estado de producto creado' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  create(@Body() dto: CreateEstadoProductoDto, @CurrentUser() user: UserJwt) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar estados de productos con filtros',
    description:
      'Permite filtrar por proyecto, cotización, SKU y nivel de criticidad',
  })
  @ApiQuery({ name: 'proyectoId', required: false })
  @ApiQuery({ name: 'cotizacionId', required: false })
  @ApiQuery({ name: 'sku', required: false })
  @ApiQuery({
    name: 'nivelCriticidad',
    required: false,
    enum: ['BAJO', 'MEDIO', 'ALTO'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de estados de productos' })
  list(
    @Query() filters: ListEstadoProductoQueryDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.list(filters, user);
  }

  @Get('criticos')
  @ApiOperation({
    summary: 'Obtener productos críticos',
    description: 'Productos con retrasos o alta criticidad (top 50)',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos críticos' })
  getCriticos(@CurrentUser() user: UserJwt) {
    return this.service.getCriticos(user);
  }

  @Get('por-proyecto/:proyectoId')
  @ApiOperation({
    summary: 'Obtener productos de un proyecto',
    description: 'Dashboard de todos los productos de un proyecto específico',
  })
  @ApiParam({ name: 'proyectoId', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Productos del proyecto' })
  getByProyecto(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.getByProyecto(proyectoId, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener estado de producto por ID',
    description: 'Incluye timeline completo, fechas, retrasos y criticidad',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Estado de producto encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.findById(id, user);
  }

  // ============================================
  // CAMBIOS DE ESTADO
  // ============================================

  @Patch(':id/avanzar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Avanzar al siguiente estado',
    description:
      'Avanza automáticamente al siguiente estado en la secuencia de las 10 etapas. Solo supervisores.',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Estado avanzado exitosamente' })
  @ApiResponse({ status: 400, description: 'Ya está en el último estado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  avanzarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AvanzarEstadoDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.avanzarEstado(id, dto, user);
  }

  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar a estado específico',
    description:
      'Permite cambiar a cualquier estado de las 10 etapas. Solo supervisores.',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.cambiarEstado(id, dto, user);
  }

  // ============================================
  // ACTUALIZACIÓN DE FECHAS
  // ============================================

  @Patch(':id/fechas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar fechas reales manualmente',
    description: 'Permite editar las fechas de cada etapa. Solo supervisores.',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Fechas actualizadas' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  actualizarFechas(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarFechasDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.actualizarFechas(id, dto, user);
  }

  @Patch(':id/fechas-limite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar fechas límite manualmente',
    description:
      'Permite ajustar las fechas límite de cada etapa. Solo supervisores.',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Fechas límite actualizadas' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  actualizarFechasLimite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarFechasLimiteDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.actualizarFechasLimite(id, dto, user);
  }

  // ============================================
  // TIMELINE Y SEGUIMIENTO
  // ============================================

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Obtener timeline completo',
    description:
      'Retorna el historial de todas las 10 etapas con fechas, límites y retrasos',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({
    status: 200,
    description: 'Timeline obtenido',
    type: TimelineCompletoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.getTimeline(id, user);
  }

  // ============================================
  // APROBACIÓN
  // ============================================

  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar producto por supervisor',
    description:
      'Marca el producto como aprobado o rechazado por el supervisor',
  })
  @ApiParam({ name: 'id', description: 'ID del estado de producto' })
  @ApiResponse({ status: 200, description: 'Producto aprobado/rechazado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (solo supervisores)' })
  aprobarProducto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AprobarProductoDto,
    @CurrentUser() user: UserJwt,
  ) {
    return this.service.aprobarProducto(id, dto, user);
  }

  /**
   * Obtener mis productos (para solicitantes)
   * Permite al usuario ver el estado de compra de sus productos aprobados
   */
  @Get('mis-productos')
  @ApiOperation({ summary: 'Obtener mis productos en compra (solicitante)' })
  async getMisProductos(@Request() req: any) {
    return this.service.getMisProductos(req.user);
  }

  /**
   * PATCH /estado-productos/:id/update-fecha-limite
   * Actualiza la fecha límite de un estado específico
   */
  @Patch(':id/update-fecha-limite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar fecha límite de un estado' })
  @ApiParam({ name: 'id', description: 'ID del estado producto' })
  @ApiResponse({
    status: 200,
    description: 'Fecha límite actualizada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async updateFechaLimite(
    @Param('id') id: string,
    @Body() dto: UpdateFechaLimiteDto,
  ) {
    return this.service.updateFechaLimite(
      id,
      dto.estado,
      new Date(dto.nuevaFechaLimite),
    );
  }
}
