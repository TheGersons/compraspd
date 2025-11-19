import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
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
        { descripcion: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.proyecto.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        creado: true,
        actualizado: true,
        _count: {
          select: {
            cotizaciones: true // Contar cotizaciones del proyecto
          }
        }
      },
      orderBy: { creado: 'desc' }
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
                email: true
              }
            }
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10 // Últimas 10 cotizaciones
        },
        _count: {
          select: { cotizaciones: true }
        }
      }
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
          mode: 'insensitive'
        }
      }
    });

    if (exists) {
      throw new ConflictException('Ya existe un proyecto con ese nombre');
    }

    return this.prisma.proyecto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: true
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        creado: true
      }
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
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un proyecto con ese nombre');
      }
    }

    return this.prisma.proyecto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        actualizado: true
      }
    });
  }

  /**
   * Cerrar proyecto (cambiar estado a inactivo)
   */
  async close(id: string) {
    await this.ensureExists(id);

    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: false }
    });
  }

  /**
   * Abrir proyecto (cambiar estado a activo)
   */
  async open(id: string) {
    await this.ensureExists(id);

    return this.prisma.proyecto.update({
      where: { id },
      data: { estado: true }
    });
  }

  /**
   * Obtener estadísticas del proyecto
   */
  async getStats(id: string) {
    await this.ensureExists(id);

    const cotizaciones = await this.prisma.cotizacion.groupBy({
      by: ['estado'],
      where: { proyectoId: id },
      _count: true
    });

    const stats = {
      totalCotizaciones: 0,
      enviadas: 0,
      enProceso: 0,
      aprobadas: 0,
      canceladas: 0
    };

    cotizaciones.forEach(group => {
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