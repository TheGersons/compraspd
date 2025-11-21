import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeguimientoDto, ListSeguimientoQueryDto } from './dto/seguimiento.dto';

type UserJwt = { sub: string; role?: string };

@Injectable()
export class SeguimientoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeguimientoDto, user: UserJwt) {
    return this.prisma.seguimiento.create({
      data: {
        compraId: dto.compraId,
        compraDetalleId: dto.compraDetalleId,
        userId: user.sub,
        tipo: dto.tipo,
        detalle: dto.detalle
      },
      include: {
        usuario: {
          select: { nombre: true, email: true }
        },
        compra: {
          select: { id: true, estado: true }
        },
        compraDetalle: {
          select: { id: true, estado: true, descripcionProducto: true }
        }
      }
    });
  }

  async list(filters: ListSeguimientoQueryDto) {
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 50, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.compraId) where.compraId = filters.compraId;
    if (filters.compraDetalleId) where.compraDetalleId = filters.compraDetalleId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.tipo) where.tipo = filters.tipo;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.seguimiento.count({ where }),
      this.prisma.seguimiento.findMany({
        where,
        include: {
          usuario: {
            select: { id: true, nombre: true, email: true }
          },
          compra: {
            select: { id: true, estado: true }
          },
          compraDetalle: {
            select: { id: true, estado: true, descripcionProducto: true }
          }
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return { page, pageSize, total, items };
  }

  async findById(id: string) {
    return this.prisma.seguimiento.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { nombre: true, email: true }
        },
        compra: {
          select: { id: true, estado: true }
        },
        compraDetalle: {
          select: { id: true, estado: true, descripcionProducto: true }
        }
      }
    });
  }

  async getTimeline(compraId?: string, compraDetalleId?: string) {
    const where: any = {};
    if (compraId) where.compraId = compraId;
    if (compraDetalleId) where.compraDetalleId = compraDetalleId;

    return this.prisma.seguimiento.findMany({
      where,
      include: {
        usuario: {
          select: { nombre: true, email: true }
        }
      },
      orderBy: { fecha: 'asc' }
    });
  }
}