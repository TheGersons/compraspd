import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Injectable()
export class ProyectosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar proyectos con filtros
   */
  async listProyectos(params?: { estado?: boolean; search?: string }) {
    const where: any = {};

    if (typeof params?.estado === 'boolean') {
      where.estado = params.estado;
    }

    if (params?.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { descripcion: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.proyecto.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        criticidad: true,
        estado: true,
        creado: true,
        actualizado: true,
        areaId: true,
        area: { select: { id: true, nombreArea: true, tipo: true } },
        _count: {
          select: {
            cotizaciones: true,
          },
        },
      },
      orderBy: { creado: 'desc' },
    });
  }

  /**
   * Obtener proyecto por ID
   */
  async findById(id: string) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        cotizaciones: {
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            fechaSolicitud: true,
            solicitante: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10, // Últimas 10 cotizaciones
        },
        _count: {
          select: { cotizaciones: true },
        },
      },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return proyecto;
  }

  /**
   * Crear nuevo proyecto
   */
  async create(data: CreateProyectoDto) {
    // Validar que el nombre no exista
    const exists = await this.prisma.proyecto.findFirst({
      where: {
        nombre: {
          equals: data.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (exists) {
      throw new ConflictException('Ya existe un proyecto con ese nombre');
    }

    // Validar criticidad (1-10)
    if (
      data.criticidad !== undefined &&
      (data.criticidad < 1 || data.criticidad > 10)
    ) {
      throw new BadRequestException('La criticidad debe estar entre 1 y 10');
    }

    return this.prisma.proyecto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        criticidad: data.criticidad ?? 5,
        areaId: (data as any).areaId || null,
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        criticidad: true,
        estado: true,
        creado: true,
        areaId: true,
        area: { select: { id: true, nombreArea: true, tipo: true } },
      },
    });
  }

  /**
   * Actualizar proyecto
   */
  async update(id: string, data: UpdateProyectoDto) {
    await this.ensureExists(id);

    // Validar nombre único si se actualiza
    if (data.nombre) {
      const exists = await this.prisma.proyecto.findFirst({
        where: {
          nombre: {
            equals: data.nombre,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (exists) {
        throw new ConflictException('Ya existe un proyecto con ese nombre');
      }
    }

    // Validar criticidad si se proporciona
    if (
      data.criticidad !== undefined &&
      (data.criticidad < 1 || data.criticidad > 10)
    ) {
      throw new BadRequestException('La criticidad debe estar entre 1 y 10');
    }

    return this.prisma.proyecto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        criticidad: data.criticidad,
        areaId:
          (data as any).areaId !== undefined ? (data as any).areaId : undefined,
        estado: data.estado,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        criticidad: true,
        estado: true,
        actualizado: true,
        areaId: true,
        area: { select: { id: true, nombreArea: true, tipo: true } },
      },
    });
  }

  /**
   * Cerrar proyecto (cambiar estado a inactivo)
   */
  async close(id: string) {
    await this.ensureExists(id);

    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: false },
    });
  }

  /**
   * Abrir proyecto (cambiar estado a activo)
   */
  async open(id: string) {
    await this.ensureExists(id);

    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: true },
    });
  }

  /**
   * Eliminar proyecto (soft delete - solo si no tiene cotizaciones)
   */
  async delete(id: string) {
    await this.ensureExists(id);

    // Verificar que no tenga cotizaciones
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cotizaciones: true },
        },
      },
    });

    if (proyecto!._count.cotizaciones > 0) {
      throw new BadRequestException(
        `No se puede eliminar el proyecto porque tiene ${proyecto!._count.cotizaciones} cotización(es) asociada(s). Ciérrelo en su lugar.`,
      );
    }

    // Eliminar proyecto
    await this.prisma.proyecto.delete({
      where: { id },
    });

    return { message: 'Proyecto eliminado exitosamente' };
  }

  /**
   * Obtener estadísticas del proyecto
   */
  async getStats(id: string) {
    await this.ensureExists(id);

    const cotizaciones = await this.prisma.cotizacion.groupBy({
      by: ['estado'],
      where: { proyectoId: id },
      _count: true,
    });

    const stats = {
      totalCotizaciones: 0,
      enviadas: 0,
      enProceso: 0,
      aprobadas: 0,
      canceladas: 0,
    };

    cotizaciones.forEach((group) => {
      stats.totalCotizaciones += group._count;
      switch (group.estado) {
        case 'ENVIADA':
          stats.enviadas = group._count;
          break;
        case 'EN PROCESO':
          stats.enProceso = group._count;
          break;
        case 'APROBADA':
          stats.aprobadas = group._count;
          break;
        case 'CANCELADA':
          stats.canceladas = group._count;
          break;
      }
    });

    return stats;
  }

  /**
   * Método privado: Verificar que el proyecto existe
   */
  private async ensureExists(id: string) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }
  }
}
