import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const CAMPO_LABELS: Record<string, string> = {
  numeroPO: '#PO',
  proveedor: 'Proveedor',
  origen: 'Origen',
  epdEps: 'EPD/EPS',
  totalPrice: 'Total Price',
  fechaContratoFirmado: 'Fecha contrato firmado',
  terminosPago: 'Términos de pago',
  observaciones: 'Observaciones',
  pago1: '1er Pago',
  fechaPago1: 'Fecha 1er Pago',
  pago2: '2do Pago',
  fechaPago2: 'Fecha 2do Pago',
  pago3: '3er Pago',
  fechaPago3: 'Fecha 3er Pago',
  pago4: '4to Pago',
  fechaPago4: 'Fecha 4to Pago',
  comentarios: 'Comentarios',
};

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verificarAcceso(user: UserJwt) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });
    const rol = usuario?.rol.nombre.toLowerCase() ?? '';
    if (!rol.includes('supervisor') && !rol.includes('admin') && !rol.includes('gerencia')) {
      throw new ForbiddenException('Acceso restringido a supervisores y gerencia');
    }
    return usuario!;
  }

  /**
   * Lista todos los reportes.
   * Por cada compra que no tenga aún un ReporteCompra, lo crea automáticamente.
   */
  async listar(user: UserJwt) {
    await this.verificarAcceso(user);

    // Obtener todas las compras con sus datos de cotización
    const compras = await this.prisma.compra.findMany({
      include: {
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            fechaSolicitud: true,
            tipoCompra: true,
            solicitante: { select: { nombre: true } },
            supervisorResponsable: { select: { nombre: true } },
          },
        },
        detalles: {
          select: {
            descripcionProducto: true,
            cantidad: true,
            precio: true,
            proveedor: { select: { nombre: true } },
          },
          orderBy: { descripcionProducto: 'asc' },
        },
        reporte: true,
      },
      orderBy: { creacion: 'desc' },
    });

    // Auto-crear ReporteCompra para compras que no tengan uno
    const sinReporte = compras.filter((c) => !c.reporte);
    if (sinReporte.length > 0) {
      await this.prisma.reporteCompra.createMany({
        data: sinReporte.map((c) => ({ compraId: c.id, numeroPO: '-' })),
        skipDuplicates: true,
      });
    }

    // Recargar con reportes actualizados si hubo creaciones
    const reportes = await this.prisma.reporteCompra.findMany({
      include: {
        compra: {
          include: {
            cotizacion: {
              select: {
                id: true,
                nombreCotizacion: true,
                fechaSolicitud: true,
                tipoCompra: true,
                solicitante: { select: { nombre: true } },
                supervisorResponsable: { select: { nombre: true } },
              },
            },
            detalles: {
              select: {
                descripcionProducto: true,
                cantidad: true,
                precio: true,
                proveedor: { select: { nombre: true } },
              },
              orderBy: { descripcionProducto: 'asc' },
            },
          },
        },
      },
      orderBy: { compra: { creacion: 'desc' } },
    });

    return reportes.map((r) => this.mapReporte(r));
  }

  /**
   * Obtiene los logs de cambio de un reporte específico
   */
  async getLogs(reporteId: string, user: UserJwt) {
    await this.verificarAcceso(user);

    const logs = await this.prisma.reporteCompraLog.findMany({
      where: { reporteId },
      include: {
        usuario: { select: { nombre: true, email: true } },
      },
      orderBy: { creado: 'desc' },
    });

    return logs.map((l) => ({
      id: l.id,
      campo: CAMPO_LABELS[l.campo] ?? l.campo,
      campoKey: l.campo,
      valorAnterior: l.valorAnterior,
      valorNuevo: l.valorNuevo,
      usuario: l.usuario.nombre,
      fecha: l.creado,
    }));
  }

  /**
   * Actualiza campos editables de un reporte y registra el log de cambio
   */
  async actualizar(reporteId: string, dto: Record<string, any>, user: UserJwt) {
    await this.verificarAcceso(user);

    const reporte = await this.prisma.reporteCompra.findUnique({
      where: { id: reporteId },
    });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');

    const camposEditables = [
      'numeroPO', 'proveedor', 'origen', 'epdEps', 'totalPrice',
      'fechaContratoFirmado', 'terminosPago', 'observaciones',
      'pago1', 'fechaPago1', 'pago2', 'fechaPago2',
      'pago3', 'fechaPago3', 'pago4', 'fechaPago4',
      'comentarios',
    ];

    const updates: Record<string, any> = {};
    const logs: { campo: string; valorAnterior: string | null; valorNuevo: string | null }[] = [];

    for (const campo of camposEditables) {
      if (!(campo in dto)) continue;

      const valorNuevo = dto[campo] ?? null;
      const valorAnterior = (reporte as any)[campo];

      // Solo logear si realmente cambió
      const anteriorStr = valorAnterior == null ? null : String(valorAnterior);
      const nuevoStr = valorNuevo == null ? null : String(valorNuevo);
      if (anteriorStr === nuevoStr) continue;

      updates[campo] = valorNuevo;
      logs.push({ campo, valorAnterior: anteriorStr, valorNuevo: nuevoStr });
    }

    if (Object.keys(updates).length === 0) {
      return reporte;
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.reporteCompra.update({
        where: { id: reporteId },
        data: updates,
      }),
      this.prisma.reporteCompraLog.createMany({
        data: logs.map((l) => ({
          reporteId,
          campo: l.campo,
          valorAnterior: l.valorAnterior,
          valorNuevo: l.valorNuevo,
          usuarioId: user.sub,
        })),
      }),
    ]);

    return updated;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private mapReporte(r: any) {
    const detalles = r.compra.detalles ?? [];

    // Descripción: concatenar productos
    const descripcion = detalles
      .map((d: any) => `${d.descripcionProducto} (x${d.cantidad})`)
      .join(' | ');

    // Proveedor auto (del primer detalle, si no hay proveedor manual)
    const proveedorAuto = detalles[0]?.proveedor?.nombre ?? null;

    // Pagos: sumar los no nulos
    const pagos = [r.pago1, r.pago2, r.pago3, r.pago4]
      .filter((p) => p != null)
      .map((p) => Number(p));
    const totalPagado = pagos.reduce((a, b) => a + b, 0);
    const totalPrice = r.totalPrice != null ? Number(r.totalPrice) : null;
    const saldoPendiente = totalPrice != null ? totalPrice - totalPagado : null;

    // Status de pago
    let statusPago = 'SIN_PAGOS';
    if (totalPrice != null && totalPagado >= totalPrice && totalPrice > 0) {
      statusPago = 'PAGO_COMPLETO';
    } else if (totalPagado > 0) {
      statusPago = pagos.length === 1 ? 'PRIMER_PAGO' : 'PAGO_PARCIAL';
    }

    return {
      id: r.id,
      compraId: r.compraId,
      compraEstado: r.compra.estado,
      // Auto fields
      fechaSolicitud: r.compra.cotizacion.fechaSolicitud,
      nombreCotizacion: r.compra.cotizacion.nombreCotizacion,
      tipoCompra: r.compra.cotizacion.tipoCompra,
      solicitante: r.compra.cotizacion.solicitante?.nombre ?? null,
      supervisorResponsable: r.compra.cotizacion.supervisorResponsable?.nombre ?? null,
      descripcionProducto: descripcion,
      statusOC: r.compra.estado,
      // Manual fields
      numeroPO: r.numeroPO ?? '-',
      proveedor: r.proveedor ?? proveedorAuto,
      origen: r.origen,
      epdEps: r.epdEps,
      totalPrice: r.totalPrice != null ? Number(r.totalPrice) : null,
      fechaContratoFirmado: r.fechaContratoFirmado,
      terminosPago: r.terminosPago,
      observaciones: r.observaciones,
      pago1: r.pago1 != null ? Number(r.pago1) : null,
      fechaPago1: r.fechaPago1,
      pago2: r.pago2 != null ? Number(r.pago2) : null,
      fechaPago2: r.fechaPago2,
      pago3: r.pago3 != null ? Number(r.pago3) : null,
      fechaPago3: r.fechaPago3,
      pago4: r.pago4 != null ? Number(r.pago4) : null,
      fechaPago4: r.fechaPago4,
      comentarios: r.comentarios,
      // Calculados
      totalPagado,
      saldoPendiente,
      statusPago,
      actualizado: r.actualizado,
    };
  }
}
