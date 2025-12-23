import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstadoProductoSyncService } from './estado-producto-sync.service';

@ApiTags('Sincronización')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncEstadoProductoController {
  constructor(private readonly syncService: EstadoProductoSyncService) {}

  /**
   * Sincroniza todas las cotizaciones aprobadas antiguas
   * Crea EstadoProducto para productos que no lo tienen
   * SOLO SUPERVISORES/ADMIN
   */
  @Post('estado-productos/cotizaciones-aprobadas')
  @ApiOperation({ 
    summary: 'Sincronizar cotizaciones aprobadas antiguas',
    description: 'Crea EstadoProducto para todas las cotizaciones aprobadas que no tienen registro de seguimiento'
  })
  async sincronizarCotizacionesAprobadas() {
    return this.syncService.sincronizarCotizacionesAprobadas();
  }
}