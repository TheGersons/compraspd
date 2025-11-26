// ============================================================================
// timeline.controller.ts
// ============================================================================

import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { MedioTransporte } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActualizarTimelineDto } from './dto/actualizar-timeline.dto';

@ApiTags('Timeline SKU')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ summary: 'Listar timelines configurados' })
  @ApiQuery({ name: 'paisOrigenId', required: false })
  @ApiQuery({ name: 'medioTransporte', required: false, enum: MedioTransporte })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Lista obtenida' })
  listTimelines(
    @Query('paisOrigenId') paisOrigenId?: string,
    @Query('medioTransporte') medioTransporte?: MedioTransporte,
    @Query('search') search?: string
  ) {
    return this.timelineService.listTimelines({
      paisOrigenId,
      medioTransporte,
      search
    });
  }

  @Get(':sku')
  @ApiOperation({ summary: 'Obtener timeline de un SKU' })
  @ApiResponse({ status: 200, description: 'Timeline obtenido' })
  @ApiResponse({ status: 404, description: 'Timeline no encontrado' })
  getTimelineBySKU(@Param('sku') sku: string) {
    return this.timelineService.getTimelineBySKU(sku);
  }

  @Get(':sku/sugerencia')
  @ApiOperation({ 
    summary: 'Sugerir timeline similar',
    description: 'Busca timelines similares por SKU o devuelve los más recientes'
  })
  @ApiResponse({ status: 200, description: 'Sugerencias obtenidas' })
  sugerirTimeline(@Param('sku') sku: string) {
    return this.timelineService.sugerirTimelineSimilar(sku);
  }

  @Patch(':sku')
  @ApiOperation({ summary: 'Actualizar timeline de un SKU' })
  @ApiResponse({ status: 200, description: 'Timeline actualizado' })
  @ApiResponse({ status: 404, description: 'Timeline no encontrado' })
  actualizarTimeline(
    @Param('sku') sku: string,
    @Body() dto: ActualizarTimelineDto
  ) {
    return this.timelineService.actualizarTimeline(sku, dto);
  }

  @Delete(':sku')
  @ApiOperation({ 
    summary: 'Eliminar timeline',
    description: 'Solo si no hay productos activos usando este timeline'
  })
  @ApiResponse({ status: 200, description: 'Timeline eliminado' })
  @ApiResponse({ status: 400, description: 'Hay productos activos usando este timeline' })
  eliminarTimeline(@Param('sku') sku: string) {
    return this.timelineService.eliminarTimeline(sku);
  }
}