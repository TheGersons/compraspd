import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MedioTransporte } from '@prisma/client';
import { ActualizarTimelineDto } from './dto/actualizar-timeline.dto';

/**
 * Service para gestión de timelines por SKU
 * Permite reutilizar configuraciones de tiempo para productos similares
 */
@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene timeline existente para un SKU
   * Return null si no existe
   */
  async getTimelineBySKU(sku: string) {
    const timeline = await this.prisma.timelineSKU.findUnique({
      where: { sku },
      include: {
        paisOrigen: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        }
      }
    });

    return timeline;
  }

  /**
   * Lista todos los timelines configurados
   * Útil para ver qué SKUs ya tienen configuración
   */
  async listTimelines(filters?: {
    paisOrigenId?: string;
    medioTransporte?: MedioTransporte;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.paisOrigenId) {
      where.paisOrigenId = filters.paisOrigenId;
    }

    if (filters?.medioTransporte) {
      where.medioTransporte = filters.medioTransporte;
    }

    if (filters?.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { notas: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.timelineSKU.findMany({
      where,
      include: {
        paisOrigen: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        }
      },
      orderBy: { actualizado: 'desc' }
    });
  }

  /**
   * Actualiza timeline de un SKU
   * Solo actualiza los campos proporcionados
   */
  async actualizarTimeline(sku: string, dto: ActualizarTimelineDto) {
    // Verificar que existe
    const timeline = await this.prisma.timelineSKU.findUnique({
      where: { sku }
    });

    if (!timeline) {
      throw new NotFoundException(`Timeline para SKU ${sku} no encontrado`);
    }

    const updateData: any = {};

    if (dto.paisOrigenId !== undefined) {
      updateData.paisOrigenId = dto.paisOrigenId;
    }

    if (dto.medioTransporte !== undefined) {
      updateData.medioTransporte = dto.medioTransporte;
    }

    if (dto.notas !== undefined) {
      updateData.notas = dto.notas;
    }

    if (dto.timeline) {
      // Actualizar días individuales
      if (dto.timeline.diasCotizadoADescuento !== undefined) {
        updateData.diasCotizadoADescuento = dto.timeline.diasCotizadoADescuento;
      }
      if (dto.timeline.diasDescuentoAComprado !== undefined) {
        updateData.diasDescuentoAComprado = dto.timeline.diasDescuentoAComprado;
      }
      if (dto.timeline.diasCompradoAPagado !== undefined) {
        updateData.diasCompradoAPagado = dto.timeline.diasCompradoAPagado;
      }
      if (dto.timeline.diasPagadoASeguimiento1 !== undefined) {
        updateData.diasPagadoASeguimiento1 = dto.timeline.diasPagadoASeguimiento1;
      }
      if (dto.timeline.diasSeguimiento1AFob !== undefined) {
        updateData.diasSeguimiento1AFob = dto.timeline.diasSeguimiento1AFob;
      }
      if (dto.timeline.diasFobABl !== undefined) {
        updateData.diasFobABl = dto.timeline.diasFobABl;
      }
      if (dto.timeline.diasBlASeguimiento2 !== undefined) {
        updateData.diasBlASeguimiento2 = dto.timeline.diasBlASeguimiento2;
      }
      if (dto.timeline.diasSeguimiento2ACif !== undefined) {
        updateData.diasSeguimiento2ACif = dto.timeline.diasSeguimiento2ACif;
      }
      if (dto.timeline.diasCifARecibido !== undefined) {
        updateData.diasCifARecibido = dto.timeline.diasCifARecibido;
      }

      // Recalcular días totales
      const timelineActualizado = { ...timeline, ...updateData };
      updateData.diasTotalesEstimados = this.calcularDiasTotales(timelineActualizado);
    }

    return this.prisma.timelineSKU.update({
      where: { sku },
      data: updateData,
      include: {
        paisOrigen: true
      }
    });
  }

  /**
   * Elimina timeline de un SKU
   * Solo si no hay productos activos usando este timeline
   */
  async eliminarTimeline(sku: string) {
    // Verificar que no hay productos activos con este SKU
    const productosActivos = await this.prisma.estadoProducto.count({
      where: {
        sku,
        cotizacion: {
          estado: { notIn: ['COMPLETADA', 'CANCELADA'] }
        }
      }
    });

    if (productosActivos > 0) {
      throw new BadRequestException(
        `No se puede eliminar: ${productosActivos} producto(s) activo(s) usando este timeline`
      );
    }

    await this.prisma.timelineSKU.delete({
      where: { sku }
    });

    return { message: 'Timeline eliminado exitosamente' };
  }

  /**
   * Calcula días totales de un timeline
   */
  private calcularDiasTotales(timeline: any): number {
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
      return total + (timeline[campo] || 0);
    }, 0);
  }

  /**
   * Sugiere timeline basado en SKUs similares
   * Busca por coincidencia parcial de SKU
   */
  async sugerirTimelineSimilar(sku: string) {
    // Estrategia 1: Buscar exacto
    const exacto = await this.getTimelineBySKU(sku);
    if (exacto) {
      return { tipo: 'exacto', timeline: exacto };
    }

    // Estrategia 2: Buscar por prefijo (primeros 5 caracteres)
    if (sku.length >= 5) {
      const prefijo = sku.substring(0, 5);
      const similares = await this.prisma.timelineSKU.findMany({
        where: {
          sku: {
            startsWith: prefijo,
            mode: 'insensitive'
          }
        },
        include: {
          paisOrigen: true
        },
        take: 3,
        orderBy: { actualizado: 'desc' }
      });

      if (similares.length > 0) {
        return { tipo: 'similar', timelines: similares };
      }
    }

    // Estrategia 3: Más recientes del mismo medio de transporte
    const recientes = await this.prisma.timelineSKU.findMany({
      include: {
        paisOrigen: true
      },
      orderBy: { actualizado: 'desc' },
      take: 5
    });

    return { tipo: 'recientes', timelines: recientes };
  }
}