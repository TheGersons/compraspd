// src/modules/tracking-quotes/tracking-quotes.controller.ts
import { Controller, Post, Param, Body, UseGuards, Patch, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrackingQuotesService } from './tracking-quotes.service'; // ¡Clase renombrada!
import { CurrentUser } from '../../common/decorators/current-user.decorator'; 
import { AddCommentDto } from './dto/AddComment.dto';
import { AssignUserDto } from './dto/AssingUser.dto';
import { ChangePrStatusDto } from './dto/ChangePrStatus.dto';

// Importa los DTOs (asumimos que están en una ruta accesible o se movieron al módulo TrackingQuotes)

// La ruta base: /api/v1/purchase-requests/:id (el :id se expone en el controlador)
@Controller('api/v1/purchase-requests/:id')
@UseGuards(AuthGuard('jwt'))
export class TrackingQuotesController {
  constructor(private readonly trackingService: TrackingQuotesService) {}

  // OBTENER HISTORIAL (Mensajería, estados, asignaciones)
  // GET /api/v1/purchase-requests/:id/tracking
  @Get('tracking')
  getHistory(@Param('id') id: string) {
      return this.trackingService.getTrackingHistory(id);
  }

  // 1. CAMBIAR ESTADO
  // PATCH /api/v1/purchase-requests/:id/status
  @Patch('status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangePrStatusDto,
    @CurrentUser() me: any
  ) {
    return this.trackingService.changeStatus(id, dto.status, me);
  }

  // 2. ASIGNAR
  // POST /api/v1/purchase-requests/:id/assign
  @Post('assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignUserDto,
    @CurrentUser() me: any
  ) {
    return this.trackingService.assign(id, dto.assigneeId, dto.role || 'REVISOR', me);
  }

  // 3. AÑADIR COMENTARIO
  // POST /api/v1/purchase-requests/:id/comment
  @Post('comment')
  comment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() me: any
  ) {
    return this.trackingService.addComment(id, dto.body, me);
  }
}