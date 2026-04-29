import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

@Injectable()
export class OrdenCompraService {
  constructor(private readonly prisma: PrismaService) {}

  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN' || role === 'JEFE_COMPRAS';
  }

  /**
   * Un producto es elegible para split hasta el estado "pagado" inclusive.
   * Campos posteriores (enFOB, enCIF, conBL, recibido) bloquean el split,
   * porque ya tienen historia de embarque/aduana asociada.
   */
  private esProductoElegible(ep: {
    enFOB: boolean;
    enCIF: boolean;
    recibido: boolean;
    conBL: boolean;
  }): boolean {
    return !(ep.enFOB || ep.enCIF || ep.recibido || ep.conBL);
  }

  /**
   * Crear nueva Orden de Compra dentro de una cotización, agrupando productos.
   */
  async crear(
    dto: { cotizacionId: string; nombre: string; estadoProductoIds: string[]; numeroOC?: string },
    user: UserJwt,
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'Solo supervisores/admin pueden crear órdenes de compra',
      );
    }

    const { cotizacionId, nombre, estadoProductoIds, numeroOC } = dto;

    if (!nombre?.trim()) {
      throw new BadRequestException('El nombre de la orden de compra es obligatorio');
    }
    if (!estadoProductoIds?.length) {
      throw new BadRequestException('Debe seleccionar al menos un producto');
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { id: true, nombreCotizacion: true, supervisorResponsableId: true },
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');

    if (nombre.trim().toLowerCase() === cotizacion.nombreCotizacion.trim().toLowerCase()) {
      throw new BadRequestException(
        'El nombre de la OC debe ser distinto al de la cotización original',
      );
    }

    // Una cotización solo se puede dividir si tiene al menos 2 productos distintos
    const totalDistintos = await this.prisma.estadoProducto.count({
      where: { cotizacionId },
    });
    if (totalDistintos < 2) {
      throw new BadRequestException(
        'La cotización debe tener al menos 2 productos distintos para poder dividirse',
      );
    }

    const duplicado = await this.prisma.ordenCompra.findUnique({
      where: { cotizacionId_nombre: { cotizacionId, nombre: nombre.trim() } },
    });
    if (duplicado) {
      throw new ConflictException('Ya existe una OC con ese nombre en esta cotización');
    }

    const productos = await this.prisma.estadoProducto.findMany({
      where: { id: { in: estadoProductoIds }, cotizacionId },
      select: {
        id: true,
        comprado: true,
        pagado: true,
        enFOB: true,
        enCIF: true,
        recibido: true,
        conBL: true,
      },
    });

    if (productos.length !== estadoProductoIds.length) {
      throw new BadRequestException(
        'Algunos productos no pertenecen a esta cotización o no existen',
      );
    }

    const noElegibles = productos.filter((p) => !this.esProductoElegible(p));
    if (noElegibles.length > 0) {
      throw new BadRequestException(
        `${noElegibles.length} producto(s) ya entraron en embarque (FOB/CIF/BL/recibido) y no se pueden mover`,
      );
    }

    // Si algún producto ya está "comprado", el numeroOC es obligatorio
    const hayComprado = productos.some((p) => p.comprado);
    if (hayComprado && !numeroOC?.trim()) {
      throw new BadRequestException(
        'El número de OC es obligatorio cuando se divide una OC con productos ya comprados',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.ordenCompra.create({
        data: {
          cotizacionId,
          nombre: nombre.trim(),
          numeroOC: numeroOC?.trim() || null,
        },
      });

      const epData: any = { ordenCompraId: orden.id };
      // Heredar el responsable de la cotización en los productos de la nueva OC
      if (cotizacion.supervisorResponsableId) {
        epData.responsableSeguimientoId = cotizacion.supervisorResponsableId;
      }

      await tx.estadoProducto.updateMany({
        where: { id: { in: estadoProductoIds } },
        data: epData,
      });

      return tx.ordenCompra.findUnique({
        where: { id: orden.id },
        include: { estadosProductos: { select: { id: true, sku: true } } },
      });
    });
  }

  /**
   * Actualizar nombre, numeroOC o estado de una OC.
   */
  async actualizar(
    id: string,
    dto: { nombre?: string; numeroOC?: string | null; estado?: string },
    user: UserJwt,
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores/admin pueden editar órdenes de compra');
    }

    const orden = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: { cotizacion: { select: { nombreCotizacion: true } } },
    });
    if (!orden) throw new NotFoundException('Orden de compra no encontrada');

    const data: any = {};
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre no puede estar vacío');
      if (nombre.toLowerCase() === orden.cotizacion.nombreCotizacion.trim().toLowerCase()) {
        throw new BadRequestException(
          'El nombre debe ser distinto al de la cotización original',
        );
      }
      const duplicado = await this.prisma.ordenCompra.findFirst({
        where: { cotizacionId: orden.cotizacionId, nombre, NOT: { id } },
      });
      if (duplicado) throw new ConflictException('Ya existe otra OC con ese nombre');
      data.nombre = nombre;
    }
    if (dto.numeroOC !== undefined) {
      data.numeroOC = dto.numeroOC?.trim() || null;
    }
    if (dto.estado !== undefined) {
      data.estado = dto.estado;
    }

    return this.prisma.ordenCompra.update({ where: { id }, data });
  }

  /**
   * Mover productos a otra OC (o quitar la asignación si ordenDestinoId=null).
   */
  async moverProductos(
    id: string,
    dto: { estadoProductoIds: string[]; ordenDestinoId: string | null },
    user: UserJwt,
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores/admin pueden mover productos');
    }

    const { estadoProductoIds, ordenDestinoId } = dto;
    if (!estadoProductoIds?.length) {
      throw new BadRequestException('Debe seleccionar al menos un producto');
    }

    const origen = await this.prisma.ordenCompra.findUnique({
      where: { id },
      select: { id: true, cotizacionId: true },
    });
    if (!origen) throw new NotFoundException('Orden de compra origen no encontrada');

    if (ordenDestinoId) {
      const destino = await this.prisma.ordenCompra.findUnique({
        where: { id: ordenDestinoId },
        select: { cotizacionId: true },
      });
      if (!destino) throw new NotFoundException('Orden de compra destino no encontrada');
      if (destino.cotizacionId !== origen.cotizacionId) {
        throw new BadRequestException('Las OCs deben pertenecer a la misma cotización');
      }
    }

    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        id: { in: estadoProductoIds },
        ordenCompraId: id,
      },
      select: {
        id: true,
        comprado: true,
        pagado: true,
        enFOB: true,
        enCIF: true,
        recibido: true,
        conBL: true,
      },
    });

    if (productos.length !== estadoProductoIds.length) {
      throw new BadRequestException(
        'Algunos productos no pertenecen a esta OC o no existen',
      );
    }

    const noElegibles = productos.filter((p) => !this.esProductoElegible(p));
    if (noElegibles.length > 0) {
      throw new BadRequestException(
        `${noElegibles.length} producto(s) ya entraron en embarque (FOB/CIF/BL/recibido) y no se pueden mover`,
      );
    }

    await this.prisma.estadoProducto.updateMany({
      where: { id: { in: estadoProductoIds } },
      data: { ordenCompraId: ordenDestinoId },
    });

    return { message: `${estadoProductoIds.length} producto(s) movidos`, ordenDestinoId };
  }

  /**
   * Agregar productos sin OC (cotización base) a una OC existente.
   * Útil cuando dividiste una OC y querés agregar más productos de la base
   * a esa OC sin tener que crear una nueva.
   */
  async agregarProductosDesdeBase(
    id: string,
    dto: { estadoProductoIds: string[] },
    user: UserJwt,
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'Solo supervisores/admin pueden agregar productos a una OC',
      );
    }

    const { estadoProductoIds } = dto;
    if (!estadoProductoIds?.length) {
      throw new BadRequestException('Debe seleccionar al menos un producto');
    }

    const destino = await this.prisma.ordenCompra.findUnique({
      where: { id },
      select: { id: true, cotizacionId: true },
    });
    if (!destino) throw new NotFoundException('Orden de compra destino no encontrada');

    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        id: { in: estadoProductoIds },
        cotizacionId: destino.cotizacionId,
        ordenCompraId: null,
      },
      select: {
        id: true,
        comprado: true,
        pagado: true,
        enFOB: true,
        enCIF: true,
        recibido: true,
        conBL: true,
      },
    });

    if (productos.length !== estadoProductoIds.length) {
      throw new BadRequestException(
        'Algunos productos no pertenecen a la cotización base de esta OC o ya están asignados a otra OC',
      );
    }

    const noElegibles = productos.filter((p) => !this.esProductoElegible(p));
    if (noElegibles.length > 0) {
      throw new BadRequestException(
        `${noElegibles.length} producto(s) ya entraron en embarque (FOB/CIF/BL/recibido) y no se pueden mover`,
      );
    }

    await this.prisma.estadoProducto.updateMany({
      where: { id: { in: estadoProductoIds } },
      data: { ordenCompraId: id },
    });

    return {
      message: `${estadoProductoIds.length} producto(s) agregados a la OC`,
      ordenCompraId: id,
    };
  }

  /**
   * Eliminar una OC. Los productos que tuviera asignados quedan con ordenCompraId=null
   * (gracias a onDelete: SetNull en la FK).
   */
  async eliminar(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores/admin pueden eliminar órdenes de compra');
    }

    const orden = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        estadosProductos: {
          select: { id: true, enFOB: true, enCIF: true, conBL: true, recibido: true },
        },
      },
    });
    if (!orden) throw new NotFoundException('Orden de compra no encontrada');

    const conEmbarque = orden.estadosProductos.some(
      (ep) => ep.enFOB || ep.enCIF || ep.conBL || ep.recibido,
    );
    if (conEmbarque) {
      throw new BadRequestException(
        'No se puede eliminar una OC con productos en embarque (FOB/CIF/BL/recibido). Mueva los productos primero.',
      );
    }

    await this.prisma.ordenCompra.delete({ where: { id } });
    return { message: 'Orden de compra eliminada' };
  }

  /**
   * Listar OCs de una cotización
   */
  async listarPorCotizacion(cotizacionId: string) {
    return this.prisma.ordenCompra.findMany({
      where: { cotizacionId },
      include: {
        estadosProductos: {
          select: { id: true, sku: true, descripcion: true },
        },
      },
      orderBy: { creacion: 'asc' },
    });
  }
}
