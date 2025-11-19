import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de Compras
 * Una Compra se genera cuando una Cotización es APROBADA
 */
@Injectable()
export class CompraService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear compra desde cotización aprobada
   * Validaciones:
   * - Cotización debe estar APROBADA
   * - Todos los items deben tener precio seleccionado
   * - Solo supervisores pueden crear compras
   */
  async createFromCotizacion(cotizacionId: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden crear compras');
    }

    // Validar cotización
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        detalles: {
          include: {
            precios: {
              include: {
                proveedor: true
              }
            }
          }
        }
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (cotizacion.estado !== 'APROBADA') {
      throw new BadRequestException(
        `Solo se pueden crear compras desde cotizaciones APROBADAS. Estado actual: ${cotizacion.estado}`
      );
    }

    // Validar que todos los items tengan precio seleccionado
    const itemsSinPrecio = cotizacion.detalles.filter(d => !d.preciosId);
    if (itemsSinPrecio.length > 0) {
      throw new BadRequestException(
        `Hay ${itemsSinPrecio.length} item(s) sin precio seleccionado`
      );
    }

    // Verificar que no exista ya una compra para esta cotización
    const compraExistente = await this.prisma.compra.findFirst({
      where: { cotizacionId }
    });

    if (compraExistente) {
      throw new BadRequestException('Ya existe una compra para esta cotización');
    }

    // Crear compra con sus detalles en transacción
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear compra
      const compra = await tx.compra.create({
        data: {
          cotizacionId,
          estado: 'PENDIENTE'
        }
      });

      // 2. Crear detalles de compra desde los items de cotización
      const detallesData = cotizacion.detalles.map(detalle => ({
        compraId: compra.id,
        sku: detalle.sku,
        descripcionProducto: detalle.descripcionProducto,
        cantidad: detalle.cantidad,
        tipoUnidad: detalle.tipoUnidad,
        notas: detalle.notas,
        precio: detalle.precios!.precioDescuento || detalle.precios!.precio,
        proveedorId: detalle.precios!.proveedorId,
        estado: 'PRE-COMPRA'
      }));

      await tx.compraDetalle.createMany({
        data: detallesData
      });

      // 3. Crear registro de seguimiento
      await tx.seguimiento.create({
        data: {
          compraId: compra.id,
          userId: user.sub,
          tipo: 'CAMBIO_ESTADO',
          detalle: 'Compra creada desde cotización aprobada'
        }
      });

      // 4. Retornar compra completa
      return tx.compra.findUnique({
        where: { id: compra.id },
        include: {
          cotizacion: {
            select: {
              nombreCotizacion: true,
              solicitante: {
                select: { nombre: true, email: true }
              }
            }
          },
          detalles: {
            include: {
              proveedor: {
                select: { nombre: true }
              }
            }
          }
        }
      });
    });
  }

  /**
   * Listar compras con filtros
   */
  async list(filters?: {
    estado?: string;
    page?: number;
    pageSize?: number;
  }, user?: UserJwt) {
    const page = filters?.page || 1;
    const pageSize = Math.min(filters?.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.compra.count({ where }),
      this.prisma.compra.findMany({
        where,
        include: {
          cotizacion: {
            select: {
              nombreCotizacion: true,
              solicitante: {
                select: { id: true, nombre: true }
              }
            }
          },
          _count: {
            select: {
              detalles: true,
              seguimientos: true
            }
          }
        },
        orderBy: { creacion: 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return { page, pageSize, total, items };
  }

  /**
   * Obtener compra por ID con detalles completos
   */
  async findById(id: string, user: UserJwt) {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: {
        cotizacion: {
          include: {
            solicitante: {
              select: {
                id: true,
                nombre: true,
                email: true,
                departamento: {
                  select: { nombre: true }
                }
              }
            },
            tipo: {
              include: { area: true }
            },
            proyecto: true
          }
        },
        detalles: {
          include: {
            proveedor: true
          },
          orderBy: { descripcionProducto: 'asc' }
        },
        seguimientos: {
          include: {
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          },
          orderBy: { fecha: 'desc' },
          take: 20
        }
      }
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    // Calcular progreso
    const totalItems = compra.detalles.length;
    const itemsCompletados = compra.detalles.filter(d => d.estado === 'COMPLETADO').length;
    const progreso = totalItems > 0 ? (itemsCompletados / totalItems) * 100 : 0;

    return {
      ...compra,
      progreso: Math.round(progreso),
      itemsCompletados,
      totalItems
    };
  }

  /**
   * Marcar compra como completada
   * Solo si todos los items están COMPLETADO
   */
  async complete(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden completar compras');
    }

    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: {
        detalles: {
          select: { estado: true }
        }
      }
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (compra.estado === 'COMPLETADA') {
      throw new BadRequestException('La compra ya está completada');
    }

    // Validar que todos los items estén completados
    const itemsPendientes = compra.detalles.filter(d => d.estado !== 'COMPLETADO');
    if (itemsPendientes.length > 0) {
      throw new BadRequestException(
        `No se puede completar la compra. Hay ${itemsPendientes.length} item(s) pendiente(s)`
      );
    }

    // Actualizar estado y crear seguimiento
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.compra.update({
        where: { id },
        data: { estado: 'COMPLETADA' }
      });

      await tx.seguimiento.create({
        data: {
          compraId: id,
          userId: user.sub,
          tipo: 'CAMBIO_ESTADO',
          detalle: 'Compra marcada como completada'
        }
      });

      return updated;
    });
  }

  /**
   * Obtener resumen/estadísticas de una compra
   */
  async getStats(id: string) {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: {
        detalles: {
          select: { estado: true, precio: true }
        }
      }
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    const estadosCounts = compra.detalles.reduce((acc, d) => {
      acc[d.estado] = (acc[d.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMonto = compra.detalles.reduce(
      (sum, d) => sum + Number(d.precio),
      0
    );

    return {
      estado: compra.estado,
      totalItems: compra.detalles.length,
      itemsPorEstado: estadosCounts,
      montoTotal: totalMonto,
      fechaCreacion: compra.creacion,
      ultimaActualizacion: compra.actualizado
    };
  }

  /**
   * Verifica si el usuario es supervisor o administrador
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }
}