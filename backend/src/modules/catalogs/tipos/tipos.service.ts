import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';

@Injectable()
export class TiposService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todos los tipos
   */
  async listTipos(areaId?: string) {
    const where = areaId ? { areaId } : {};

    return this.prisma.tipo.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        areaId: true,
        creado: true,
        area: {
          select: {
            id: true,
            nombreArea: true
          }
        },
        _count: {
          select: {
            cotizaciones: true // Contar cotizaciones con este tipo
          }
        }
      },
      orderBy: [
        { area: { nombreArea: 'asc' } },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtener tipo por ID
   */
  async findById(id: string) {
    const tipo = await this.prisma.tipo.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            id: true,
            nombreArea: true
          }
        },
        _count: {
          select: { cotizaciones: true }
        }
      }
    });

    if (!tipo) {
      throw new NotFoundException('Tipo no encontrado');
    }

    return tipo;
  }

  /**
   * Crear nuevo tipo
   */
  async create(data: CreateTipoDto) {
    // Validar que el área exista
    const area = await this.prisma.area.findUnique({
      where: { id: data.areaId }
    });

    if (!area) {
      throw new BadRequestException('Área no encontrada');
    }

    // Validar que no exista un tipo con el mismo nombre en la misma área
    const exists = await this.prisma.tipo.findFirst({
      where: {
        areaId: data.areaId,
        nombre: {
          equals: data.nombre,
          mode: 'insensitive'
        }
      }
    });

    if (exists) {
      throw new ConflictException(
        `Ya existe un tipo con ese nombre en el área "${area.nombreArea}"`
      );
    }

    return this.prisma.tipo.create({
      data: {
        nombre: data.nombre,
        areaId: data.areaId
      },
      include: {
        area: {
          select: {
            id: true,
            nombreArea: true
          }
        }
      }
    });
  }

  /**
   * Actualizar tipo
   */
  async update(id: string, data: UpdateTipoDto) {
    await this.ensureExists(id);

    // Si se cambia el nombre o el área, validar unicidad
    if (data.nombre || data.areaId) {
      const current = await this.prisma.tipo.findUnique({
        where: { id }
      });

      const newNombre = data.nombre || current!.nombre;
      const newAreaId = data.areaId || current!.areaId;

      // Si se cambia el área, validar que exista
      if (data.areaId && data.areaId !== current!.areaId) {
        const area = await this.prisma.area.findUnique({
          where: { id: data.areaId }
        });
        if (!area) {
          throw new BadRequestException('Área no encontrada');
        }
      }

      const exists = await this.prisma.tipo.findFirst({
        where: {
          areaId: newAreaId,
          nombre: {
            equals: newNombre,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException(
          'Ya existe un tipo con ese nombre en el área seleccionada'
        );
      }
    }

    return this.prisma.tipo.update({
      where: { id },
      data: {
        nombre: data.nombre,
        areaId: data.areaId
      },
      include: {
        area: {
          select: {
            id: true,
            nombreArea: true
          }
        }
      }
    });
  }

  /**
   * Eliminar tipo
   */
  async remove(id: string) {
    await this.ensureExists(id);

    // Verificar que no tenga cotizaciones relacionadas
    const cotizacionesCount = await this.prisma.cotizacion.count({
      where: { tipoId: id }
    });

    if (cotizacionesCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el tipo. Tiene ${cotizacionesCount} cotización(es) relacionada(s)`
      );
    }

    await this.prisma.tipo.delete({
      where: { id }
    });

    return { ok: true, message: 'Tipo eliminado exitosamente' };
  }

  /**
   * Listar tipos por área
   */
  async findByArea(areaId: string) {
    // Validar que el área exista
    const area = await this.prisma.area.findUnique({
      where: { id: areaId }
    });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    return this.prisma.tipo.findMany({
      where: { areaId },
      select: {
        id: true,
        nombre: true,
        creado: true
      },
      orderBy: { nombre: 'asc' }
    });
  }

  /**
   * Método privado: Verificar que el tipo existe
   */
  private async ensureExists(id: string) {
    const tipo = await this.prisma.tipo.findUnique({ where: { id } });
    if (!tipo) {
      throw new NotFoundException('Tipo no encontrado');
    }
  }
}