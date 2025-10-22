// src/followups/followups.service.ts

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Assignment, FollowStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateFollowupDto, SendMessageDto } from './dto/update-followup.dto';

@Injectable()
export class FollowupsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Valida que la asignación exista y pertenezca al usuario asignado.
   * @returns El objeto Assignment si la validación es exitosa.
   */
  private async ensureAssignee(id: string, userId: string): Promise<Assignment> {
  const assignment = await this.prisma.assignment.findUnique({
    where: { id }, // ✅ Busca por UUID interno
  });

  if (!assignment) {
    throw new NotFoundException(`Asignación ${id} no encontrada.`);
  }

  if (assignment.assignedToId !== userId) {
    console.error(`Usuario ${userId} no autorizado para modificar la asignación ${id}.`);
    throw new UnauthorizedException('No tienes permiso para modificar esta asignación.');
  }

  return assignment;
}

  // =========================================================================
  // 1. LECTURA DE ASIGNACIONES (Columna Izquierda del Frontend)
  // =========================================================================
  async listMyAssignments(userId: string) {
    const assignments = await this.prisma.assignment.findMany({
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
            requestCategory: true, // ✅ Campo agregado al schema
            procurement: true, // ✅ Campo agregado al schema
            deliveryType: true, // ✅ Campo agregado al schema
            projectId: true,
            comments: true, // ✅ Corregido de "comment"
          }
        },
        assignedTo: { // ✅ Corregido
          select: { fullName: true }
        }
      },
    });

    return assignments.map((assignment) => ({
    // ✅ Incluye AMBOS IDs para evitar confusión
    id: assignment.id, // ID interno (CUID)
    assignmentId: assignment.assignmentId, // ID público (ASSIGN-XXX)
    progress: assignment.progress,
    eta: assignment.eta,
    followStatus: assignment.followStatus,
    priorityRequested: assignment.priorityRequested,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    assignedToId: assignment.assignedToId,
    assignedTo: assignment.assignedTo,
    purchaseRequest: assignment.purchaseRequest
      ? {
          ...assignment.purchaseRequest,
          projectId: assignment.purchaseRequest.projectId ?? "N/A",
          finalClient: assignment.purchaseRequest.finalClient ?? "N/A",
          comments: assignment.purchaseRequest.comments ?? "Sin comentarios",
        }
      : null,
  }));
}

  // =========================================================================
  // 2. ACTUALIZAR SEGUIMIENTO (ProgressControl / StatusActions)
  // =========================================================================
  async updateFollowup(assignmentId: string, userId: string, data: UpdateFollowupDto) {
    // Primero obtén el assignment para validar
    const assignment = await this.ensureAssignee(assignmentId, userId);

    // Actualiza usando el ID interno (CUID), no assignmentId
    return this.prisma.assignment.update({
      where: { id: assignment.id }, // ✅ Usa el ID interno retornado por ensureAssignee
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
 async listChat(id: string) {
  // ✅ CORRECTO: ChatMessage.assignmentId referencia Assignment.id (UUID)
  return this.prisma.chatMessage.findMany({
    where: { assignmentId: id }, // ✅ Usa directamente el UUID
    include: { 
      files: true, 
      sender: {
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