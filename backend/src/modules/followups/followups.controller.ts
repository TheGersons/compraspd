// src/followups/followups.controller.ts

import { Controller, Get, Param, Patch, Body, Post, UseGuards, Req } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFollowupDto, SendMessageDto } from './dto/update-followup.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Simulamos la extracción del ID del usuario del Request (típico de NestJS con JWT Guard)
// En un proyecto real, esto se haría con un decorador @GetUser('id') o similar.
interface AuthenticatedRequest extends Request {
    user: { id: string }; 
}

@UseGuards(AuthGuard('jwt')) // Aseguramos que solo usuarios autenticados puedan acceder
@Controller('api/v1/assignments')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  // GET /assignments/my-followups
  @Get('my-followups')
  listMyAssignments(@Req() req: AuthenticatedRequest) {
    // req.user.id es el 'sub' (ID del usuario) que usó tu frontend mockeado: 'USER-CARLOS'
    return this.followupsService.listMyAssignments(req.user.id);
  }
  
  // PATCH /assignments/:assignmentId/follow-up
  // Endpoint para actualizar progreso, ETA o estado
  @Patch(':assignmentId/followup')
  updateFollowup(
    @Param('assignmentId') assignmentId: string,
    @Body() updateDto: UpdateFollowupDto,
    @CurrentUser() user: {sub: string; userId: string},
  ) {
    return this.followupsService.updateFollowup(assignmentId, user.sub, updateDto);
  }

  // GET /assignments/:assignmentId/chat
  @Get(':assignmentId/chat')
  listChat(@Param('assignmentId') assignmentId: string) {
    return this.followupsService.listChat(assignmentId);
  }

  // POST /assignments/:assignmentId/chat
  @Post(':assignmentId/chat')
  sendMessage(
    @Param('assignmentId') assignmentId: string,
    @Body() messageDto: SendMessageDto,
    @Req() req: any,
  ) {
    // El 'assignmentId' es el ID público (ASSIGN-001)
    // El 'req.user.id' es el senderId
    return this.followupsService.sendMessage(assignmentId, req.user.sub, messageDto);
  }

  /*
    FALTA: Un controlador separado (ej: FileUploadController) con un endpoint POST /files
    que se encargue de:
    1. Subir el archivo a S3/Cloud Storage.
    2. Crear el registro en la tabla 'ChatFile' con el nombre, tamaño y URL.
    3. Retornar el 'id' del ChatFile creado para ser usado en 'SendMessageDto'.
  */
}