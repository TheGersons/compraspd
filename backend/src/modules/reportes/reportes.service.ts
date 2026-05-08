import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const ESTADOS_FINALES = ['RECHAZADA', 'CANCELADA'];
const ROLES_PERMITIDOS = ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS', 'GERENCIA'];
const ROLES_EDICION_CONTROL_COMPRAS = ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'];

const ESTADOS_PRODUCTO_ORDEN = [
  'recibido', 'enCIF', 'segundoSeguimiento', 'conBL',
  'cotizacionFleteInternacional', 'enFOB', 'primerSeguimiento',
  'aprobacionPlanos', 'pagado', 'comprado',
  'aprobacionCompra', 'conDescuento', 'cotizado',
] as const;

function derivarEstatus(ep: any): string {
  return ESTADOS_PRODUCTO_ORDEN.find((k) => ep[k]) ?? 'pendiente';
}

// Vocabulario fijo del select de status (alineado con el Excel del cliente).
const STATUS_REPORTE_VALUES = [
  'Fabricación',
  'Orden de compra',
  'Pendiente PO',
  'Descartado',
  'En coordinación',
  'En tránsito',
  'Revisión de planos',
  'Pruebas de equipo',
  'Aduana',
  'Almacén',
  'Entregado',
  'Finalizado',
  'Información técnica',
  'Consultas',
  'Cotizando',
] as const;

// Etiquetas agrupadas para el reporte "Control de Compras" (estilo Excel cliente).
// Mapeo desde los flags booleanos al vocabulario fijo del select.
function derivarStatusReporte(ep: any): string {
  if (ep.recibido) return 'Entregado';
  if (ep.enCIF) return 'Aduana';
  if (ep.conBL || ep.segundoSeguimiento) return 'En tránsito';
  if (ep.cotizacionFleteInternacional || ep.enFOB || ep.primerSeguimiento)
    return 'En coordinación';
  if (ep.aprobacionPlanos) return 'Revisión de planos';
  if (ep.pagado || ep.comprado) return 'Fabricación';
  if (ep.aprobacionCompra) return 'Orden de compra';
  if (ep.cotizado || ep.conDescuento) return 'Cotizando';
  return 'Pendiente PO';
}

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
    const rol = usuario?.rol.nombre.toUpperCase() ?? '';
    if (!ROLES_PERMITIDOS.includes(rol)) {
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
        ordenesCompra: {
          select: { id: true, nombre: true, numeroOC: true, estado: true },
          orderBy: { creacion: 'asc' },
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

  // ── Reporte por producto ──────────────────────────────────────────────────

  async getFiltrosProductos(user: UserJwt) {
    await this.verificarAcceso(user);
    const [proyectos, responsables] = await Promise.all([
      this.prisma.proyecto.findMany({
        where: { estado: true },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.usuario.findMany({
        where: { activo: true, rol: { nombre: { in: ['ADMIN', 'SUPERVISOR', 'JEFE_COMPRAS'] } } },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);
    return { proyectos, responsables };
  }

  async listarProductos(
    user: UserJwt,
    filters: {
      desde?: string;
      hasta?: string;
      tipoCompra?: string;
      vista?: string;
      proyectoId?: string;
      responsableId?: string;
      proveedor?: string;
      oc?: string;
      descripcion?: string;
    },
  ) {
    await this.verificarAcceso(user);

    const cotizacionWhere: any = {
      estado: { notIn: ESTADOS_FINALES },
      NOT: { tipo: { nombre: { contains: 'logistica', mode: 'insensitive' } } },
    };

    if (filters.tipoCompra && filters.tipoCompra !== 'TODAS') {
      cotizacionWhere.tipoCompra = filters.tipoCompra;
    }

    if (filters.desde || filters.hasta) {
      cotizacionWhere.fechaSolicitud = {};
      if (filters.desde) cotizacionWhere.fechaSolicitud.gte = new Date(filters.desde);
      if (filters.hasta) {
        const fin = new Date(filters.hasta);
        fin.setHours(23, 59, 59, 999);
        cotizacionWhere.fechaSolicitud.lte = fin;
      }
    }

    const where: any = {
      rechazado: false,
      cotizacionId: { not: null },
      cotizacion: cotizacionWhere,
    };

    if (filters.vista === 'COTIZACION') where.compraId = null;
    if (filters.vista === 'COMPRA') where.compraId = { not: null };

    if (filters.proyectoId && filters.proyectoId !== 'TODOS') {
      where.proyectoId = filters.proyectoId;
    }
    if (filters.responsableId && filters.responsableId !== 'TODOS') {
      where.responsableSeguimientoId = filters.responsableId;
    }
    if (filters.proveedor) {
      where.proveedor = { contains: filters.proveedor, mode: 'insensitive' };
    }
    if (filters.oc) {
      where.ordenCompra = {
        OR: [
          { nombre:   { contains: filters.oc, mode: 'insensitive' } },
          { numeroOC: { contains: filters.oc, mode: 'insensitive' } },
        ],
      };
    }
    if (filters.descripcion) {
      where.OR = [
        { descripcion: { contains: filters.descripcion, mode: 'insensitive' } },
        { cotizacionDetalle: { descripcionProducto: { contains: filters.descripcion, mode: 'insensitive' } } },
      ];
    }

    const productos = await this.prisma.estadoProducto.findMany({
      where,
      include: {
        proyecto:               { select: { id: true, nombre: true } },
        ordenCompra:            { select: { id: true, nombre: true, numeroOC: true } },
        responsableSeguimiento: { select: { id: true, nombre: true } },
        cotizacionDetalle:      { select: { descripcionProducto: true, cantidad: true } },
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            tipoCompra: true,
            estado: true,
            fechaSolicitud: true,
            tipo: { select: { nombre: true, area: { select: { nombreArea: true } } } },
            supervisorResponsable: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [{ cotizacion: { fechaSolicitud: 'desc' } }, { creado: 'desc' }],
    });

    return productos.map((ep) => this.mapProductoRow(ep));
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
      ordenesCompra: c.ordenesCompra ?? [],
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

  // ── Reporte Control de Compras ────────────────────────────────────────────

  async getFiltrosControlCompras(user: UserJwt) {
    await this.verificarAcceso(user);
    const [solicitantes, proyectos] = await Promise.all([
      this.prisma.usuario.findMany({
        where: {
          cotizaciones: {
            some: { estado: { notIn: ESTADOS_FINALES } },
          },
        },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.proyecto.findMany({
        where: { estado: true },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);
    return { solicitantes, proyectos };
  }

  async listarControlCompras(
    user: UserJwt,
    filters: { solicitanteId?: string; proyectoId?: string },
  ) {
    await this.verificarAcceso(user);

    const cotizacionWhere: any = {
      estado: { notIn: ESTADOS_FINALES },
      NOT: { tipo: { nombre: { contains: 'logistica', mode: 'insensitive' } } },
    };

    if (filters.solicitanteId && filters.solicitanteId !== 'TODOS') {
      cotizacionWhere.solicitanteId = filters.solicitanteId;
    }

    const where: any = {
      rechazado: false,
      cotizacionId: { not: null },
      cotizacion: cotizacionWhere,
    };

    if (filters.proyectoId && filters.proyectoId !== 'TODOS') {
      where.proyectoId = filters.proyectoId;
    }

    const productos = await this.prisma.estadoProducto.findMany({
      where,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        ordenCompra: { select: { id: true, nombre: true, numeroOC: true } },
        responsableSeguimiento: { select: { id: true, nombre: true } },
        cotizacionDetalle: { select: { descripcionProducto: true, cantidad: true } },
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            fechaSolicitud: true,
            ordenCompra: true,
            solicitante: { select: { id: true, nombre: true } },
            supervisorResponsable: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [
        { proyecto: { nombre: 'asc' } },
        { cotizacion: { fechaSolicitud: 'desc' } },
        { creado: 'desc' },
      ],
    });

    return productos.map((ep) => this.mapControlComprasRow(ep));
  }

  // ── Reporte Control de Compras (vista PROPIA — sin gate de rol) ───────────
  // El solicitante autenticado ve únicamente sus propios productos.

  async getFiltrosControlComprasPropias(user: UserJwt) {
    // Sin verificarAcceso: cualquier autenticado puede pedir los SUYOS.
    const proyectos = await this.prisma.proyecto.findMany({
      where: {
        estado: true,
        estadosProductos: {
          some: {
            rechazado: false,
            cotizacion: {
              solicitanteId: user.sub,
              estado: { notIn: ESTADOS_FINALES },
            },
          },
        },
      },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    return { proyectos };
  }

  async listarControlComprasPropias(
    user: UserJwt,
    filters: { proyectoId?: string },
  ) {
    const cotizacionWhere: any = {
      solicitanteId: user.sub,
      estado: { notIn: ESTADOS_FINALES },
      NOT: { tipo: { nombre: { contains: 'logistica', mode: 'insensitive' } } },
    };

    const where: any = {
      rechazado: false,
      cotizacionId: { not: null },
      cotizacion: cotizacionWhere,
    };

    if (filters.proyectoId && filters.proyectoId !== 'TODOS') {
      where.proyectoId = filters.proyectoId;
    }

    const productos = await this.prisma.estadoProducto.findMany({
      where,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        ordenCompra: { select: { id: true, nombre: true, numeroOC: true } },
        responsableSeguimiento: { select: { id: true, nombre: true } },
        cotizacionDetalle: { select: { descripcionProducto: true, cantidad: true } },
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            estado: true,
            fechaSolicitud: true,
            ordenCompra: true,
            solicitante: { select: { id: true, nombre: true } },
            supervisorResponsable: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [
        { proyecto: { nombre: 'asc' } },
        { cotizacion: { fechaSolicitud: 'desc' } },
        { creado: 'desc' },
      ],
    });

    return productos.map((ep) => this.mapControlComprasRow(ep));
  }

  // Mapeo del campo expuesto por el reporte → columna real en EstadoProducto.
  // Las "base" se escriben en fechaLimite*; las "real" en fechaReal*. Status y
  // observaciones tienen su propio campo.
  private static readonly CAMPOS_EDITABLES_CONTROL_COMPRAS: Record<
    string,
    { col: string; tipo: 'date' | 'text' }
  > = {
    fechaEmisionOC:      { col: 'fechaRealAprobacionCompra', tipo: 'date' },
    fechaPagoAnticipo:   { col: 'fechaRealPagado',           tipo: 'date' },
    fechaFinFabricacion: { col: 'fechaFinFabricacion',       tipo: 'date' },
    fobBase:             { col: 'fechaLimiteEnFOB',          tipo: 'date' },
    cifBase:             { col: 'fechaLimiteEnCIF',          tipo: 'date' },
    llegadaBase:         { col: 'fechaLimiteRecibido',       tipo: 'date' },
    fobReal:             { col: 'fechaRealEnFOB',            tipo: 'date' },
    cifReal:             { col: 'fechaRealEnCIF',            tipo: 'date' },
    llegadaReal:         { col: 'fechaRealRecibido',         tipo: 'date' },
    observaciones:       { col: 'observaciones',             tipo: 'text' },
    status:              { col: 'statusManual',              tipo: 'text' },
  };

  async actualizarControlCompras(
    id: string,
    dto: Record<string, any>,
    user: UserJwt,
  ) {
    await this.verificarAcceso(user);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });
    const rol = usuario?.rol.nombre.toUpperCase() ?? '';
    if (!ROLES_EDICION_CONTROL_COMPRAS.includes(rol)) {
      throw new ForbiddenException(
        'Solo ADMIN, SUPERVISOR o JEFE_COMPRAS pueden editar este reporte',
      );
    }

    const existe = await this.prisma.estadoProducto.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException('Producto no encontrado');
    }

    const data: Record<string, any> = {};
    const mapa = ReportesService.CAMPOS_EDITABLES_CONTROL_COMPRAS;

    for (const key of Object.keys(dto)) {
      const cfg = mapa[key];
      if (!cfg) continue;
      const raw = dto[key];

      if (cfg.tipo === 'date') {
        data[cfg.col] = raw == null || raw === '' ? null : new Date(raw);
      } else if (cfg.col === 'statusManual') {
        if (raw == null || raw === '') {
          data[cfg.col] = null;
        } else if (!STATUS_REPORTE_VALUES.includes(raw)) {
          throw new ForbiddenException(`Status inválido: ${raw}`);
        } else {
          data[cfg.col] = raw;
        }
      } else {
        data[cfg.col] = raw == null || raw === '' ? null : String(raw);
      }
    }

    if (Object.keys(data).length === 0) {
      return { id, actualizado: 0 };
    }

    await this.prisma.estadoProducto.update({
      where: { id },
      data,
    });

    return { id, actualizado: Object.keys(data).length };
  }

  private mapControlComprasRow(ep: any) {
    const descripcion =
      ep.descripcion ?? ep.cotizacionDetalle?.descripcionProducto ?? '';
    const encargado =
      ep.responsableSeguimiento ??
      ep.cotizacion?.supervisorResponsable ??
      null;

    return {
      id: ep.id,
      proyecto: ep.proyecto ? { id: ep.proyecto.id, nombre: ep.proyecto.nombre } : null,
      cotizacionNombre: ep.cotizacion?.nombreCotizacion ?? null,
      solicitante: ep.cotizacion?.solicitante
        ? { id: ep.cotizacion.solicitante.id, nombre: ep.cotizacion.solicitante.nombre }
        : null,
      descripcion,
      // PO = OC. Preferir el numeroOC vinculado al producto; si no hay OC dividida,
      // fallback al ordenCompra global de la cotización.
      po: ep.ordenCompra?.numeroOC ?? ep.cotizacion?.ordenCompra ?? null,
      fechaEmisionOC: ep.fechaRealAprobacionCompra ?? ep.fechaAprobacionCompra ?? null,
      fechaPagoAnticipo: ep.fechaRealPagado ?? ep.fechaPagado ?? null,
      // Editable: si no hay valor manual, default a la fecha límite del 1er seguimiento
      fechaFinFabricacion: ep.fechaFinFabricacion ?? ep.fechaLimitePrimerSeguimiento ?? null,
      fechaFinFabricacionEsManual: ep.fechaFinFabricacion != null,
      fobBase: ep.fechaLimiteEnFOB ?? null,
      cifBase: ep.fechaLimiteEnCIF ?? null,
      llegadaBase: ep.fechaLimiteRecibido ?? null,
      fobReal: ep.fechaRealEnFOB ?? ep.fechaEnFOB ?? null,
      cifReal: ep.fechaRealEnCIF ?? ep.fechaEnCIF ?? null,
      llegadaReal: ep.fechaRealRecibido ?? ep.fechaRecibido ?? null,
      observaciones: ep.observaciones ?? null,
      status: ep.statusManual ?? derivarStatusReporte(ep),
      statusEsManual: ep.statusManual != null,
      encargado: encargado ? { id: encargado.id, nombre: encargado.nombre } : null,
    };
  }

  private mapProductoRow(ep: any) {
    const descripcion =
      ep.cotizacionDetalle?.descripcionProducto ?? ep.descripcion ?? '';
    const cantidad = ep.cotizacionDetalle?.cantidad ?? ep.cantidad ?? null;

    return {
      id: ep.id,
      cotizacionId: ep.cotizacionId,
      nombreCotizacion: ep.cotizacion?.nombreCotizacion ?? null,
      estadoCotizacion: ep.cotizacion?.estado ?? null,
      tipoCompra: ep.cotizacion?.tipoCompra ?? null,
      fechaSolicitud: ep.cotizacion?.fechaSolicitud ?? null,
      area: ep.cotizacion?.tipo?.area?.nombreArea ?? null,
      tipo: ep.cotizacion?.tipo?.nombre ?? null,
      supervisorCotizacion: ep.cotizacion?.supervisorResponsable
        ? { id: ep.cotizacion.supervisorResponsable.id, nombre: ep.cotizacion.supervisorResponsable.nombre }
        : null,
      proyecto: ep.proyecto ? { id: ep.proyecto.id, nombre: ep.proyecto.nombre } : null,
      ordenCompra: ep.ordenCompra
        ? { id: ep.ordenCompra.id, nombre: ep.ordenCompra.nombre, numeroOC: ep.ordenCompra.numeroOC ?? null }
        : null,
      descripcion,
      cantidad,
      sku: ep.sku ?? null,
      proveedor: ep.proveedor ?? null,
      estatusActual: derivarEstatus(ep),
      estadoGeneral: ep.estadoGeneral ?? 'warn',
      diasRetrasoActual: ep.diasRetrasoActual ?? 0,
      responsable: ep.responsableSeguimiento
        ? { id: ep.responsableSeguimiento.id, nombre: ep.responsableSeguimiento.nombre }
        : null,
      compraId: ep.compraId ?? null,
    };
  }
}
