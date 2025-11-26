import { 
  BadRequestException, 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todas las áreas
   */
  async listAreas() {
    return this.prisma.area.findMany({
      select: {
        id: true,
        nombreArea: true,
        creado: true,
        _count: {
          select: {
            tipos: true // Contar tipos relacionados
          }
        }
      },
      orderBy: { nombreArea: 'asc' }
    });
  }

  /**
   * Obtener área por ID con sus tipos
   */
  async findById(id: string) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        tipos: {
          select: {
            id: true,
            nombre: true,
            creado: true
          },
          orderBy: { nombre: 'asc' }
        }
      }
    });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    return area;
  }

  /**
   * Crear nueva área
   */
  async create(data: CreateAreaDto) {
    // Validar que el nombre no exista
    const exists = await this.prisma.area.findFirst({
      where: {
        nombreArea: {
          equals: data.nombreArea,
          mode: 'insensitive'
        }
      }
    });

    if (exists) {
      throw new ConflictException('Ya existe un área con ese nombre');
    }

    return this.prisma.area.create({
      data: {
        nombreArea: data.nombreArea,
        tipo: data.tipo
      },
      select: {
        id: true,
        nombreArea: true,
        creado: true
      }
    });
  }

  /**
   * Actualizar área
   */
  async update(id: string, data: UpdateAreaDto) {
    await this.ensureExists(id);

    // Validar que el nuevo nombre no exista
    if (data.nombreArea) {
      const exists = await this.prisma.area.findFirst({
        where: {
          nombreArea: {
            equals: data.nombreArea,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe un área con ese nombre');
      }
    }

    return this.prisma.area.update({
      where: { id },
      data: {
        nombreArea: data.nombreArea
      },
      select: {
        id: true,
        nombreArea: true,
        creado: true
      }
    });
  }

  /**
   * Eliminar área
   */
  async remove(id: string) {
    await this.ensureExists(id);

    // Verificar que no tenga tipos relacionados
    const tiposCount = await this.prisma.tipo.count({
      where: { areaId: id }
    });

    if (tiposCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el área. Tiene ${tiposCount} tipo(s) relacionado(s)`
      );
    }

    await this.prisma.area.delete({
      where: { id }
    });

    return { ok: true, message: 'Área eliminada exitosamente' };
  }

  /**
   * Método privado: Verificar que el área existe
   */
  private async ensureExists(id: string) {
    const area = await this.prisma.area.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }
  }
}