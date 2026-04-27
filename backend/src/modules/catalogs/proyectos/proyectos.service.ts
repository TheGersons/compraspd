import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

const PROYECTO_BASE_SELECT = {
  id: true,
  nombre: true,
  descripcion: true,
  criticidad: true,
  estado: true,
  creado: true,
  actualizado: true,
  areaId: true,
  tipoId: true,
  area: { select: { id: true, nombreArea: true, tipo: true } },
  tipo: { select: { id: true, nombre: true, areaId: true } },
} as const;

@Injectable()
export class ProyectosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar proyectos con filtros
   */
  async listProyectos(params?: {
    estado?: boolean;
    search?: string;
    areaId?: string;
    tipoId?: string;
  }) {
    const where: any = {};

    if (typeof params?.estado === 'boolean') {
      where.estado = params.estado;
    }

    if (params?.areaId) {
      where.areaId = params.areaId;
    }

    if (params?.tipoId) {
      where.tipoId = params.tipoId;
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
        ...PROYECTO_BASE_SELECT,
        _count: {
          select: { cotizaciones: true },
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
        area: { select: { id: true, nombreArea: true, tipo: true } },
        tipo: { select: { id: true, nombre: true, areaId: true } },
        cotizaciones: {
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            fechaSolicitud: true,
            solicitante: {
              select: { id: true, nombre: true, email: true },
            },
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10,
        },
        _count: { select: { cotizaciones: true } },
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
    const exists = await this.prisma.proyecto.findFirst({
      where: {
        nombre: { equals: data.nombre, mode: 'insensitive' },
      },
    });

    if (exists) {
      throw new ConflictException('Ya existe un proyecto con ese nombre');
    }

    if (
      data.criticidad !== undefined &&
      (data.criticidad < 1 || data.criticidad > 10)
    ) {
      throw new BadRequestException('La criticidad debe estar entre 1 y 10');
    }

    if (data.tipoId) {
      await this.validateTipoBelongsToArea(data.tipoId, data.areaId);
    }

    return this.prisma.proyecto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        criticidad: data.criticidad ?? 5,
        areaId: data.areaId || null,
        tipoId: data.tipoId || null,
        estado: true,
      },
      select: PROYECTO_BASE_SELECT,
    });
  }

  /**
   * Actualizar proyecto
   */
  async update(id: string, data: UpdateProyectoDto) {
    const existing = await this.prisma.proyecto.findUnique({
      where: { id },
      select: { id: true, areaId: true, tipoId: true },
    });

    if (!existing) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (data.nombre) {
      const exists = await this.prisma.proyecto.findFirst({
        where: {
          nombre: { equals: data.nombre, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (exists) {
        throw new ConflictException('Ya existe un proyecto con ese nombre');
      }
    }

    if (
      data.criticidad !== undefined &&
      (data.criticidad < 1 || data.criticidad > 10)
    ) {
      throw new BadRequestException('La criticidad debe estar entre 1 y 10');
    }

    // Resolver área y tipo finales para validar consistencia
    const finalAreaId =
      data.areaId !== undefined ? data.areaId : existing.areaId;
    const finalTipoId =
      data.tipoId !== undefined ? data.tipoId : existing.tipoId;

    if (finalTipoId) {
      if (!finalAreaId) {
        throw new BadRequestException(
          'El proyecto debe tener un área antes de asignarle un tipo',
        );
      }
      await this.validateTipoBelongsToArea(finalTipoId, finalAreaId);
    }

    // Si cambió el área pero no se reasignó tipo, limpiar el tipo (queda inconsistente)
    let tipoIdToWrite: string | null | undefined;
    if (data.tipoId !== undefined) {
      tipoIdToWrite = data.tipoId || null;
    } else if (data.areaId !== undefined && data.areaId !== existing.areaId) {
      tipoIdToWrite = null;
    } else {
      tipoIdToWrite = undefined;
    }

    return this.prisma.proyecto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        criticidad: data.criticidad,
        areaId: data.areaId !== undefined ? data.areaId : undefined,
        tipoId: tipoIdToWrite,
        estado: data.estado,
      },
      select: PROYECTO_BASE_SELECT,
    });
  }

  async close(id: string) {
    await this.ensureExists(id);
    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: false },
    });
  }

  async open(id: string) {
    await this.ensureExists(id);
    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: true },
    });
  }

  async delete(id: string) {
    await this.ensureExists(id);

    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        _count: { select: { cotizaciones: true } },
      },
    });

    if (proyecto!._count.cotizaciones > 0) {
      throw new BadRequestException(
        `No se puede eliminar el proyecto porque tiene ${proyecto!._count.cotizaciones} cotización(es) asociada(s). Ciérrelo en su lugar.`,
      );
    }

    await this.prisma.proyecto.delete({ where: { id } });
    return { message: 'Proyecto eliminado exitosamente' };
  }

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

  // ==========================================================================
  // Helpers privados
  // ==========================================================================

  private async ensureExists(id: string) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }
  }

  private async validateTipoBelongsToArea(tipoId: string, areaId: string) {
    const tipo = await this.prisma.tipo.findUnique({
      where: { id: tipoId },
      select: { id: true, areaId: true },
    });

    if (!tipo) {
      throw new BadRequestException('El tipo seleccionado no existe');
    }

    if (tipo.areaId !== areaId) {
      throw new BadRequestException(
        'El tipo seleccionado no pertenece al área indicada',
      );
    }
  }
}
