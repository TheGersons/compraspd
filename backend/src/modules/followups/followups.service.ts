// src/followups/followups.service.ts

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Assignment, FollowStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateFollowupDto, SendMessageDto } from './dto/update-followup.dto';

@Injectable()
export class FollowupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que la asignación exista y pertenezca al usuario asignado.
   * @returns El objeto Assignment si la validación es exitosa.
   */
  private async ensureAssignee(assignmentId: string, userId: string): Promise<Assignment> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { assignmentId }, // ✅ Ahora sí existe en el schema
      include: { assignedTo: true }, // ✅ Ahora es "assignedTo" no "assignee"
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${assignmentId} no encontrada.`);
    }

    // ✅ Ahora es "assignedToId" no "assigneeId"
    if (assignment.assignedToId !== userId) {
      throw new UnauthorizedException('No está autorizado para modificar el seguimiento de esta asignación.');
    }
    
    return assignment;
  }

  // =========================================================================
  // 1. LECTURA DE ASIGNACIONES (Columna Izquierda del Frontend)
  // =========================================================================
  async listMyAssignments(userId: string) {
    return this.prisma.assignment.findMany({
      where: {
        assignedToId: userId, // ✅ Corregido
        followStatus: { not: FollowStatus.COMPLETED },
      },
      include: {
        purchaseRequest: { // ✅ Ahora existe esta relación directa
          select: { 
            id: true, 
            reference: true,
            finalClient: true, // ✅ Campo agregado al schema
            createdAt: true, 
            deadline: true, // ✅ Campo agregado al schema
            requestType: true, // ✅ Campo agregado al schema
            scope: true, // ✅ Campo agregado al schema
            deliveryPlace: true, // ✅ Campo agregado al schema
            projectId: true,
            comments: true, // ✅ Corregido de "comment"
          }
        },
        assignedTo: { // ✅ Corregido
          select: { fullName: true } 
        }
      },
    });
  }

  // =========================================================================
  // 2. ACTUALIZAR SEGUIMIENTO (ProgressControl / StatusActions)
  // =========================================================================
  async updateFollowup(assignmentId: string, userId: string, data: UpdateFollowupDto) {
    await this.ensureAssignee(assignmentId, userId);

    return this.prisma.assignment.update({
      where: { assignmentId }, // ✅ Corregido
      data: {
        progress: data.progress,
        eta: data.eta ? new Date(data.eta) : undefined,
        followStatus: data.followStatus,
        priorityRequested: data.priorityRequested,
      },
    });
  }

  // =========================================================================
  // 3. CHAT
  // =========================================================================
  async listChat(assignmentId: string) {
    // Primero obtenemos el assignment para obtener el ID interno
    const assignment = await this.prisma.assignment.findUnique({
      where: { assignmentId },
      select: { id: true }
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${assignmentId} no encontrada.`);
    }

    return this.prisma.chatMessage.findMany({
      where: { assignmentId: assignment.id }, // ✅ Usamos el ID interno (cuid)
      include: { 
        files: true, 
        sender: { // ✅ Ahora existe esta relación
          select: { id: true, fullName: true } 
        } 
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(assignmentId: string, userId: string, dto: SendMessageDto) {
    // 1. Asegurar que el usuario pueda enviar el mensaje
    const assignment = await this.ensureAssignee(assignmentId, userId);

    // 2. Crear el mensaje y conectar los archivos
    const newMessage = await this.prisma.chatMessage.create({
      data: {
        body: dto.body,
        assignmentId: assignment.id, // ✅ Usamos el ID interno (cuid)
        senderId: userId,
        files: {
          // Conecta los FileAttachments pre-creados/pre-subidos
          connect: dto.fileIds?.map(fileId => ({ id: fileId })) || [],
        },
      },
      include: { 
        files: true,
        sender: {
          select: { id: true, fullName: true }
        }
      },
    });
    return newMessage;
  }
}