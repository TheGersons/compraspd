import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const ESTADOS_NACIONAL = [
  'cotizado',
  'conDescuento',
  'aprobacionCompra',
  'comprado',
  'pagado',
  'recibido',
];
const ESTADOS_INTERNACIONAL = [
  'cotizado',
  'conDescuento',
  'aprobacionCompra',
  'comprado',
  'pagado',
  'aprobacionPlanos',
  'primerSeguimiento',
  'enFOB',
  'cotizacionFleteInternacional',
  'conBL',
  'segundoSeguimiento',
  'enCIF',
  'recibido',
];

const FECHA_MAP: Record<string, string> = {
  cotizado: 'fechaCotizado',
  conDescuento: 'fechaConDescuento',
  aprobacionCompra: 'fechaAprobacionCompra',
  comprado: 'fechaComprado',
  pagado: 'fechaPagado',
  aprobacionPlanos: 'fechaAprobacionPlanos',
  primerSeguimiento: 'fechaPrimerSeguimiento',
  enFOB: 'fechaEnFOB',
  cotizacionFleteInternacional: 'fechaCotizacionFleteInternacional',
  conBL: 'fechaConBL',
  segundoSeguimiento: 'fechaSegundoSeguimiento',
  enCIF: 'fechaEnCIF',
  recibido: 'fechaRecibido',
};

@Injectable()
export class OfertasService {
  constructor(private readonly prisma: PrismaService) {}

  private isSupervisorOrAdmin(user: UserJwt) {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }

  private calcularProgreso(producto: any, tipoCompra: string): number {
    const estados =
      tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    const completados = estados.filter((e) => producto[e]).length;
    return Math.round((completados / estados.length) * 100);
  }

  private estadoActual(producto: any, tipoCompra: string): string {
    const estados =
      tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
    let ultimo = estados[0];
    for (const e of estados) {
      if (producto[e]) ultimo = e;
    }
    return ultimo;
  }

  // ============================================
  // LISTAR
  // ============================================
  async list(estado = 'ACTIVA', user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const ofertas = await this.prisma.oferta.findMany({
      where: { estado },
      include: {
        cotizacion: {
          select: {
            tipoCompra: true,
            fechaSolicitud: true,
            fechaLimite: true,
            solicitante: { select: { id: true, nombre: true } },
            proyecto: { select: { id: true, nombre: true } },
          },
        },
        productos: true,
      },
      orderBy: { creado: 'desc' },
    });

    return ofertas.map((o) => {
      const tipoCompra = o.cotizacion.tipoCompra;
      const totalProductos = o.productos.length;
      const productosCompletados = o.productos.filter(
        (p) => this.calcularProgreso(p, tipoCompra) === 100,
      ).length;
      const progreso =
        totalProductos > 0
          ? Math.round((productosCompletados / totalProductos) * 100)
          : 0;

      return {
        id: o.id,
        nombre: o.nombre,
        estado: o.estado,
        motivoArchivo: o.motivoArchivo,
        fechaArchivo: o.fechaArchivo,
        tipoCompra,
        creado: o.creado,
        fechaSolicitud: o.cotizacion.fechaSolicitud,
        fechaLimite: o.cotizacion.fechaLimite,
        cotizacionId: o.cotizacionId,
        solicitante: o.cotizacion.solicitante,
        proyecto: o.cotizacion.proyecto,
        totalProductos,
        productosCompletados,
        progreso,
      };
    });
  }

  // ============================================
  // DETALLE
  // ============================================
  async getById(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const oferta = await this.prisma.oferta.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: {
            tipoCompra: true,
            fechaSolicitud: true,
            fechaLimite: true,
            solicitante: { select: { id: true, nombre: true } },
            proyecto: { select: { id: true, nombre: true } },
          },
        },
        productos: {
          include: {
            responsable: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    const tipoCompra = oferta.cotizacion.tipoCompra;
    const estadosAplicables =
      tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;

    return {
      id: oferta.id,
      nombre: oferta.nombre,
      estado: oferta.estado,
      tipoCompra,
      cotizacionId: oferta.cotizacionId,
      fechaSolicitud: oferta.cotizacion.fechaSolicitud,
      fechaLimite: oferta.cotizacion.fechaLimite,
      solicitante: oferta.cotizacion.solicitante,
      proyecto: oferta.cotizacion.proyecto,
      totalProductos: oferta.productos.length,
      productosCompletados: oferta.productos.filter(
        (p) => this.calcularProgreso(p, tipoCompra) === 100,
      ).length,
      progreso:
        oferta.productos.length > 0
          ? Math.round(
              oferta.productos.reduce(
                (s, p) => s + this.calcularProgreso(p, tipoCompra),
                0,
              ) / oferta.productos.length,
            )
          : 0,
      productos: oferta.productos.map((p) => ({
        ...p,
        estadoActual: this.estadoActual(p, tipoCompra),
        progreso: this.calcularProgreso(p, tipoCompra),
        estadosAplicables,
        precioUnitario: p.precioUnitario ? Number(p.precioUnitario) : null,
        precioTotal: p.precioTotal ? Number(p.precioTotal) : null,
      })),
    };
  }

  // ============================================
  // AVANZAR ESTADO DE PRODUCTO
  // ============================================
  async avanzarEstado(
    productoId: string,
    user: UserJwt,
    observaciones?: string,
  ) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const producto = await this.prisma.ofertaProducto.findUnique({
      where: { id: productoId },
      include: {
        oferta: {
          select: { id: true, cotizacion: { select: { tipoCompra: true } } },
        },
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');

    const tipoCompra = producto.oferta.cotizacion.tipoCompra;
    const estados =
      tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;

    // Encontrar siguiente estado
    const actual = this.estadoActual(producto, tipoCompra);
    const idx = estados.indexOf(actual);
    if (idx >= estados.length - 1)
      throw new BadRequestException('El producto ya está en el último estado');

    const siguiente = estados[idx + 1];
    const fechaField = FECHA_MAP[siguiente];

    await this.prisma.ofertaProducto.update({
      where: { id: productoId },
      data: {
        [siguiente]: true,
        [fechaField]: new Date(),
        ...(observaciones ? { observaciones } : {}),
      },
    });

    return { message: `Avanzado a ${siguiente}` };
  }

  // ============================================
  // ARCHIVAR MANUAL
  // ============================================
  async archivar(id: string, motivo: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const oferta = await this.prisma.oferta.findUnique({ where: { id } });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (oferta.estado !== 'ACTIVA')
      throw new BadRequestException('Solo se pueden archivar ofertas activas');

    return this.prisma.oferta.update({
      where: { id },
      data: {
        estado: 'ARCHIVADA',
        motivoArchivo: motivo,
        fechaArchivo: new Date(),
        archivadaPorId: user.sub,
      },
    });
  }

  // ============================================
  // REACTIVAR
  // ============================================
  async reactivar(id: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const oferta = await this.prisma.oferta.findUnique({ where: { id } });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    return this.prisma.oferta.update({
      where: { id },
      data: {
        estado: 'ACTIVA',
        motivoArchivo: null,
        fechaArchivo: null,
        archivadaPorId: null,
      },
    });
  }

  // ============================================
  // RECHAZAR
  // ============================================
  async rechazar(id: string, motivo: string, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user))
      throw new ForbiddenException('Solo supervisores');

    const oferta = await this.prisma.oferta.findUnique({ where: { id } });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');

    return this.prisma.oferta.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        motivoArchivo: motivo,
        fechaArchivo: new Date(),
        archivadaPorId: user.sub,
      },
    });
  }
}
