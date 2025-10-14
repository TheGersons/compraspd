// src/followups/followups.service.ts

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FollowStatus, UpdateFollowupDto, SendMessageDto } from './dto/update-followup.dto';
import { Assignment } from '@prisma/client';


@Injectable()
export class FollowupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que la asignación exista y pertenezca al usuario asignado.
   * @returns El objeto Assignment si la validación es exitosa.
   */
  /**
   * Ensure that the current user is the assignee of the given assignment.  The
   * follow‑ups API always works against the internal assignment `id` (not the
   * human‑readable public identifier).  If the assignment does not exist or
   * belongs to a different user an exception is thrown.
   */
  private async ensureAssignee(assignmentId: string, userId: string): Promise<Assignment> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { assignee: true },
    });
    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${assignmentId} no encontrada.`);
    }
    if (assignment.assigneeId !== userId) {
      throw new UnauthorizedException('No está autorizado para modificar el seguimiento de esta asignación.');
    }
    return assignment;
  }

  // =========================================================================
  // 1. LECTURA DE ASIGNACIONES (Columna Izquierda del Frontend)
  // =========================================================================
  async listMyAssignments(userId: string) {
    /**
     * Return all assignments for the current user that are not yet completed.
     * We filter by the assigneeId field on the Assignment model and exclude
     * assignments marked as FINALIZADO.  Only basic assignee information is
     * returned; if purchase request details are required a relation must be
     * added to the schema or fetched via a separate query.
     */
    return this.prisma.assignment.findMany({
      where: {
        assigneeId: userId,
        followStatus: { not: FollowStatus.FINALIZADO },
      },
      include: {
        // include the purchaseRequest relation if present so the client can
        // display contextual information about the assignment.  Prisma will
        // return null if the entityType/entityId do not point to a purchase
        // request.
        assignee: { select: { fullName: true } },
      },
    });
  }


  // =========================================================================
  // 2. ACTUALIZAR SEGUIMIENTO (ProgressControl / StatusActions)
  // =========================================================================
  async updateFollowup(assignmentId: string, userId: string, data: UpdateFollowupDto) {
    await this.ensureAssignee(assignmentId, userId);
    return this.prisma.assignment.update({
      where: { id: assignmentId },
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
    // Cualquier usuario autorizado para ver el seguimiento de la asignación puede
    // consultar el historial de chat.  Filtramos por el campo `assignmentId`
    // directamente en ChatMessage, luego ordenamos por fecha ascendente.
    return this.prisma.chatMessage.findMany({
      where: { assignmentId },
      include: {
        files: true,
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
        assignmentId: assignment.id, // Usamos el ID interno (cuid) para la relación
        senderId: userId,
        files: {
          // Conecta los ChatFiles pre-creados/pre-subidos
          connect: dto.fileIds.map(fileId => ({ id: fileId })),
        },
      },
      include: { files: true }, // Incluimos los archivos para retornar el objeto completo
    });
    
    return newMessage;
  }
}