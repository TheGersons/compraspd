import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    public async generateUniqueAssignmentId(): Promise<string> {
        let assignmentId = "";
        let exists = true;

        while (exists) {
            // Formato: ASSIGN-YYYYMMDD-XXXX
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            assignmentId = `ASSIGN-${date}-${random}`;

            const existing = await this.prisma.assignment.findUnique({
                where: { assignmentId },
            });
            exists = !!existing;
        }

        return assignmentId;
    }

    async create(dto: CreateAssignmentDto) {
        const assignmentId = await this.generateUniqueAssignmentId();

        const assignee = await this.prisma.user.findUnique({
            where: { id: dto.assignedToId },
            select: {
                id: true,
                role: {
                    select: { name: true }
                },
            },
        });

        if (!assignee || assignee.role.name != 'SUPERVISOR') {
            console.error('El usuario asignado debe existir y tener el rol de SUPERVISOR.');
            throw new Error('El usuario asignado debe existir y tener el rol de SUPERVISOR.');
        }



        const result = await this.prisma.$transaction(async (tx) => {
            // opcional: si ya existe asignación abierta, puedes decidir si permitir o no
            // const existing = await tx.assignment.findFirst({ where: { purchaseRequestId: dto.entityId, followStatus: { in: ['ASSIGNED','IN_PROGRESS'] } } });

            const created = await tx.assignment.create({
                data: {
                    assignmentId: assignmentId,
                    entityType: dto.entityType ?? 'PurchaseRequest',
                    entityId: dto.entityId,
                    assignedToId: dto.assignedToId,
                    role: dto.role ?? 'SUPERVISOR',
                    progress: 0,
                    followStatus: 'IN_PROGRESS',
                    purchaseRequestId: dto.entityId, // FK directa
                    requesterId: dto.requesterId,
                },
                select: {
                    id: true,
                    assignedToId: true,
                    progress: true,
                    followStatus: true,
                    assignedTo: { select: { id: true, fullName: true } },
                    purchaseRequestId: true,
                },
            });

            // Actualiza el estado del PR a IN_PROGRESS si aún no lo está
            await tx.purchaseRequest.update({
                where: { id: dto.entityId },
                data: { status: 'IN_PROGRESS' },
                select: { id: true },
            });

            return created;
        });

        return result;
    }

    listFor(entityType: string, entityId: string) {
        return this.prisma.assignment.findMany({
            where: { entityType, entityId },
            include: { assignedTo: true } // ✅ Cambié assignee por assignedTo
        });
    }

    async listIncompletes() {
        const incompletes = this.prisma.purchaseRequest.findMany({
            where: {
                status: { in: ['SUBMITTED', 'IN_PROGRESS'] },
            },
            select: {
                id: true,
                reference: true,
                createdAt: true,
                quoteDeadline: true,
                requestCategory: true,
                procurement: true,
                deliveryType: true,
                description: true,
                finalClient: true,
                assignments: {
                    select: {
                        id: true,
                        assignedToId: true,
                        progress: true,
                        followStatus: true,
                        assignedTo: { select: { id: true, fullName: true } },
                    },
                },
                requester: { select: { id: true, fullName: true } },
                items: {
                    select: {
                        id: true,
                        sku: true,
                        description: true,
                        quantity: true,
                        unit: true,
                        extraSpecs: true,
                    },
                },
            },
        });

        return incompletes;

        //prItems tiene que ir dentro de incompletes
        
    }

}