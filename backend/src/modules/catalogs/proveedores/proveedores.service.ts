import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: {
    search?: string;
    activo?: string;
    page?: string;
    pageSize?: string;
  }) {
    const page = parseInt(query?.page || '1');
    const pageSize = parseInt(query?.pageSize || '50');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query?.activo !== undefined && query.activo !== '') {
      where.activo = query.activo === 'true';
    }
    if (query?.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { rtn: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.proveedor.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: {
              precios: true,
              compraDetalles: true,
            },
          },
        },
      }),
      this.prisma.proveedor.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            precios: true,
            compraDetalles: true,
          },
        },
      },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor;
  }

  async create(dto: {
    nombre: string;
    rtn?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }) {
    // Verificar duplicado
    const existente = await this.prisma.proveedor.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existente)
      throw new ConflictException(
        `Ya existe un proveedor con el nombre "${dto.nombre}"`,
      );

    return this.prisma.proveedor.create({ data: dto });
  }

  async update(
    id: string,
    dto: {
      nombre?: string;
      rtn?: string;
      email?: string;
      telefono?: string;
      direccion?: string;
      activo?: boolean;
    },
  ) {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    // Verificar nombre duplicado si cambió
    if (dto.nombre && dto.nombre !== proveedor.nombre) {
      const existente = await this.prisma.proveedor.findUnique({
        where: { nombre: dto.nombre },
      });
      if (existente)
        throw new ConflictException(
          `Ya existe un proveedor con el nombre "${dto.nombre}"`,
        );
    }

    return this.prisma.proveedor.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: { _count: { select: { precios: true, compraDetalles: true } } },
    });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');

    // Si tiene relaciones, soft delete
    if (proveedor._count.precios > 0 || proveedor._count.compraDetalles > 0) {
      return this.prisma.proveedor.update({
        where: { id },
        data: { activo: false },
      });
    }

    // Si no tiene relaciones, eliminar
    return this.prisma.proveedor.delete({ where: { id } });
  }
}
