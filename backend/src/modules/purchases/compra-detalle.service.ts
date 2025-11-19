import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateEstadoDetalleDto } from './dto/update-estado-detalle.dto';
import { UpdateFechasDetalleDto } from './dto/update-fechas-detalle.dto';

type UserJwt = { sub: string; role?: string };

const ESTADOS_VALIDOS = ['PRE-COMPRA', 'FABRICACION', 'FORS', 'CIF', 'COMPLETADO'] as const;
type EstadoCompraDetalle = typeof ESTADOS_VALIDOS[number];

/**
 * Service para gestión de detalles de compra con tracking logístico
 */
@Injectable()
export class CompraDetalleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar detalles de una compra
   */
  async listByCompra(compraId: string, user: UserJwt) {
    const compra = await this.prisma.compra.findUnique({
      where: { id: compraId }
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    return this.prisma.compraDetalle.findMany({
      where: { compraId },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true
          }
        }
      },
      orderBy: { descripcionProducto: 'asc' }
    });
  }

  /**
   * Obtener detalle específico
   */
  async findById(id: string, user: UserJwt) {
    const detalle = await this.prisma.compraDetalle.findUnique({
      where: { id },
      include: {
        compra: {
          include: {
            cotizacion: {
              select: {
                nombreCotizacion: true,
                solicitante: {
                  select: { nombre: true, email: true }
                }
              }
            }
          }
        },
        proveedor: true,
        seguimientos: {
          include: {
            usuario: {
              select: { nombre: true, email: true }
            }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    return detalle;
  }

  /**
   * Cambiar estado del detalle
   * Estados: PRE-COMPRA → FABRICACION → FORS → CIF → COMPLETADO
   */
  async updateEstado(id: string, dto: UpdateEstadoDetalleDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar estados');
    }

    const detalle = await this.prisma.compraDetalle.findUnique({
      where: { id },
      include: {
        compra: { select: { estado: true, id: true } }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    if (detalle.compra.estado === 'COMPLETADA') {
      throw new BadRequestException('No se puede modificar una compra completada');
    }

    // Validar estado
    if (!ESTADOS_VALIDOS.includes(dto.estado as any)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`
      );
    }

    // Actualizar en transacción
    return this.prisma.$transaction(async (tx) => {
      // Actualizar detalle
      const updated = await tx.compraDetalle.update({
        where: { id },
        data: {
          estado: dto.estado,
          // Actualizar fecha correspondiente según el estado
          ...(dto.estado === 'PRE-COMPRA' && { fechaCompra: new Date() }),
          ...(dto.estado === 'FABRICACION' && { fechaFabricacion: new Date() }),
          ...(dto.estado === 'FORS' && { fechaFors: new Date() }),
          ...(dto.estado === 'CIF' && { fechaCif: new Date() }),
          ...(dto.estado === 'COMPLETADO' && { fechaRecibido: new Date() })
        }
      });

      // Crear registro de seguimiento
      await tx.seguimiento.create({
        data: {
          compraId: detalle.compraId,
          compraDetalleId: id,
          userId: user.sub,
          tipo: 'CAMBIO_ESTADO',
          detalle: `Estado actualizado a: ${dto.estado}${dto.comentario ? `. ${dto.comentario}` : ''}`
        }
      });

      return updated;
    });
  }

  /**
   * Actualizar fechas manualmente
   */
  async updateFechas(id: string, dto: UpdateFechasDetalleDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar fechas');
    }

    const detalle = await this.prisma.compraDetalle.findUnique({
      where: { id }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.compraDetalle.update({
        where: { id },
        data: {
          fechaCompra: dto.fechaCompra ? new Date(dto.fechaCompra) : undefined,
          fechaFabricacion: dto.fechaFabricacion ? new Date(dto.fechaFabricacion) : undefined,
          fechaFors: dto.fechaFors ? new Date(dto.fechaFors) : undefined,
          fechaCif: dto.fechaCif ? new Date(dto.fechaCif) : undefined,
          fechaRecibido: dto.fechaRecibido ? new Date(dto.fechaRecibido) : undefined
        }
      });

      await tx.seguimiento.create({
        data: {
          compraId: detalle.compraId,
          compraDetalleId: id,
          userId: user.sub,
          tipo: 'CAMBIO_ESTADO',
          detalle: 'Fechas de tracking actualizadas manualmente'
        }
      });

      return updated;
    });
  }

  /**
   * Obtener timeline/historial de un detalle
   */
  async getTimeline(id: string, user: UserJwt) {
    const detalle = await this.prisma.compraDetalle.findUnique({
      where: { id },
      select: {
        fechaCompra: true,
        fechaFabricacion: true,
        fechaFors: true,
        fechaCif: true,
        fechaRecibido: true,
        estado: true
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    return {
      estadoActual: detalle.estado,
      timeline: [
        { estado: 'PRE-COMPRA', fecha: detalle.fechaCompra, completado: !!detalle.fechaCompra },
        { estado: 'FABRICACION', fecha: detalle.fechaFabricacion, completado: !!detalle.fechaFabricacion },
        { estado: 'FORS', fecha: detalle.fechaFors, completado: !!detalle.fechaFors },
        { estado: 'CIF', fecha: detalle.fechaCif, completado: !!detalle.fechaCif },
        { estado: 'COMPLETADO', fecha: detalle.fechaRecibido, completado: !!detalle.fechaRecibido }
      ]
    };
  }

  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }
}