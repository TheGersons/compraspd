import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('gerencia')
  @ApiOperation({
    summary: 'Dashboard Gerencial',
    description: 'Retorna áreas, proyectos con resumen de procesos, y productos detallados',
  })
  @ApiResponse({ status: 200, description: 'Datos gerenciales obtenidos' })
  getGerencia() {
    return this.dashboardService.getGerencia();
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'KPIs Operativos',
    description: 'Retorna KPIs de cotizaciones, compras e import/export',
  })
  @ApiResponse({ status: 200, description: 'KPIs obtenidos' })
  getKpis() {
    return this.dashboardService.getKpis();
  }
}
