import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const LICITACION_TIPO_ID = '552548ae-4fb7-45a5-88f6-d02b8af0dfdd';

@Injectable()
export class LicitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async esLicitacion(cotizacionId: string): Promise<boolean> {
    const cot = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { tipoId: true },
    });
    return cot?.tipoId === LICITACION_TIPO_ID;
  }

  /**
   * Crea licitación desde cotización aprobada usando métodos nativos de Prisma
   */
  async crearDesdeCotizacion(cotizacionId: string, tx?: any) {
    const prisma = tx || this.prisma;

    // 1. Buscar cotización con sus productos aprobados
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        estadosProductos: {
          where: { aprobadoPorSupervisor: true },
        },
      },
    });

    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');

    // 2. Verificar si ya existe una licitación (Usando findUnique gracias a @unique en el schema)
    const existente = await prisma.licitacion.findUnique({
      where: { cotizacionId: cotizacionId },
      select: { id: true },
    });

    if (existente) return { licitacionId: existente.id };

    // 3. Crear Licitación y sus productos en una sola operación (Nested Write)
    const nuevaLicitacion = await prisma.licitacion.create({
      data: {
        cotizacionId: cotizacion.id,
        nombre: cotizacion.nombreCotizacion,
        productos: {
          create: cotizacion.estadosProductos.map((ep) => ({
            estadoProductoId: ep.id,
            cotizacionId: cotizacionId,
            sku: ep.sku,
            descripcion: ep.descripcion,
            cotizado: true,
            conDescuento: true,
            proveedor: ep.proveedor,
            precioUnitario: ep.precioUnitario,
            precioTotal: ep.precioTotal,
            cantidad: ep.cantidad,
            tipoCompra: cotizacion.tipoCompra || 'NACIONAL',
            fechaCotizado: ep.fechaCotizado,
            fechaConDescuento: ep.fechaConDescuento,
          })),
        },
      },
    });

    return { licitacionId: nuevaLicitacion.id };
  }

  /**
   * Listar licitaciones con filtros nativos
   */
  async listar(estado?: string) {
    const licitaciones = await this.prisma.licitacion.findMany({
      where: {
        ...(estado && estado !== 'TODAS' ? { estado } : {}),
      },
      include: {
        cotizacion: {
          include: {
            solicitante: true,
            proyecto: true,
          },
        },
        _count: {
          select: { productos: true },
        },
        // Para productos completados, lo filtramos en el map o con un query aparte
        productos: {
          select: { recibido: true },
        },
      },
      orderBy: { actualizado: 'desc' },
    });

    return licitaciones.map((l) => {
      const totalProductos = l._count.productos;
      const productosCompletados = l.productos.filter((p) => p.recibido).length;

      return {
        id: l.id,
        nombre: l.nombre,
        estado: l.estado,
        motivoArchivo: l.motivoArchivo,
        fechaArchivo: l.fechaArchivo,
        creado: l.creado,
        cotizacionId: l.cotizacionId,
        tipoCompra: l.cotizacion.tipoCompra,
        fechaSolicitud: l.cotizacion.fechaSolicitud,
        fechaLimite: l.cotizacion.fechaLimite,
        solicitante: {
          id: l.cotizacion.solicitante.id,
          nombre: l.cotizacion.solicitante.nombre,
          email: l.cotizacion.solicitante.email,
        },
        proyecto: l.cotizacion.proyecto
          ? {
              id: l.cotizacion.proyecto.id,
              nombre: l.cotizacion.proyecto.nombre,
            }
          : null,
        totalProductos,
        productosCompletados,
        progreso:
          totalProductos > 0
            ? Math.round((productosCompletados / totalProductos) * 100)
            : 0,
      };
    });
  }

  /**
   * Detalle de licitación
   */
  async getDetalle(licitacionId: string) {
    const lic = await this.prisma.licitacion.findUnique({
      where: { id: licitacionId },
      include: {
        cotizacion: {
          include: {
            solicitante: true,
            proyecto: true,
          },
        },
        productos: {
          include: { responsable: true },
          orderBy: { creado: 'asc' },
        },
      },
    });

    if (!lic) throw new NotFoundException('Licitación no encontrada');

    const tipoCompra = lic.cotizacion.tipoCompra || 'NACIONAL';
    const estados =
      tipoCompra === 'NACIONAL'
        ? [
            'cotizado',
            'conDescuento',
            'aprobacionCompra',
            'comprado',
            'pagado',
            'primerSeguimiento',
            'recibido',
          ]
        : [
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

    return {
      id: lic.id,
      nombre: lic.nombre,
      estado: lic.estado,
      motivoArchivo: lic.motivoArchivo,
      tipoCompra,
      nombreCotizacion: lic.cotizacion.nombreCotizacion,
      fechaSolicitud: lic.cotizacion.fechaSolicitud,
      fechaLimite: lic.cotizacion.fechaLimite,
      solicitante: {
        id: lic.cotizacion.solicitante.id,
        nombre: lic.cotizacion.solicitante.nombre,
      },
      proyecto: lic.cotizacion.proyecto
        ? { nombre: lic.cotizacion.proyecto.nombre }
        : null,
      productos: lic.productos.map((p: any) => {
        // Lógica de cálculo de estado actual y progreso (se mantiene igual)
        let completados = 0;
        let estadoActual = estados[0];

        estados.forEach((e) => {
          if (p[e]) {
            estadoActual = e;
            completados++;
          }
        });

        return {
          id: p.id,
          sku: p.sku,
          descripcion: p.descripcion,
          proveedor: p.proveedor,
          precioUnitario: p.precioUnitario ? Number(p.precioUnitario) : null,
          precioTotal: p.precioTotal ? Number(p.precioTotal) : null,
          cantidad: p.cantidad,
          tipoCompra,
          estadoActual,
          progreso: Math.round((completados / estados.length) * 100),
          estadosAplicables: estados,
          responsable: p.responsable
            ? { id: p.responsable.id, nombre: p.responsable.nombre }
            : null,
          observaciones: p.observaciones,
          ...Object.fromEntries(estados.map((e) => [e, !!p[e]])),
        };
      }),
    };
  }

  async avanzarEstado(productoId: string, observaciones?: string) {
    const producto = await this.prisma.licitacionProducto.findUnique({
      where: { id: productoId },
      include: { licitacion: true },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    if (producto.licitacion.estado !== 'ACTIVA')
      throw new BadRequestException('Licitación no activa');

    const tipoCompra = producto.tipoCompra || 'NACIONAL';
    const estados =
      tipoCompra === 'NACIONAL'
        ? [
            'cotizado',
            'conDescuento',
            'aprobacionCompra',
            'comprado',
            'pagado',
            'primerSeguimiento',
            'recibido',
          ]
        : [
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

    // Encontrar el último estado true
    let ultimoIdx = -1;
    estados.forEach((e, i) => {
      if ((producto as any)[e]) ultimoIdx = i;
    });

    if (ultimoIdx >= estados.length - 1)
      throw new BadRequestException('Producto ya completó todos los estados');

    const siguiente = estados[ultimoIdx + 1];
    const colFecha = `fecha${siguiente.charAt(0).toUpperCase() + siguiente.slice(1)}`;

    await this.prisma.licitacionProducto.update({
      where: { id: productoId },
      data: {
        [siguiente]: true,
        [colFecha]: new Date(),
        observaciones: observaciones || producto.observaciones,
      },
    });

    return {
      message: `Avanzado a ${siguiente}`,
      productoId,
      siguienteEstado: siguiente,
    };
  }

  async archivar(id: string, motivo: string, user: UserJwt) {
    await this.prisma.licitacion.update({
      where: { id },
      data: {
        estado: 'ARCHIVADA',
        motivoArchivo: motivo,
        fechaArchivo: new Date(),
        archivadaPorId: user.sub,
      },
    });
    return { message: 'Licitación archivada' };
  }

  async rechazar(id: string, motivo: string, user: UserJwt) {
    await this.prisma.licitacion.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        motivoArchivo: motivo,
        fechaArchivo: new Date(),
        archivadaPorId: user.sub,
      },
    });
    return { message: 'Licitación rechazada' };
  }

  async reactivar(id: string) {
    await this.prisma.licitacion.update({
      where: { id },
      data: {
        estado: 'ACTIVA',
        motivoArchivo: null,
        fechaArchivo: null,
        archivadaPorId: null,
      },
    });
    return { message: 'Licitación reactivada' };
  }
}
