import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: { name: string; taxId?: string; contact?: string }) {
    if (data.taxId) {
      const exists = await this.prisma.client.findUnique({ where: { taxId: data.taxId } }).catch(() => null);
      if (exists) throw new BadRequestException('El taxId ya existe');
    }
    return this.prisma.client.create({ data });
  }

  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { taxId: { contains: params.search, mode: 'insensitive' } },
        { contact: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [total, items] = await this.prisma.$transaction([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { page, pageSize, total, items };
  }

  async get(id: string) {
    const c = await this.prisma.client.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cliente no encontrado');
    return c;
  }
}
