import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type UserJwt = { sub: string; role?: string; email?: string };

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: [], // siguiente paso sería generar OC (fuera de este módulo)
  REJECTED: [],
  CANCELLED: [],
};

@Injectable()
export class PurchaseRequestsService {
  constructor(private prisma: PrismaClient) {}

  async create(dto: any, me: UserJwt) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debes incluir al menos 1 ítem');
    }

    return this.prisma.purchaseRequest.create({
      data: {
        requesterId: me.sub,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId ? dto.projectId : undefined,
        locationId: dto.locationId,
        departmentId: dto.departmentId ? dto.departmentId : undefined,
        clientId: dto.clientId,
        procurement: dto.procurement,
        quoteDeadline: dto.quoteDeadline ? new Date(dto.quoteDeadline) : undefined,
        deliveryType: dto.deliveryType,
        reference: dto.reference,
        comment: dto.comment,
        status: 'DRAFT',
        items: {
          create: dto.items.map((i: any) => ({
            description: i.description,
            quantity: i.quantity, // Decimal (string) ok
            unit: i.unit,
            productId: i.productId,
            requiredCurrency: i.requiredCurrency,
            itemType: i.itemType,
            sku: i.sku,
            barcode: i.barcode,
          })),
        },
      },
      include: { items: true, project: true, location: true },
    });
  }

  async listMine(me: UserJwt, page = 1, pageSize = 20) {
    const [total, items] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.count({ where: { requesterId: me.sub } }),
      this.prisma.purchaseRequest.findMany({
        where: { requesterId: me.sub },
        include: { items: true, project: true, location: true },
        orderBy: { createdAt: 'desc' },
        skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize)),
        take: Math.min(100, Math.max(1, pageSize)),
      }),
    ]);
    return { page, pageSize, total, items };
  }

  async getById(id: string, me: UserJwt) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true, project: true, location: true, attachments: true },
    });
    if (!pr) throw new NotFoundException('Solicitud no encontrada');

    // Si no es supervisor/admin, solo puede ver las suyas (puedes refinar con permisos)
    if (pr.requesterId !== me.sub && !this.isSupervisorOrAdmin(me)) {
      throw new ForbiddenException('No puedes ver esta solicitud');
    }
    return pr;
  }

  async update(id: string, dto: any, me: UserJwt) {
    const current = await this.prisma.purchaseRequest.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw new NotFoundException('Solicitud no encontrada');

    // Solo dueño puede editar en DRAFT. Supervisores podrían editar en UNDER_REVIEW si así lo decides.
    const canEdit =
      (current.requesterId === me.sub && current.status === 'DRAFT') ||
      (this.isSupervisorOrAdmin(me) && ['SUBMITTED', 'UNDER_REVIEW'].includes(current.status));
    if (!canEdit) throw new ForbiddenException('No puedes editar esta solicitud en su estado actual');

    // Actualizar cabecera (no tocamos items aquí; puedes modelar PATCH de items aparte)
    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        title: dto.title ?? current.title,
        description: dto.description ?? current.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : current.dueDate,
        projectId: dto.projectId ?? current.projectId,
        locationId: dto.locationId ?? current.locationId,
        departmentId: dto.departmentId ?? current.departmentId,
        clientId: dto.clientId ?? current.clientId,
        procurement: dto.procurement ?? current.procurement,
        quoteDeadline: dto.quoteDeadline ? new Date(dto.quoteDeadline) : current.quoteDeadline,
        deliveryType: dto.deliveryType ?? current.deliveryType,
        reference: dto.reference ?? current.reference,
        comment: dto.comment ?? current.comment,
      },
      include: { items: true },
    });
  }

  async changeStatus(id: string, status: string, me: UserJwt) {
    const current = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Solicitud no encontrada');

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Transición no permitida: ${current.status} → ${status}`);
    }

    // Reglas:
    // - El solicitante puede pasar DRAFT→SUBMITTED / DRAFT→CANCELLED
    // - Supervisor/Admin pueden mover SUBMITTED/UNDER_REVIEW → (APPROVED|REJECTED|CANCELLED|UNDER_REVIEW)
    const isOwner = current.requesterId === me.sub;
    const isSupervisor = this.isSupervisorOrAdmin(me);

    if (current.status === 'DRAFT') {
      if (!(isOwner || isSupervisor)) throw new ForbiddenException('No autorizado');
    } else {
      if (!isSupervisor) throw new ForbiddenException('Solo supervisores o admin pueden cambiar este estado');
    }

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: { status },
    });
  }

  // Listado de solicitudes asignadas a un supervisor para revisión
  async listAssignedTo(me: UserJwt, page = 1, pageSize = 20) {
    // Busca assignments del usuario sobre PR y trae la PR asociada
    const assignments = await this.prisma.assignment.findMany({
      where: { assigneeId: me.sub, entityType: 'PurchaseRequest' },
      orderBy: { createdAt: 'desc' },
      skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize)),
      take: Math.min(100, Math.max(1, pageSize)),
    });

    const ids = assignments.map(a => a.entityId);
    const [total, items] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.count({ where: { id: { in: ids } } }),
      this.prisma.purchaseRequest.findMany({
        where: { id: { in: ids } },
        include: { items: true, project: true, location: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { page, pageSize, total, items };
  }

  private isSupervisorOrAdmin(me: UserJwt) {
    const r = (me.role || '').toUpperCase();
    return r === 'SUPERVISOR' || r === 'ADMIN';
  }
}
