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
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        OR: [
          { id: id },
          { assignmentId: id }
        ],
      }, // ✅ Busca por UUID interno
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
      // ✅ AGREGADO: Ordena por referencia o cliente
      orderBy: [
        { purchaseRequest: { reference: 'asc' } },
        { purchaseRequest: { finalClient: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      assignmentId: assignment.assignmentId,
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
    // 1. Obtén el assignment y valida el usuario (asumo que ensureAssignee maneja la existencia)
    const assignment = await this.ensureAssignee(assignmentId, userId);

    // 2. Obtén el purchaseRequestId
    const purchaseRequest = await this.prisma.assignment.findUnique({
        where: { id: assignment.id },
        select: { purchaseRequestId: true }
    });

    // Comprobación de existencia del resultado.
    if (!purchaseRequest) {
        throw new Error('Asignación no encontrada en la base de datos.');
    }

    // 3. Validar el ID. El purchaseRequestId DEBE existir si la asignación existe.
    const purchaseRequestId = purchaseRequest.purchaseRequestId;
    
    if (purchaseRequestId === null) {
        // Esto indica un error grave en la integridad de los datos de la base de datos
        // Si la relación es obligatoria, usa un error más específico.
        throw new Error('La asignación existe, pero no está vinculada a una solicitud de compra (ID es null).');
    }
    
    // 4. Actualiza el PurchaseRequest
    // Nota: El método .update requiere que le pases el objeto 'data'
    const updatedPurchaseRequest = await this.prisma.purchaseRequest.update({
        where: { id: purchaseRequestId }, // ✅ Aquí purchaseRequestId es un string válido
        data: {
            status : data.followStatus,
            updatedAt: data.eta ? new Date(data.eta) : undefined,
        }
    });

    // 5. Actualiza la Asignación (Followup)
    // El 'assignment.id' es un string válido (asumiendo que ensureAssignee lo retorna correctamente).
    return this.prisma.assignment.update({
        where: { id: assignment.id },
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
    const messages = await this.prisma.chatMessage.findMany({
      where: { assignmentId: id }, // ✅ Usa directamente el UUID
      include: {
        files: true,
        sender: {
          select: { id: true, fullName: true }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    messages.map(msg => {
      console.log(`Mensaje ${msg.id} de la asignación ${id} enviado por ${msg.sender.fullName} a las ${msg.createdAt}`);
    });
    if (!messages) {
      throw new NotFoundException(`No se encontraron mensajes para la asignación ${id}.`);
    }
    return messages;
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

  async listItems(id: string) {
    const items = await this.prisma.pRItem.findMany({
      where: { purchaseRequestId: id }, 
      select: {
        id: true, 
        sku: true,
        description: true,
        quantity: true,
        unit: true,
        extraSpecs: true
      }
    });

    
    if (!items) {
      throw new NotFoundException(`No se encontraron mensajes para la asignación ${id}.`);
    }
    return items;
  }

}