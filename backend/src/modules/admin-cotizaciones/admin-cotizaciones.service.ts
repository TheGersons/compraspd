import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCotizacionAdminDto } from './dto/update-cotizacion-admin.dto';
import { UpdateEstadoProductoAdminDto } from './dto/update-estado-producto-admin.dto';
import { DeleteCotizacionAdminDto } from './dto/delete-cotizacion-admin.dto';

type UserJwt = { sub: string; email?: string; role?: string };

@Injectable()
export class AdminCotizacionesService {
  private readonly logger = new Logger(AdminCotizacionesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // AUTORIZACIÓN
  // ============================================================================

  private ensureAdmin(user: UserJwt) {
    const role = (user?.role || '').toUpperCase();
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Solo administradores pueden acceder a este recurso');
    }
  }

  private async verifyPassword(userId: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { passwordHash: true, activo: true },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no válido');
    }
    const ok = await bcrypt.compare(password, usuario.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
  }

  // ============================================================================
  // LISTAR
  // ============================================================================

  async listAll(
    user: UserJwt,
    params: {
      search?: string;
      estado?: string;
      tipoCompra?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    this.ensureAdmin(user);
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));

    const where: any = {};
    if (params.search) {
      where.OR = [
        { nombreCotizacion: { contains: params.search, mode: 'insensitive' } },
        { ordenCompra: { contains: params.search, mode: 'insensitive' } },
        {
          solicitante: {
            nombre: { contains: params.search, mode: 'insensitive' },
          },
        },
        {
          proyecto: { nombre: { contains: params.search, mode: 'insensitive' } },
        },
      ];
    }
    if (params.estado) where.estado = params.estado;
    if (params.tipoCompra) where.tipoCompra = params.tipoCompra;

    const [total, items] = await Promise.all([
      this.prisma.cotizacion.count({ where }),
      this.prisma.cotizacion.findMany({
        where,
        orderBy: { fechaSolicitud: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          nombreCotizacion: true,
          tipoCompra: true,
          estado: true,
          fechaSolicitud: true,
          fechaLimite: true,
          ordenCompra: true,
          solicitante: { select: { id: true, nombre: true } },
          supervisorResponsable: { select: { id: true, nombre: true } },
          proyecto: { select: { id: true, nombre: true } },
          tipo: { select: { id: true, nombre: true, area: { select: { id: true, nombreArea: true } } } },
          moneda: { select: { id: true, codigo: true } },
          _count: {
            select: {
              detalles: true,
              estadosProductos: true,
              compras: true,
              ordenesCompra: true,
              historial: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items,
    };
  }

  // ============================================================================
  // DETALLE COMPLETO (para inspección antes de borrado)
  // ============================================================================

  async getDetalle(user: UserJwt, id: string) {
    this.ensureAdmin(user);
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        solicitante: { select: { id: true, nombre: true, email: true } },
        supervisorResponsable: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true, areaId: true, area: { select: { id: true, nombreArea: true } } } },
        tipo: { select: { id: true, nombre: true, area: { select: { id: true, nombreArea: true } } } },
        moneda: { select: { id: true, codigo: true, nombre: true } },
        chat: {
          select: {
            id: true,
            _count: { select: { mensajes: true, participantes: true } },
          },
        },
        detalles: {
          select: {
            id: true,
            sku: true,
            descripcionProducto: true,
            cantidad: true,
            tipoUnidad: true,
            notas: true,
          },
        },
        estadosProductos: {
          select: {
            id: true,
            sku: true,
            descripcion: true,
            cantidad: true,
            proveedor: true,
            precioUnitario: true,
            precioTotal: true,
            paisOrigenId: true,
            paisOrigen: { select: { id: true, nombre: true } },
            monedaId: true,
            moneda: { select: { id: true, codigo: true } },
            responsableSeguimiento: { select: { id: true, nombre: true } },
            estadoGeneral: true,
            criticidad: true,
            ordenCompra: { select: { id: true, nombre: true, numeroOC: true } },
          },
        },
        ordenesCompra: { select: { id: true, nombre: true, numeroOC: true, estado: true } },
        compras: {
          select: {
            id: true,
            estado: true,
            creacion: true,
            _count: { select: { detalles: true } },
          },
        },
        historial: {
          take: 10,
          orderBy: { creado: 'desc' },
          select: { id: true, accion: true, creado: true, usuario: { select: { nombre: true } } },
        },
        licitacion: { select: { id: true, nombre: true, estado: true } },
        oferta: { select: { id: true, nombre: true, estado: true } },
        reporte: { select: { id: true, numeroPO: true } },
        seguimientoInternacional: { select: { id: true, numeroOC: true } },
        _count: {
          select: {
            detalles: true,
            estadosProductos: true,
            compras: true,
            ordenesCompra: true,
            historial: true,
          },
        },
      },
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return cotizacion;
  }

  /**
   * Resumen de qué se eliminará (para mostrar en el modal de confirmación).
   */
  async getResumenEliminacion(user: UserJwt, id: string) {
    this.ensureAdmin(user);
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id },
      select: { id: true, nombreCotizacion: true, chatId: true },
    });
    if (!cot) throw new NotFoundException('Cotización no encontrada');

    const [
      detalles,
      estadosProductos,
      ordenesCompra,
      compras,
      compraDetallesAgg,
      historial,
      mensajes,
      participantes,
      adjuntos,
      documentosAdjuntos,
      historialFechas,
      seguimientos,
      licitacionProductos,
      ofertaProductos,
      reporteCompraLogs,
      seguimientoIntLogs,
    ] = await Promise.all([
      this.prisma.cotizacionDetalle.count({ where: { cotizacionId: id } }),
      this.prisma.estadoProducto.count({ where: { cotizacionId: id } }),
      this.prisma.ordenCompra.count({ where: { cotizacionId: id } }),
      this.prisma.compra.count({ where: { cotizacionId: id } }),
      this.prisma.compraDetalle.count({ where: { compra: { cotizacionId: id } } }),
      this.prisma.historialCotizacion.count({ where: { cotizacionId: id } }),
      cot.chatId
        ? this.prisma.mensaje.count({ where: { chatId: cot.chatId } })
        : 0,
      cot.chatId
        ? this.prisma.participantesChat.count({ where: { chatId: cot.chatId } })
        : 0,
      cot.chatId
        ? this.prisma.adjuntos.count({ where: { mensaje: { chatId: cot.chatId } } })
        : 0,
      this.prisma.documentoAdjunto.count({
        where: { estadoProducto: { cotizacionId: id } },
      }),
      this.prisma.historialFechaLimite.count({
        where: { estadoProducto: { cotizacionId: id } },
      }),
      this.prisma.seguimiento.count({
        where: { compra: { cotizacionId: id } },
      }),
      this.prisma.licitacionProducto.count({
        where: { licitacion: { cotizacionId: id } },
      }),
      this.prisma.ofertaProducto.count({
        where: { oferta: { cotizacionId: id } },
      }),
      this.prisma.reporteCompraLog.count({
        where: { reporte: { cotizacionId: id } },
      }),
      this.prisma.seguimientoInternacionalLog.count({
        where: { seguimiento: { cotizacionId: id } },
      }),
    ]);

    return {
      id,
      nombreCotizacion: cot.nombreCotizacion,
      tieneChat: !!cot.chatId,
      conteos: {
        detalles,
        estadosProductos,
        ordenesCompra,
        compras,
        compraDetalles: compraDetallesAgg,
        historial,
        mensajes,
        participantesChat: participantes,
        adjuntos,
        documentosAdjuntos,
        historialFechas,
        seguimientos,
        licitacionProductos,
        ofertaProductos,
        reporteCompraLogs,
        seguimientoIntLogs,
      },
    };
  }

  // ============================================================================
  // UPDATE COTIZACIÓN (con propagación)
  // ============================================================================

  async updateCotizacion(
    user: UserJwt,
    id: string,
    dto: UpdateCotizacionAdminDto,
  ) {
    this.ensureAdmin(user);

    const existing = await this.prisma.cotizacion.findUnique({
      where: { id },
      select: {
        id: true,
        proyectoId: true,
        solicitanteId: true,
        supervisorResponsableId: true,
        tipoId: true,
        monedaId: true,
        tipoCompra: true,
      },
    });
    if (!existing) throw new NotFoundException('Cotización no encontrada');

    // Construir data para Cotizacion
    const data: any = {};
    if (dto.nombreCotizacion !== undefined) data.nombreCotizacion = dto.nombreCotizacion;
    if (dto.tipoId !== undefined) data.tipoId = dto.tipoId;
    if (dto.solicitanteId !== undefined) data.solicitanteId = dto.solicitanteId;
    if (dto.supervisorResponsableId !== undefined)
      data.supervisorResponsableId = dto.supervisorResponsableId;
    if (dto.proyectoId !== undefined) data.proyectoId = dto.proyectoId;
    if (dto.monedaId !== undefined) data.monedaId = dto.monedaId;
    if (dto.tipoCompra !== undefined) data.tipoCompra = dto.tipoCompra;
    if (dto.lugarEntrega !== undefined) data.lugarEntrega = dto.lugarEntrega;
    if (dto.fechaLimite !== undefined) data.fechaLimite = new Date(dto.fechaLimite);
    if (dto.fechaEstimada !== undefined) data.fechaEstimada = new Date(dto.fechaEstimada);
    if (dto.comentarios !== undefined) data.comentarios = dto.comentarios;
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.ordenCompra !== undefined) data.ordenCompra = dto.ordenCompra;

    // Validaciones de existencia para FKs
    if (dto.tipoId) {
      const t = await this.prisma.tipo.findUnique({ where: { id: dto.tipoId } });
      if (!t) throw new BadRequestException('Tipo no encontrado');
    }
    if (dto.solicitanteId) {
      const u = await this.prisma.usuario.findUnique({ where: { id: dto.solicitanteId } });
      if (!u) throw new BadRequestException('Solicitante no encontrado');
    }
    if (dto.supervisorResponsableId) {
      const u = await this.prisma.usuario.findUnique({ where: { id: dto.supervisorResponsableId } });
      if (!u) throw new BadRequestException('Supervisor no encontrado');
    }
    if (dto.proyectoId) {
      const p = await this.prisma.proyecto.findUnique({ where: { id: dto.proyectoId } });
      if (!p) throw new BadRequestException('Proyecto no encontrado');
    }

    // Transacción: actualiza la cotización + propaga a tablas relacionadas
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.cotizacion.update({ where: { id }, data });

      // Propagación a EstadoProducto: proyectoId
      if (
        dto.proyectoId !== undefined &&
        dto.proyectoId !== existing.proyectoId
      ) {
        await tx.estadoProducto.updateMany({
          where: { cotizacionId: id },
          data: { proyectoId: dto.proyectoId },
        });
      }

      this.logger.log(
        `Admin ${user.sub} actualizó cotización ${id}. Campos: ${Object.keys(data).join(', ')}`,
      );

      return updated;
    });
  }

  // ============================================================================
  // UPDATE ESTADO PRODUCTO (precio, proveedor, moneda...)
  // ============================================================================

  async updateEstadoProducto(
    user: UserJwt,
    id: string,
    dto: UpdateEstadoProductoAdminDto,
  ) {
    this.ensureAdmin(user);

    const existing = await this.prisma.estadoProducto.findUnique({
      where: { id },
      select: { id: true, cotizacionDetalleId: true, compraDetalleId: true },
    });
    if (!existing) throw new NotFoundException('Producto no encontrado');

    const data: any = {};
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.proveedor !== undefined) data.proveedor = dto.proveedor;
    if (dto.precioUnitario !== undefined) data.precioUnitario = dto.precioUnitario;
    if (dto.precioTotal !== undefined) data.precioTotal = dto.precioTotal;
    if (dto.cantidad !== undefined) data.cantidad = dto.cantidad;
    if (dto.monedaId !== undefined) data.monedaId = dto.monedaId;
    if (dto.paisOrigenId !== undefined) data.paisOrigenId = dto.paisOrigenId;
    if (dto.responsableSeguimientoId !== undefined)
      data.responsableSeguimientoId = dto.responsableSeguimientoId;
    if (dto.observaciones !== undefined) data.observaciones = dto.observaciones;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.estadoProducto.update({ where: { id }, data });

      // Propagar SKU/descripción/cantidad a CotizacionDetalle si existe relación
      if (existing.cotizacionDetalleId) {
        const detalleData: any = {};
        if (dto.sku !== undefined) detalleData.sku = dto.sku;
        if (dto.descripcion !== undefined) detalleData.descripcionProducto = dto.descripcion;
        if (dto.cantidad !== undefined) detalleData.cantidad = dto.cantidad;
        if (Object.keys(detalleData).length > 0) {
          await tx.cotizacionDetalle.update({
            where: { id: existing.cotizacionDetalleId },
            data: detalleData,
          });
        }
      }

      // Propagar a CompraDetalle si existe
      if (existing.compraDetalleId) {
        const compraData: any = {};
        if (dto.sku !== undefined) compraData.sku = dto.sku;
        if (dto.descripcion !== undefined) compraData.descripcionProducto = dto.descripcion;
        if (dto.cantidad !== undefined) compraData.cantidad = dto.cantidad;
        if (dto.precioUnitario !== undefined) compraData.precio = dto.precioUnitario;
        if (dto.monedaId !== undefined) compraData.monedaId = dto.monedaId;
        if (Object.keys(compraData).length > 0) {
          await tx.compraDetalle.update({
            where: { id: existing.compraDetalleId },
            data: compraData,
          });
        }
      }

      this.logger.log(
        `Admin ${user.sub} actualizó estadoProducto ${id}. Campos: ${Object.keys(data).join(', ')}`,
      );

      return updated;
    });
  }

  // ============================================================================
  // DELETE COMPLETO (transacción con verificación de password)
  // ============================================================================

  async deleteCompleto(
    user: UserJwt,
    id: string,
    dto: DeleteCotizacionAdminDto,
  ) {
    this.ensureAdmin(user);
    await this.verifyPassword(user.sub, dto.password);

    const cot = await this.prisma.cotizacion.findUnique({
      where: { id },
      select: { id: true, nombreCotizacion: true, chatId: true },
    });
    if (!cot) throw new NotFoundException('Cotización no encontrada');

    // Transacción
    await this.prisma.$transaction(async (tx) => {
      // 1. Borrar Compras (Compra.cotizacionId tiene onDelete: Restrict)
      //    Cascade: CompraDetalle, Seguimiento, EstadoProducto (por compraId/compraDetalleId)
      await tx.compra.deleteMany({ where: { cotizacionId: id } });

      // 2. Borrar la Cotización
      //    Cascade: CotizacionDetalle (+ Precios), EstadoProducto por cotizacionId
      //             (+ DocumentoAdjunto, JustificacionNoAplica, HistorialFechaLimite),
      //             OrdenCompra, HistorialCotizacion, Licitacion + LicitacionProducto,
      //             Oferta + OfertaProducto, ReporteCompra + Logs,
      //             SeguimientoInternacional + Logs
      //    chatId queda SetNull en Chat (que sigue existiendo y debemos borrar después)
      await tx.cotizacion.delete({ where: { id } });

      // 3. Borrar Chat asociado (si existía)
      //    Cascade: Mensaje (+ Adjuntos), ParticipantesChat
      if (cot.chatId) {
        await tx.chat.delete({ where: { id: cot.chatId } });
      }
    });

    this.logger.warn(
      `Admin ${user.sub} eliminó completamente la cotización ${id} ("${cot.nombreCotizacion}")` +
        (dto.motivo ? `. Motivo: ${dto.motivo}` : ''),
    );

    return {
      ok: true,
      id,
      nombreCotizacion: cot.nombreCotizacion,
    };
  }

  // ============================================================================
  // CATÁLOGOS para selectores en el frontend (admin reusa pero los listamos aquí
  // para evitar prompts cruzados de permisos)
  // ============================================================================

  async getCatalogosEdicion(user: UserJwt) {
    this.ensureAdmin(user);
    const [tipos, proyectos, monedas, usuarios, paises] = await Promise.all([
      this.prisma.tipo.findMany({
        select: { id: true, nombre: true, area: { select: { id: true, nombreArea: true } } },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.proyecto.findMany({
        where: { estado: true },
        select: { id: true, nombre: true, areaId: true, tipoId: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.moneda.findMany({
        select: { id: true, codigo: true, nombre: true },
        orderBy: { codigo: 'asc' },
      }),
      this.prisma.usuario.findMany({
        where: { activo: true },
        select: { id: true, nombre: true, email: true, rol: { select: { nombre: true } } },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.pais.findMany({
        select: { id: true, nombre: true, codigo: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);
    return { tipos, proyectos, monedas, usuarios, paises };
  }
}
