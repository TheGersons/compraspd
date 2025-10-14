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
  private async ensureAssignee(assignmentId: string, userId: string): Promise<Assignment> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId }, // Usamos el ID público (ej: ASSIGN-001)
      include: { assignedTo: true },
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${assignmentId} no encontrada.`);
    }

    // Esta es la capa de seguridad crucial
    if (assignment.assignedToId !== userId) {
      throw new UnauthorizedException('No está autorizado para modificar el seguimiento de esta asignación.');
    }
    
    return assignment;
  }

  // =========================================================================
  // 1. LECTURA DE ASIGNACIONES (Columna Izquierda del Frontend)
  // =========================================================================
  async listMyAssignments(userId: string) {
    // Retorna una lista de Assignments, incluyendo la PurchaseRequest relacionada.
    // Esto proporciona al frontend todos los datos para la lista y los detalles.
    return this.prisma.assignment.findMany({
      where: {
        assignedToId: userId,
        followStatus: { not: FollowStatus.FINALIZADO }, // Excluye finalizadas
      },
      include: {
        purchaseRequest: {
          select: { 
            id: true, 
            reference: true,
            finalClient: true, 
            createdAt: true, 
            deadline: true, 
            requestType: true,
            scope: true,
            deliveryPlace: true,
            projectId: true,
            comments: true,
            // Aquí incluimos todos los campos de la PR que necesita el DetailHeader
          }
        },
        assignedTo: { select: { fullName: true } }
      },
    });
  }


  // =========================================================================
  // 2. ACTUALIZAR SEGUIMIENTO (ProgressControl / StatusActions)
  // =========================================================================
  async updateFollowup(assignmentId: string, userId: string, data: UpdateFollowupDto) {
    await this.ensureAssignee(assignmentId, userId);

    return this.prisma.assignment.update({
      where: { assignmentId },
      data: {
        // Mapeamos el DTO directamente a los campos de Assignment
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
    // NOTA: No necesitamos ensureAssignee aquí, ya que el chat puede ser visto 
    // por la persona asignada y por el solicitante (si implementamos esa lógica)
    
    return this.prisma.chatMessage.findMany({
      where: { assignment: { assignmentId } },
      include: { 
        files: true, 
        sender: { select: { id: true, fullName: true } } // Incluimos info del remitente
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