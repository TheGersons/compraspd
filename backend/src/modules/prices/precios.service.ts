import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de precios/ofertas de proveedores
 * Los proveedores responden con precios a cada item de cotización
 */
@Injectable()
export class PreciosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear oferta de proveedor para un item de cotización
   * Validaciones:
   * - El detalle de cotización debe existir
   * - El proveedor debe existir y estar activo
   * - Solo supervisores/admin pueden crear precios
   */
  async create(dto: CreatePrecioDto, user: UserJwt) {
    // Validar permisos
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden registrar ofertas de proveedores');
    }

    // Validar detalle de cotización
    const detalle = await this.prisma.cotizacionDetalle.findUnique({
      where: { id: dto.cotizacionDetalleId },
      include: {
        cotizacion: {
          select: { estado: true, nombreCotizacion: true }
        }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de cotización no encontrado');
    }

    // Solo permitir ofertas si la cotización está EN_REVISION o ENVIADA
    if (!['ENVIADA', 'EN_REVISION', 'EN_CONFIGURACION', 'APROBADA_PARCIAL'].includes(detalle.cotizacion.estado)) {
      throw new BadRequestException(
        `No se pueden agregar ofertas a una cotización en estado ${detalle.cotizacion.estado}`
      );
    }

    // Validar proveedor
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: dto.proveedorId }
    });

    if (!proveedor || !proveedor.activo) {
      throw new NotFoundException('Proveedor no encontrado o inactivo');
    }

    // Validar que precio con descuento sea menor que precio normal
    if (dto.precioDescuento && dto.precioDescuento >= dto.precio) {
      throw new BadRequestException('El precio con descuento debe ser menor al precio normal');
    }

    return this.prisma.precios.create({
      data: {
        cotizacionDetalleId: dto.cotizacionDetalleId,
        precio: dto.precio,
        precioDescuento: dto.precioDescuento || null,
        proveedorId: dto.proveedorId,
        ComprobanteDescuento: dto.comprobanteDescuento || null,
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        cotizacionDetalle: {
          select: {
            id: true,
            descripcionProducto: true,
            cantidad: true,
            tipoUnidad: true
          }
        }
      }
    });
  }

  /**
   * Listar todas las ofertas de un item de cotización
   * Ordena por precio ascendente
   */
  async listByDetalle(cotizacionDetalleId: string, user: UserJwt) {
    // Validar acceso al detalle
    const detalle = await this.prisma.cotizacionDetalle.findUnique({
      where: { id: cotizacionDetalleId },
      include: {
        cotizacion: {
          select: {
            solicitanteId: true,
            estado: true
          }
        }
      }
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de cotización no encontrado');
    }

    // Validar permisos
    const isOwner = detalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver estas ofertas');
    }

    return this.prisma.precios.findMany({
      where: { cotizacionDetalleId },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            rtn: true,
            email: true,
            telefono: true
          }
        }
      },
      orderBy: [
        { precio: 'asc' }
      ]
    });
  }

  /**
   * Obtener una oferta específica
   */
  async findById(id: string, user: UserJwt) {
    const precio = await this.prisma.precios.findUnique({
      where: { id },
      include: {
        proveedor: true,
        cotizacionDetalle: {
          include: {
            cotizacion: {
              select: {
                id: true,
                nombreCotizacion: true,
                solicitanteId: true,
                estado: true
              }
            }
          }
        }
      }
    });

    if (!precio) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // Validar permisos
    const isOwner = precio.cotizacionDetalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver esta oferta');
    }

    return precio;
  }

  /**
   * Actualizar una oferta
   * Solo supervisores/admin pueden actualizar
   */
  async update(id: string, dto: UpdatePrecioDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar ofertas');
    }

    const current = await this.prisma.precios.findUnique({
      where: { id },
      include: {
        cotizacionDetalle: {
          include: {
            cotizacion: { select: { estado: true } }
          }
        }
      }
    });

    if (!current) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // Solo permitir edición si cotización está EN_REVISION o ENVIADA
    if (!['ENVIADA', 'EN_REVISION','EN_CONFIGURACION'].includes(current.cotizacionDetalle.cotizacion.estado)) {
      throw new BadRequestException(
        'No se pueden modificar ofertas de una cotización ya procesada'
      );
    }

    // Validar precio con descuento
    const nuevoPrecio = dto.precio || current.precio;
    if (dto.precioDescuento && dto.precioDescuento >= Number(nuevoPrecio)) {
      throw new BadRequestException('El precio con descuento debe ser menor al precio normal');
    }

    return this.prisma.precios.update({
      where: { id },
      data: {
        precio: dto.precio,
        precioDescuento: dto.precioDescuento,
        ComprobanteDescuento: dto.comprobanteDescuento
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
  }

  /**
   * Eliminar una oferta
   * Solo supervisores pueden eliminar
   */
  async delete(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden eliminar ofertas');
    }

    const precio = await this.prisma.precios.findUnique({
      where: { id },
      include: {
        cotizacionDetalle: {
          select: {
            preciosId: true // Verificar si está seleccionado
          }
        }
      }
    });

    if (!precio) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // No permitir eliminar si es la oferta seleccionada
    if (precio.cotizacionDetalle.preciosId === id) {
      throw new BadRequestException(
        'No se puede eliminar la oferta seleccionada. Primero selecciona otra.'
      );
    }

    await this.prisma.precios.delete({
      where: { id }
    });

    return { ok: true, message: 'Oferta eliminada exitosamente' };
  }

  /**
   * Seleccionar una oferta como ganadora
   * Actualiza el campo preciosId en CotizacionDetalle
   */
  async selectOffer(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden seleccionar ofertas');
    }

    const precio = await this.prisma.precios.findUnique({
      where: { id },
      include: {
        cotizacionDetalle: {
          include: {
            cotizacion: { select: { estado: true, id: true } }
          }
        }
      }
    });

    if (!precio) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // Solo permitir selección en estado EN_CONFIGURACION o EN_REVISION
    if (precio.cotizacionDetalle.cotizacion.estado !== 'EN_REVISION' && precio.cotizacionDetalle.cotizacion.estado !== 'EN_CONFIGURACION') {
      throw new BadRequestException(
        `Solo se pueden seleccionar ofertas cuando la cotización está EN_REVISION` +
        ` o EN_CONFIGURACION. Estado actual: ${precio.cotizacionDetalle.cotizacion.estado}`
         
      );
    }

    // Actualizar detalle para marcar esta oferta como seleccionada
    await this.prisma.cotizacionDetalle.update({
      where: { id: precio.cotizacionDetalleId },
      data: {
        preciosId: id
      }
    });

    return {
      ok: true,
      message: 'Oferta seleccionada exitosamente',
      precioId: id
    };
  }

  /**
   * Obtener comparativa de precios por cotización
   * Agrupa todas las ofertas por item
   */
  async getComparativaByCotizacion(cotizacionId: string, user: UserJwt) {
    // Validar acceso a la cotización
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { solicitanteId: true }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    const isOwner = cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para ver esta comparativa');
    }

    // Obtener todos los detalles con sus ofertas
    const detalles = await this.prisma.cotizacionDetalle.findMany({
      where: { cotizacionId },
      include: {
        preciosOfertas: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombre: true
              }
            }
          },
          orderBy: { precio: 'asc' }
        }
      },
      orderBy: { descripcionProducto: 'asc' }
    });

    return detalles.map(detalle => ({
      id: detalle.id,
      descripcionProducto: detalle.descripcionProducto,
      cantidad: detalle.cantidad,
      tipoUnidad: detalle.tipoUnidad,
      ofertas: detalle.preciosOfertas,
      ofertaSeleccionada: detalle.preciosId
    }));
  }

  /**
   * Verifica si el usuario es supervisor o administrador
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }


  /**
   * Solicitar descuento para un precio
   * Guarda el comprobante (imagen/link) de la solicitud
   */
  async solicitarDescuento(
    precioId: string,
    comprobanteDescuento: string,
    user: UserJwt
  ) {
    const precio = await this.prisma.precios.findUnique({
      where: { id: precioId },
      include: {
        cotizacionDetalle: {
          include: {
            cotizacion: {
              select: { solicitanteId: true },
            },
          },
        },
      },
    });

    if (!precio) {
      throw new NotFoundException('Precio no encontrado');
    }

    // Validar permisos
    const isOwner = precio.cotizacionDetalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para solicitar descuento');
    }

    // Validar que el comprobante no esté vacío
    if (!comprobanteDescuento || comprobanteDescuento.trim() === '') {
      throw new BadRequestException('Debe proporcionar un comprobante de descuento');
    }

    // Actualizar el precio con el comprobante
    const precioActualizado = await this.prisma.precios.update({
      where: { id: precioId },
      data: {
        ComprobanteDescuento: comprobanteDescuento,
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return {
      ok: true,
      message: 'Descuento solicitado correctamente',
      precio: precioActualizado,
    };
  }

  /**
   * Agregar resultado de descuento
   * Si fue aprobado: precioDescuento < precio
   * Si fue denegado: precioDescuento = precio
   */
  async resultadoDescuento(
    precioId: string,
    precioDescuento: number,
    user: UserJwt
  ) {
    const precio = await this.prisma.precios.findUnique({
      where: { id: precioId },
      include: {
        cotizacionDetalle: {
          include: {
            cotizacion: {
              select: { solicitanteId: true },
            },
          },
        },
      },
    });

    if (!precio) {
      throw new NotFoundException('Precio no encontrado');
    }

    // Validar permisos
    const isOwner = precio.cotizacionDetalle.cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException('No tienes permiso para agregar resultado de descuento');
    }

    // Validar que se haya solicitado descuento primero
    if (!precio.ComprobanteDescuento) {
      throw new BadRequestException(
        'Debe solicitar el descuento antes de agregar el resultado'
      );
    }

    // Validar que el precio de descuento sea válido
    if (precioDescuento <= 0) {
      throw new BadRequestException('El precio de descuento debe ser mayor a 0');
    }

    // Actualizar el precio con el descuento
    const precioActualizado = await this.prisma.precios.update({
      where: { id: precioId },
      data: {
        precioDescuento: precioDescuento,
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Determinar si fue aprobado o denegado
    const fueAprobado = Number(precioDescuento) < Number(precio.precio);
    const mensaje = fueAprobado
      ? 'Descuento aprobado y registrado'
      : 'Descuento denegado y registrado';

    return {
      ok: true,
      message: mensaje,
      precio: precioActualizado,
      aprobado: fueAprobado,
    };
  }
  
}