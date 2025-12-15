import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTimelineSKUDto,
  UpdateTimelineSKUDto,
  ListTimelineSKUQueryDto
} from './dto/timeline-sku.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de TimelineSKU
 * Configuración de tiempos estimados por SKU
 */
@Injectable()
export class TimelineSKUService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear configuración de timeline para un SKU
   */
  async create(dto: CreateTimelineSKUDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden crear configuraciones de timeline');
    }

    // Verificar que no exista ya un timeline para este SKU
    const existing = await this.prisma.timelineSKU.findUnique({
      where: { sku: dto.sku }
    });

    if (existing) {
      throw new BadRequestException(`Ya existe una configuración de timeline para el SKU: ${dto.sku}`);
    }

    // Calcular total de días
    const diasTotalesEstimados = this.calcularDiasTotales(dto);

    return this.prisma.timelineSKU.create({
      data: {
        ...dto,
        diasTotalesEstimados
      },
      include: {
        paisOrigen: {
          select: { nombre: true, codigo: true }
        }
      }
    });
  }

  /**
   * Listar configuraciones de timeline con filtros
   */
  async list(filters: ListTimelineSKUQueryDto, user: UserJwt) {
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.medioTransporte) where.medioTransporte = filters.medioTransporte;
    if (filters.paisOrigenId) where.paisOrigenId = filters.paisOrigenId;
    if (filters.sku) {
      where.sku = {
        contains: filters.sku,
        mode: 'insensitive'
      };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.timelineSKU.count({ where }),
      this.prisma.timelineSKU.findMany({
        where,
        include: {
          paisOrigen: {
            select: { nombre: true, codigo: true }
          }
        },
        orderBy: { actualizado: 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return {
      page,
      pageSize,
      total,
      items
    };
  }

  /**
   * Obtener timeline de un SKU específico
   */
  async findBySKU(sku: string, user: UserJwt) {
    const timeline = await this.prisma.timelineSKU.findUnique({
      where: { sku },
      include: {
        paisOrigen: {
          select: { nombre: true, codigo: true }
        }
      }
    });

    if (!timeline) {
      throw new NotFoundException(`No se encontró configuración de timeline para el SKU: ${sku}`);
    }

    return timeline;
  }

  /**
   * Obtener timeline por ID
   */
  async findById(id: string, user: UserJwt) {
    const timeline = await this.prisma.timelineSKU.findUnique({
      where: { id },
      include: {
        paisOrigen: {
          select: { nombre: true, codigo: true }
        }
      }
    });

    if (!timeline) {
      throw new NotFoundException('Timeline no encontrado');
    }

    return timeline;
  }

  /**
   * Actualizar configuración de timeline
   */
  async update(sku: string, dto: UpdateTimelineSKUDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar configuraciones de timeline');
    }

    const existing = await this.prisma.timelineSKU.findUnique({
      where: { sku }
    });

    if (!existing) {
      throw new NotFoundException(`No se encontró configuración de timeline para el SKU: ${sku}`);
    }

    // Calcular nuevo total de días
    const updatedData = { ...existing, ...dto };
    const diasTotalesEstimados = this.calcularDiasTotales(updatedData);

    return this.prisma.timelineSKU.update({
      where: { sku },
      data: {
        ...dto,
        diasTotalesEstimados
      },
      include: {
        paisOrigen: {
          select: { nombre: true, codigo: true }
        }
      }
    });
  }

  /**
   * Eliminar configuración de timeline
   */
  async delete(sku: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden eliminar configuraciones de timeline');
    }

    const existing = await this.prisma.timelineSKU.findUnique({
      where: { sku }
    });

    if (!existing) {
      throw new NotFoundException(`No se encontró configuración de timeline para el SKU: ${sku}`);
    }

    return this.prisma.timelineSKU.delete({
      where: { sku }
    });
  }

  /**
   * Obtener resumen de configuraciones
   */
  async getStats(user: UserJwt) {
    const [
      total,
      porMedioTransporte,
      promedios
    ] = await this.prisma.$transaction([
      // Total de configuraciones
      this.prisma.timelineSKU.count(),

      // Conteo por medio de transporte
      this.prisma.timelineSKU.groupBy({
        by: ['medioTransporte'],
        _count: {
          _all: true
        },
        orderBy: {
          medioTransporte: 'asc'
        }
      }),

      // Promedios de días
      this.prisma.timelineSKU.aggregate({
        _avg: {
          diasTotalesEstimados: true
        }
      })
    ]);

    return {
      total,
      porMedioTransporte: porMedioTransporte.reduce((acc, item) => {
        const count = typeof item._count === 'object' ? item._count._all : 0;
        acc[item.medioTransporte] = count || 0;
        return acc;
      }, {} as Record<string, number>),
      promedios: {
        diasTotales: Math.round(promedios._avg.diasTotalesEstimados || 0)
      }
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Calcular total de días sumando solo los campos no nulos
   */
  private calcularDiasTotales(data: any): number {
    const campos = [
      'diasCotizadoADescuento',
      'diasDescuentoAComprado',
      'diasCompradoAPagado',
      'diasPagadoASeguimiento1',
      'diasSeguimiento1AFob',
      'diasFobABl',
      'diasBlASeguimiento2',
      'diasSeguimiento2ACif',
      'diasCifARecibido'
    ];

    return campos.reduce((total, campo) => {
      const valor = data[campo];
      return total + (valor !== null && valor !== undefined ? Number(valor) : 0);
    }, 0);
  }

  /**
   * Verificar si es supervisor o admin
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }
}