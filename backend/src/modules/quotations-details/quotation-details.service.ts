import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuotationDetailDto } from './dto/create-detail.dto';
import { UpdateQuotationDetailDto } from './dto/update-detail.dto';
import { BulkUpdateDetailsDto } from './dto/bulk-update-details.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de detalles de cotización (items individuales)
 * Basado en tabla: CotizacionDetalle
 */
@Injectable()
export class QuotationDetailsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea un nuevo detalle/item en una cotización existente
   * Validaciones:
   * - La cotización debe existir
   * - El usuario debe ser el dueño o supervisor
   * - La cotización debe estar en estado editable (ENVIADA o EN_REVISION)
   */
  async create(dto: CreateQuotationDetailDto, user: UserJwt) {
    // Verificar que la cotización existe y obtener su info
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: dto.cotizacionId },
      select: {
        id: true,
        solicitanteId: true,
        estado: true,
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar permisos
    const isOwner = cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para modificar esta cotización');
    }

    // Validar estado editable
    if (!['ENVIADA', 'EN_REVISION'].includes(cotizacion.estado)) {
      throw new BadRequestException(
        `No se pueden agregar items a una cotización en estado ${cotizacion.estado}`
      );
    }

    // Crear el detalle
    return this.prisma.cotizacionDetalle.create({
      data: {
        cotizacionId: dto.cotizacionId,
        sku: dto.sku || null,
        descripcionProducto: dto.descripcionProducto,
        cantidad: dto.cantidad,
        tipoUnidad: dto.tipoUnidad,
        notas: dto.notas || null,
      },
      include: {
        cotizacion: {
          select: {
            nombreCotizacion: true,
            estado: true,
          }
        }
      }
    });
  }

  /**
   * Lista todos los detalles de una cotización
   * Incluye información de precios si existen
   */
  async listByCotizacion(cotizacionId: string, user: UserJwt) {
    // Verificar acceso a la cotización
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: {
        id: true,
        solicitanteId: true,
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar permisos
    const isOwner = cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver esta cotización');
    }

    // Obtener detalles con precios
    return this.prisma.cotizacionDetalle.findMany({
      where: { cotizacionId },
      include: {
        precios: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombre: true,
              }
            }
          }
        },
        preciosOfertas: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombre: true,
              }
            }
          },
          orderBy: {
            precio: 'asc' // Ordenar por precio ascendente
          }
        }
      },
      orderBy: {
        descripcionProducto: 'asc'
      }
    });
  }

  /**
   * Obtiene un detalle específico por ID
   */
  async getById(id: string, user: UserJwt) {
    const detalle = await this.prisma.cotizacionDetalle.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            solicitanteId: true,
            estado: true,
          }
        },
        precios: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombre: true,
              }
            }
          }
        },
        preciosOfertas: {
          include: {
            proveedor: true
          }
        }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    // Validar permisos
    const isOwner = detalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver este detalle');
    }

    return detalle;
  }

  /**
   * Actualiza un detalle existente
   * Solo permite editar si la cotización está en estado ENVIADA o EN_REVISION
   */
  async update(id: string, dto: UpdateQuotationDetailDto, user: UserJwt) {
    // Obtener detalle con info de cotización
    const current = await this.prisma.cotizacionDetalle.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: {
            id: true,
            solicitanteId: true,
            estado: true,
          }
        }
      }
    });

    if (!current) {
      throw new NotFoundException('Detalle no encontrado');
    }

    // Validar permisos
    const isOwner = current.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    const canEdit =
      (isOwner && current.cotizacion.estado === 'ENVIADA') ||
      (isSupervisor && ['ENVIADA', 'EN_REVISION'].includes(current.cotizacion.estado));

    if (!canEdit) {
      throw new ForbiddenException(
        'No puedes editar este detalle en el estado actual de la cotización'
      );
    }

    // Actualizar
    return this.prisma.cotizacionDetalle.update({
      where: { id },
      data: {
        sku: dto.sku !== undefined ? dto.sku : current.sku,
        descripcionProducto: dto.descripcionProducto ?? current.descripcionProducto,
        cantidad: dto.cantidad ?? current.cantidad,
        tipoUnidad: dto.tipoUnidad ?? current.tipoUnidad,
        notas: dto.notas !== undefined ? dto.notas : current.notas,
      },
      include: {
        cotizacion: {
          select: {
            nombreCotizacion: true,
            estado: true,
          }
        }
      }
    });
  }

  /**
   * Elimina un detalle de cotización
   * Solo permite eliminar si:
   * - Es el dueño y estado = ENVIADA
   * - Es supervisor y estado = ENVIADA o EN_REVISION
   * - No hay precios asociados (oferta de proveedores)
   */
  async delete(id: string, user: UserJwt) {
    // Obtener detalle con info completa
    const detalle = await this.prisma.cotizacionDetalle.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: {
            id: true,
            solicitanteId: true,
            estado: true,
          }
        },
        preciosOfertas: {
          select: { id: true }
        }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    // Validar permisos
    const isOwner = detalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    const canDelete =
      (isOwner && detalle.cotizacion.estado === 'ENVIADA') ||
      (isSupervisor && ['ENVIADA', 'EN_REVISION'].includes(detalle.cotizacion.estado));

    if (!canDelete) {
      throw new ForbiddenException(
        'No puedes eliminar este detalle en el estado actual de la cotización'
      );
    }

    // Validar que no tenga precios asociados
    if (detalle.preciosOfertas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un item que ya tiene ofertas de proveedores. ' +
        'Primero elimina las ofertas asociadas.'
      );
    }

    // Eliminar
    await this.prisma.cotizacionDetalle.delete({
      where: { id }
    });

    return {
      message: 'Detalle eliminado exitosamente',
      id,
    };
  }

  /**
   * Actualización masiva de detalles de una cotización
   * Permite crear, actualizar y eliminar múltiples items en una sola transacción
   * Útil para edición completa de la cotización desde el frontend
   */
  async bulkUpdate(
    cotizacionId: string,
    dto: BulkUpdateDetailsDto,
    user: UserJwt
  ) {
    // Verificar cotización
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: {
        id: true,
        solicitanteId: true,
        estado: true,
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar permisos
    const isOwner = cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    const canEdit =
      (isOwner && cotizacion.estado === 'ENVIADA') ||
      (isSupervisor && ['ENVIADA', 'EN_REVISION'].includes(cotizacion.estado));

    if (!canEdit) {
      throw new ForbiddenException(
        'No puedes editar los detalles en el estado actual de la cotización'
      );
    }

    // Ejecutar operaciones en transacción
    return this.prisma.$transaction(async (tx) => {
      const results = {
        created: [] as any[],
        updated: [] as any[],
        deleted: [] as string[],
      };

      // 1. Eliminar items
      if (dto.deleteIds && dto.deleteIds.length > 0) {
        // Validar que los items pertenezcan a esta cotización
        const itemsToDelete = await tx.cotizacionDetalle.findMany({
          where: {
            id: { in: dto.deleteIds },
            cotizacionId,
          },
          select: {
            id: true,
            preciosOfertas: { select: { id: true } }
          }
        });

        // Verificar que no tengan precios asociados
        const itemsWithPrices = itemsToDelete.filter(
          item => item.preciosOfertas.length > 0
        );

        if (itemsWithPrices.length > 0) {
          throw new BadRequestException(
            `No se pueden eliminar items con ofertas de proveedores: ${itemsWithPrices.map(i => i.id).join(', ')}`
          );
        }

        await tx.cotizacionDetalle.deleteMany({
          where: {
            id: { in: dto.deleteIds },
            cotizacionId,
          }
        });

        results.deleted = dto.deleteIds;
      }

      // 2. Crear/Actualizar items
      for (const item of dto.items) {
        if (item.id) {
          // Actualizar existente
          const updated = await tx.cotizacionDetalle.update({
            where: { id: item.id },
            data: {
              sku: item.sku,
              descripcionProducto: item.descripcionProducto,
              cantidad: item.cantidad,
              tipoUnidad: item.tipoUnidad,
              notas: item.notas,
            }
          });
          results.updated.push(updated);
        } else {
          // Crear nuevo
          const created = await tx.cotizacionDetalle.create({
            data: {
              cotizacionId,
              sku: item.sku || null,
              descripcionProducto: item.descripcionProducto!,
              cantidad: item.cantidad!,
              tipoUnidad: item.tipoUnidad!,
              notas: item.notas || null,
            }
          });
          results.created.push(created);
        }
      }

      return results;
    });
  }

  /**
   * Verifica si el usuario es supervisor o administrador
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }



  async getByEstadoProductoId(estadoProductoId: string, user: UserJwt) {
    // Buscar el estado_producto
    const estadoProducto = await this.prisma.estadoProducto.findUnique({
      where: { id: estadoProductoId },
      include: {
        cotizacionDetalle: {
          include: {
            cotizacion: {
              select: {
                id: true,
                nombreCotizacion: true,
                solicitanteId: true,
              }
            },
            precios: {
              include: {
                proveedor: {
                  select: {
                    id: true,
                    nombre: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!estadoProducto || !estadoProducto.cotizacionDetalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    const detalle = estadoProducto.cotizacionDetalle;

    // Validar permisos
    const isOwner = detalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver este detalle');
    }

    return detalle;
  }
}