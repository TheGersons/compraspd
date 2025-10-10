import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async create(data: { name: string; taxId?: string; contact?: string }) {
    if (data.taxId) {
      const exists = await this.prisma.client.findUnique({ where: { taxId: data.taxId } }).catch(() => null);
      if (exists) throw new BadRequestException('El taxId ya existe');
    }
    return this.prisma.client.create({ data });
  }

  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { taxId: { contains: params.search, mode: 'insensitive' } },
        { contact: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Si no se especifican page/pageSize, devolvemos toda la lista (sin contar total)
    if (!params.page && !params.pageSize) {
      const items = await this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      // Devolvemos la lista simple que el frontend espera
      return items;
    }

    // Lógica de paginación normal si page/pageSize están presentes
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    const [total, items] = await this.prisma.$transaction([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        // Solo seleccionamos los campos que necesita el frontend
        select: { id: true, name: true, taxId: true }
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
