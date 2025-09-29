import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePrDto } from './dto/create-pr.dto';
import { UpdatePrDto } from './dto/update-pr.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private prisma: PrismaClient) { }


  async create(requesterId: string, dto: CreatePrDto) {
    return this.prisma.purchaseRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        requesterId,
        projectId: dto.projectId,
        locationId: dto.locationId,
        departmentId: dto.departmentId,
        clientId: dto.clientId,
        deliveryType: dto.deliveryType,
        reference: dto.reference,
        comment: dto.comment,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            description: i.description,
            quantity: i.quantity as any,
            unit: i.unit,
            requiredCurrency: i.requiredCurrency,
            itemType: i.itemType,
            sku: i.sku,
            barcode: i.barcode,
            extraSpecs: i.extraSpecs as any,
          })),
        },
      }, include: { items: true },
    });
  }
  async findMine(userId: string, opts: { skip: number; take: number; q?: string; status?: string }) {
    const where: any = { requesterId: userId };
    if (opts.q) where.title = { contains: opts.q, mode: 'insensitive' };
    if (opts.status) where.status = opts.status;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.findMany({ where, skip: opts.skip, take: opts.take, orderBy: { createdAt: 'desc' } }),
      this.prisma.purchaseRequest.count({ where }),
    ]);
    return { data, total };
  }
  async findOne(id: string) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true, project: true, location: true, attachments: true },
    });
    if (!pr) throw new NotFoundException('Solicitud no encontrada');
    return pr;
  }
  async update(id: string, dto: UpdatePrDto) {
    await this.findOne(id);
    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        locationId: dto.locationId,
        departmentId: dto.departmentId,
        clientId: dto.clientId,
        deliveryType: dto.deliveryType,
        reference: dto.reference,
        comment: dto.comment,
      },
    });
  }
  async changeStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.purchaseRequest.update({ where: { id }, data: { status } });
  }
}