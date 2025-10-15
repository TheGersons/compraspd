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

        return this.prisma.assignment.create({
            data: {
                assignmentId,
                entityType: dto.entityType,
                entityId: dto.entityId,
                assignedToId: dto.assignedToId,
                role: dto.role ?? "",
                progress: dto.progress ?? 0,
                followStatus: dto.followStatus ?? 'EN_PROGRESO',
                // Si entityType es PurchaseRequest, agregar la FK directa
                purchaseRequestId: dto.entityType === 'PurchaseRequest' ? dto.entityId : undefined,
            },
        });
    }

    listFor(entityType: string, entityId: string) {
        return this.prisma.assignment.findMany({
            where: { entityType, entityId },
            include: { assignedTo: true } // ✅ Cambié assignee por assignedTo
        });
    }


    //formato a recuperar
    /*
const MOCK_DATA: AssignmentRequest[] = [
  {
    id: "REQ-2025-0012",
    reference: "REF-UPS-1KVA",
    finalClient: "Acme SA",
    createdAt: "2025-09-10",
    deadline: "2025-10-20",
    requestType: "proyectos",
    scope: "nacional",
    deliveryPlace: "almacen",
    comments: "UPS de respaldo para planta solar.",
  },
];

*/
    listIncompletes() {
        return this.prisma.purchaseRequest.findMany({
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
            },
        });
    }

}