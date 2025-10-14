// src/modules/tracking-quotes/tracking-quotes.service.ts
import {
    Injectable,
    NotFoundException, // Importaciones de @nestjs/common
    BadRequestException,
    ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseRequestStatus } from '../../common/enums/purchase-request-status.enum';

// Tipo simplificado para el usuario actual (del token JWT)
type CurrentUserPayload = { sub: string; role?: string };

// 🛑 Reglas de transición de estado (Usando tu enum local)
const ALLOWED_TRANSITIONS: Record<PurchaseRequestStatus, PurchaseRequestStatus[]> = {
    [PurchaseRequestStatus.DRAFT]: [PurchaseRequestStatus.SUBMITTED, PurchaseRequestStatus.CANCELLED],
    [PurchaseRequestStatus.SUBMITTED]: [
        PurchaseRequestStatus.UNDER_REVIEW,
        PurchaseRequestStatus.CANCELLED,
        PurchaseRequestStatus.REJECTED
    ],
    [PurchaseRequestStatus.UNDER_REVIEW]: [
        PurchaseRequestStatus.APPROVED,
        PurchaseRequestStatus.REJECTED,
        PurchaseRequestStatus.CANCELLED
    ],
    [PurchaseRequestStatus.APPROVED]: [],
    [PurchaseRequestStatus.REJECTED]: [],
    [PurchaseRequestStatus.CANCELLED]: [],
};

@Injectable()
export class TrackingQuotesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Obtiene el historial de seguimiento (estados, comentarios, asignaciones) de una PR.
     */
    // src/modules/tracking-quotes/tracking-quotes.service.ts

    async getTrackingHistory(id: string) {
        return this.prisma.auditLog.findMany({
            where: {
                entityType: 'PurchaseRequest',
                entityId: id
            },
            include: {
                actor: {
                    select: {
                        fullName: true,
                    }
                }
            }
        });
    }


    /**
     * Cambia el estado de una Purchase Request (PR) con validación de permisos y transición.
     */
    async changeStatus(id: string, newStatus: PurchaseRequestStatus, me: CurrentUserPayload) {
        const pr = await this.prisma.purchaseRequest.findUnique({
            where: { id },
            select: { status: true, requesterId: true }
        });

        if (!pr) throw new NotFoundException(`Solicitud (PR ${id}) no encontrada.`);

        // 1. Validar Transición
        const allowed = ALLOWED_TRANSITIONS[pr.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(`Transición no permitida: ${pr.status} → ${newStatus}.`);
        }

        // 2. Validar Permisos
        const role = (me.role || '').toUpperCase();
        const isSupervisor = ['SUPERVISOR', 'ADMIN'].includes(role);
        const isOwner = pr.requesterId === me.sub;

        if (pr.status === PurchaseRequestStatus.DRAFT && !(isOwner || isSupervisor)) {
            throw new ForbiddenException('Solo el solicitante o un supervisor pueden enviar o cancelar un borrador.');
        }
        if (pr.status !== PurchaseRequestStatus.DRAFT && !isSupervisor) {
            throw new ForbiddenException('Solo un supervisor puede modificar solicitudes enviadas.');
        }

        // 3. Actualizar y Auditar
        const updated = await this.prisma.purchaseRequest.update({
            where: { id },
            data: { status: newStatus },
        });

        await this.prisma.auditLog.create({
            data: {
                entityType: 'PurchaseRequest',
                entityId: id,
                action: `STATUS_${newStatus}`, // El log del action usa el string del estado
                actorId: me.sub
            }
        });

        return updated;
    }

    /**
     * Asigna la PR a un revisor/aprobador.
     */
    async assign(id: string, assigneeId: string, role: 'REVISOR' | 'APROBADOR', me: CurrentUserPayload) {
        const isSupervisor = ['SUPERVISOR', 'ADMIN'].includes((me.role || '').toUpperCase());

        if (!isSupervisor) {
            throw new ForbiddenException('Solo supervisores/administradores pueden asignar revisores.');
        }

        const assignment = await this.prisma.$transaction(async tx => {
            const pr = await tx.purchaseRequest.findUnique({ where: { id } });
            if (!pr) throw new NotFoundException(`Solicitud (PR ${id}) no encontrada.`);

            return tx.assignment.create({
                data: {
                    entityType: 'PurchaseRequest',
                    entityId: id,
                    assigneeId,
                    role
                }
            });
        });

        await this.prisma.auditLog.create({
            data: {
                entityType: 'PurchaseRequest', entityId: id, action: 'ASSIGNED', actorId: me.sub,
                after: { assigneeId, role }
            }
        });

        return assignment;
    }

    /**
     * Añade un comentario a la PR, registrándolo en el historial (AuditLog).
     */
    async addComment(id: string, body: string, me: CurrentUserPayload) {
        // Verificar que la PR exista si es necesario, aunque en esta etapa asumimos que el ID es válido

        return this.prisma.auditLog.create({
            data: {
                entityType: 'PurchaseRequest', entityId: id, action: 'COMMENT',
                actorId: me.sub,
                after: { body }
            }
        });
    }
}