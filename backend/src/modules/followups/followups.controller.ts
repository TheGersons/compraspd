import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FollowUpsService } from './followups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AprobarProductosDto } from './dto/aprobar-productos.dto';
import { ConfigurarCotizacionDto } from './dto/configurar-cotizacion.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de seguimiento de cotizaciones (FollowUps)
 *
 * Funcionalidades:
 * - Listar cotizaciones pendientes
 * - Configurar timeline de productos
 * - Aprobar/desaprobar productos
 * - Ver historial de cambios
 * - Gestionar asignación de supervisores
 *
 * Solo accesible para usuarios con rol Supervisor
 */
@ApiTags('FollowUps - Seguimiento de Cotizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/followups')
export class FollowUpsController {
  constructor(private readonly followupsService: FollowUpsService) {}

  /**
   * GET /api/v1/followups
   * Lista cotizaciones pendientes de configuración/aprobación
   */
  @Get()
  @ApiOperation({
    summary: 'Listar cotizaciones pendientes',
    description:
      'Obtiene lista de cotizaciones que requieren configuración o aprobación. Solo para supervisores.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'proyectoId',
    required: false,
    description: 'Filtrar por proyecto',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o solicitante',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Tamaño página (default: 20, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'Lista obtenida exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo supervisores pueden acceder' })
  listCotizacionesPendientes(
    @CurrentUser() user: UserJwt,
    @Query('estado') estado?: string,
    @Query('proyectoId') proyectoId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.followupsService.listCotizacionesPendientes(user, {
      estado,
      proyectoId,
      search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  /**
   * GET /api/v1/followups/estadisticas
   * Obtiene estadísticas del dashboard de supervisores
   */
  @Get('estadisticas')
  @ApiOperation({
    summary: 'Estadísticas de supervisor',
    description: 'Obtiene contadores y estadísticas para el dashboard',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getEstadisticas(@CurrentUser() user: UserJwt) {
    return this.followupsService.getEstadisticasSupervisor(user);
  }

  /**
   * GET /api/v1/followups/supervisores
   * Lista supervisores disponibles
   */
  @Get('supervisores')
  @ApiOperation({
    summary: 'Listar supervisores',
    description:
      'Obtiene lista de supervisores activos con su carga de trabajo',
  })
  @ApiResponse({ status: 200, description: 'Lista obtenida' })
  getSupervisores() {
    return this.followupsService.getSupervisoresDisponibles();
  }

  /**
   * GET /api/v1/followups/:id
   * Obtiene detalle completo de una cotización
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de cotización',
    description:
      'Obtiene cotización completa con productos, timeline sugerido y chat',
  })
  @ApiResponse({ status: 200, description: 'Cotización obtenida' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  getCotizacionDetalle(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.followupsService.getCotizacionDetalle(id, user);
  }

  /**
   * GET /api/v1/followups/:id/historial
   * Obtiene historial de cambios de una cotización
   */
  @Get(':id/historial')
  @ApiOperation({
    summary: 'Historial de cambios',
    description: 'Obtiene log completo de cambios realizados en la cotización',
  })
  @ApiQuery({
    name: 'accion',
    required: false,
    description: 'Filtrar por tipo de acción',
  })
  @ApiResponse({ status: 200, description: 'Historial obtenido' })
  getHistorial(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('accion') accion?: string,
  ) {
    return this.followupsService.getHistorial(id, { accion });
  }

  /**
   * POST /api/v1/followups/:id/configurar
   * Configura timeline para productos de la cotización
   */
  @Post(':id/configurar')
  @ApiOperation({
    summary: 'Configurar timeline',
    description:
      'Configura días de timeline, país y transporte para cada producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline configurado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 403,
    description: 'Solo supervisores pueden configurar',
  })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  configurarTimeline(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigurarCotizacionDto,
  ) {
    return this.followupsService.configurarTimeline(id, dto, user);
  }

  /**
   * POST /api/v1/followups/:id/aprobar
   * Aprueba o desaprueba productos individualmente
   */
  @Post(':id/aprobar')
  @ApiOperation({
    summary: 'Aprobar productos',
    description: 'Aprueba o desaprueba productos de forma individual o masiva',
  })
  @ApiResponse({ status: 200, description: 'Aprobaciones actualizadas' })
  @ApiResponse({
    status: 400,
    description: 'Producto no pertenece a la cotización',
  })
  @ApiResponse({ status: 403, description: 'Solo supervisores pueden aprobar' })
  aprobarProductos(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AprobarProductosDto,
  ) {
    return this.followupsService.aprobarProductos(id, dto, user);
  }

  /**
   * PATCH /api/v1/followups/:id/supervisor
   * Reasigna supervisor responsable
   */
  @Patch(':id/supervisor')
  @ApiOperation({
    summary: 'Reasignar supervisor',
    description: 'Cambia el supervisor responsable de la cotización',
  })
  @ApiResponse({ status: 200, description: 'Supervisor reasignado' })
  @ApiResponse({ status: 400, description: 'Usuario no es supervisor' })
  @ApiResponse({
    status: 403,
    description: 'Solo supervisores pueden reasignar',
  })
  reasignarSupervisor(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('supervisorId', ParseUUIDPipe) supervisorId: string,
  ) {
    return this.followupsService.reasignarSupervisor(id, supervisorId, user);
  }

  /**
   * POST /api/v1/followups/:id/rechazar
   * Rechaza un producto individual con motivo
   */
  @Post(':id/rechazar')
  @ApiOperation({
    summary: 'Rechazar producto',
    description: 'Rechaza un producto individual con un motivo obligatorio',
  })
  @ApiResponse({ status: 200, description: 'Producto rechazado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Motivo inválido o producto no encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo supervisores pueden rechazar',
  })
  rechazarProducto(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { estadoProductoId: string; motivoRechazo: string },
  ) {
    return this.followupsService.rechazarProducto(id, dto, user);
  }
}
