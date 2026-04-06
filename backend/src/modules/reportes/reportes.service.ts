import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const ESTADOS_FINALES = ['RECHAZADA', 'CANCELADA'];

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
    if (
      !rol.includes('supervisor') &&
      !rol.includes('admin') &&
      !rol.includes('gerencia')
    ) {
      throw new ForbiddenException('Acceso restringido a supervisores y gerencia');
    }
    return usuario!;
  }

  /**
   * Lista todas las cotizaciones en proceso (no en estado final),
   * filtradas por rango de fecha de solicitud.
   * Auto-crea un ReporteCompra por cotización si aún no existe.
   */
  async listar(
    user: UserJwt,
    filters?: { desde?: string; hasta?: string },
  ) {
    await this.verificarAcceso(user);

    const where: any = {
      estado: { notIn: ESTADOS_FINALES },
    };

    if (filters?.desde || filters?.hasta) {
      where.fechaSolicitud = {};
      if (filters.desde) where.fechaSolicitud.gte = new Date(filters.desde);
      if (filters.hasta) {
        // Incluye todo el día "hasta"
        const fin = new Date(filters.hasta);
        fin.setHours(23, 59, 59, 999);
        where.fechaSolicitud.lte = fin;
      }
    }

    const cotizaciones = await this.prisma.cotizacion.findMany({
      where,
      include: {
        solicitante: { select: { nombre: true } },
        supervisorResponsable: { select: { nombre: true } },
        tipo: { select: { nombre: true, area: { select: { nombreArea: true } } } },
        proyecto: { select: { nombre: true } },
        detalles: {
          select: {
            descripcionProducto: true,
            cantidad: true,
          },
          orderBy: { descripcionProducto: 'asc' },
        },
        compras: {
          select: { id: true, estado: true },
          orderBy: { creacion: 'desc' },
          take: 1,
        },
        reporte: true,
      },
      orderBy: { fechaSolicitud: 'desc' },
    });

    // Auto-crear reportes para cotizaciones que no tienen uno
    const sinReporte = cotizaciones.filter((c) => !c.reporte);
    if (sinReporte.length > 0) {
      await this.prisma.reporteCompra.createMany({
        data: sinReporte.map((c) => ({ cotizacionId: c.id, numeroPO: '-' })),
        skipDuplicates: true,
      });

      // Recargar con reportes creados
      return this.listar(user, filters);
    }

    return cotizaciones.map((c) => this.mapRow(c));
  }

  /**
   * Historial de cambios de un reporte
   */
  async getLogs(reporteId: string, user: UserJwt) {
    await this.verificarAcceso(user);

    const logs = await this.prisma.reporteCompraLog.findMany({
      where: { reporteId },
      include: { usuario: { select: { nombre: true, email: true } } },
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
   * Actualiza campos editables y registra el log
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
      const anteriorStr = valorAnterior == null ? null : String(valorAnterior);
      const nuevoStr = valorNuevo == null ? null : String(valorNuevo);
      if (anteriorStr === nuevoStr) continue;
      updates[campo] = valorNuevo;
      logs.push({ campo, valorAnterior: anteriorStr, valorNuevo: nuevoStr });
    }

    if (Object.keys(updates).length === 0) return reporte;

    const [updated] = await this.prisma.$transaction([
      this.prisma.reporteCompra.update({ where: { id: reporteId }, data: updates }),
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

  // ── Private mapper ────────────────────────────────────────────────────────

  private mapRow(c: any) {
    const r = c.reporte;
    const compra = c.compras?.[0] ?? null;

    const descripcion = (c.detalles as any[])
      .map((d: any) => `${d.descripcionProducto} (x${d.cantidad})`)
      .join(' | ');

    const proveedorAuto = null; // CotizacionDetalle no tiene relación directa con proveedor

    const pagos = [r.pago1, r.pago2, r.pago3, r.pago4]
      .filter((p: any) => p != null)
      .map((p: any) => Number(p));
    const totalPagado = pagos.reduce((a: number, b: number) => a + b, 0);
    const totalPrice = r.totalPrice != null ? Number(r.totalPrice) : null;
    const saldoPendiente = totalPrice != null ? totalPrice - totalPagado : null;

    let statusPago = 'SIN_PAGOS';
    if (totalPrice != null && totalPagado >= totalPrice && totalPrice > 0) {
      statusPago = 'PAGO_COMPLETO';
    } else if (totalPagado > 0) {
      statusPago = pagos.length === 1 ? 'PRIMER_PAGO' : 'PAGO_PARCIAL';
    }

    return {
      id: r.id,
      cotizacionId: c.id,
      // Auto – cotización
      fechaSolicitud: c.fechaSolicitud,
      nombreCotizacion: c.nombreCotizacion,
      estadoCotizacion: c.estado,
      tipoCompra: c.tipoCompra,
      area: c.tipo?.area?.nombreArea ?? null,
      tipo: c.tipo?.nombre ?? null,
      solicitante: c.solicitante?.nombre ?? null,
      supervisorResponsable: c.supervisorResponsable?.nombre ?? null,
      proyecto: c.proyecto?.nombre ?? null,
      descripcionProducto: descripcion,
      // Auto – compra (si existe)
      statusOC: compra ? compra.estado : null,
      compraId: compra?.id ?? null,
      // Manual
      numeroPO: r.numeroPO ?? '-',
      proveedor: r.proveedor ?? proveedorAuto,
      origen: r.origen,
      epdEps: r.epdEps,
      totalPrice,
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
