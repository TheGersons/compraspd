import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificacionDto, ListNotificacionesQueryDto } from './dto/notificacion.dto';

type UserJwt = { sub: string; role?: string };

@Injectable()
export class NotificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificacionDto) {
    return this.prisma.notificacion.create({
      data: {
        userId: dto.userId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        descripcion: dto.descripcion
      },
      include: {
        usuario: {
          select: { nombre: true, email: true }
        }
      }
    });
  }

  async createBulk(userIds: string[], tipo: string, titulo: string, descripcion: string) {
    const data = userIds.map(userId => ({
      userId,
      tipo,
      titulo,
      descripcion
    }));

    return this.prisma.notificacion.createMany({ data });
  }

  async list(userId: string, filters: ListNotificacionesQueryDto) {
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (filters.completada !== undefined) where.completada = filters.completada;
    if (filters.tipo) where.tipo = filters.tipo;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.notificacion.count({ where }),
      this.prisma.notificacion.findMany({
        where,
        orderBy: { creada: 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return { page, pageSize, total, items };
  }

  async findById(id: string, userId: string) {
    return this.prisma.notificacion.findFirst({
      where: { id, userId }
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notificacion.updateMany({
      where: { id, userId },
      data: { completada: true }
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notificacion.updateMany({
      where: { userId, completada: false },
      data: { completada: true }
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notificacion.count({
      where: { userId, completada: false }
    });
    return { count };
  }

  async delete(id: string, userId: string) {
    return this.prisma.notificacion.deleteMany({
      where: { id, userId }
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.notificacion.deleteMany({
      where: { userId }
    });
  }
}