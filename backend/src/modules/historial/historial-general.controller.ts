// src/historial-general/historial-general.controller.ts
import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HistorialGeneralService } from './historial-general.service';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para el Historial General de Cotizaciones
 * 
 * Endpoints:
 * - GET /historial-general - Obtener resumen de todas las cotizaciones
 * - GET /historial-general/:id - Obtener detalle de una cotización específica
 */
@Controller('api/v1/historial-general')
@UseGuards(AuthGuard('jwt'))
export class HistorialGeneralController {
  constructor(private readonly service: HistorialGeneralService) {}

  /**
   * GET /api/v1/historial-general
   * 
   * Retorna un resumen de todas las cotizaciones con:
   * - Información básica (nombre, solicitante, proyecto)
   * - Contadores por etapa (10 etapas del proceso)
   * - Criticidad calculada
   * - Productos atrasados
   */
  @Get()
  async obtenerResumen(@CurrentUser() user: UserJwt) {
    return this.service.obtenerResumenGeneral(user);
  }

  /**
   * GET /api/v1/historial-general/:id
   * 
   * Retorna el detalle completo de una cotización específica
   * Incluye toda la información del resumen más datos adicionales
   */
  @Get(':id')
  async obtenerDetalle(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserJwt
  ) {
    return this.service.obtenerDetalleCotizacion(id, user);
  }
}