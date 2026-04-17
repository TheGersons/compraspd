import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const CAMPO_LABELS: Record<string, string> = {
  tipoOperacion: 'Tipo Operación',
  prioridad: 'Prioridad',
  proveedor: 'Proveedor',
  marcaModelo: 'Marca / Modelo',
  nombreMaterial: 'Nombre del Material',
  numeroOC: '# Orden de Compra',
  tipoImportacion: 'Tipo Import/Export',
  paisOrigenEdit: 'País Origen',
  destino: 'Destino',
  estado: 'Estado',
  seguimiento: 'Seguimiento',
  detalles: 'Detalles',
  incoterms: 'Incoterms',
  terminosPago: 'Términos de Pago',
  formaPago: 'Forma de Pago',
  tipoTransporte: 'Tipo de Transporte',
  tipoEmbarque: 'Tipo Embarque',
  bookingBl: 'BL / Tracking',
  tracking: 'Tracking',
  puertoSalida: 'Puerto Origen',
  puertoLlegada: 'Puerto Destino',
  agenteAduanal: 'Agente Aduanal',
  naviera: 'Naviera / Forwarder',
  contenedor: 'Contenedor',
  observaciones: 'Observaciones',
  fechaOc: 'Fecha OC',
  fechaFabricacion: 'Fecha de Fabricación',
  fechaListoEmbarque: 'Fecha Listo Embarque',
  fechaEmbarque: 'Fecha ETD',
  fechaLlegadaPuerto: 'Fecha ETA',
  fechaRetiroPuerto: 'Fecha de Manifiesto',
  fechaEmisionBoletinImpuesto: 'Fecha Emisión Boletín Impuesto',
  fechaPagoBoletin: 'Fecha Pago Boletín',
  fechaSelectivo: 'Fecha Selectivo',
  fechaRevision: 'Fecha Revisión',
  fechaLevante: 'Fecha Levante',
  fechaLiberacionAduana: 'Fecha Liberación Aduana',
  fechaGatePass: 'Fecha Gate Pass',
  fechaEntregaFinal: 'Fecha Entrega Final',
  fechaPagoProveedor: 'Fecha Pago Proveedor',
  fechaDocumentosCompletos: 'Fecha Documentos Completos',
  remesaNotificado: 'Packing List',
  blTelexReleased: 'BL Telex Released',
  polizaSeguroRecibida: 'Póliza de Seguro Recibida',
  factura: 'Factura',
};

const CAMPOS_FECHA = new Set<string>([
  'fechaOc',
  'fechaFabricacion',
  'fechaListoEmbarque',
  'fechaEmbarque',
  'fechaLlegadaPuerto',
  'fechaRetiroPuerto',
  'fechaEmisionBoletinImpuesto',
  'fechaPagoBoletin',
  'fechaSelectivo',
  'fechaRevision',
  'fechaLevante',
  'fechaLiberacionAduana',
  'fechaGatePass',
  'fechaEntregaFinal',
  'fechaPagoProveedor',
  'fechaDocumentosCompletos',
]);

const CAMPOS_BOOLEAN = new Set<string>([
  'remesaNotificado',
  'blTelexReleased',
  'polizaSeguroRecibida',
  'factura',
]);

const CAMPOS_EDITABLES = Object.keys(CAMPO_LABELS);

@Injectable()
export class ImportExportService {
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
      !rol.includes('jefe') &&
      !rol.includes('gerencia') &&
      !rol.includes('compras')
    ) {
      throw new ForbiddenException('Acceso restringido');
    }
    return usuario!;
  }

  /**
   * Lista todos los seguimientos, auto-creando uno por cada cotización
   * INTERNACIONAL que tenga al menos un producto en estado comprado=true.
   */
  async listar(user: UserJwt) {
    await this.verificarAcceso(user);

    const cotizaciones = await this.prisma.cotizacion.findMany({
      where: {
        tipoCompra: 'INTERNACIONAL',
        estadosProductos: { some: { comprado: true } },
      },
      include: {
        solicitante: { select: { nombre: true } },
        proyecto: { select: { nombre: true } },
        tipo: { select: { nombre: true, area: { select: { nombreArea: true } } } },
        detalles: {
          select: {
            descripcionProducto: true,
            cantidad: true,
            tipoUnidad: true,
          },
        },
        seguimientoInternacional: true,
        estadosProductos: {
          where: { comprado: true },
          select: {
            sku: true,
            descripcion: true,
            tipoEntrega: true,
            paisOrigen: { select: { nombre: true } },
            medioTransporte: true,
            fechaComprado: true,
          },
          take: 1,
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });

    // Auto-crear seguimientos faltantes
    const faltantes = cotizaciones.filter((c) => !c.seguimientoInternacional);
    if (faltantes.length > 0) {
      await this.prisma.seguimientoInternacional.createMany({
        data: faltantes.map((c) => ({ cotizacionId: c.id })),
        skipDuplicates: true,
      });
      return this.listar(user);
    }

    return cotizaciones.map((c) => this.mapRow(c));
  }

  async getLogs(seguimientoId: string, user: UserJwt) {
    await this.verificarAcceso(user);

    const logs = await this.prisma.seguimientoInternacionalLog.findMany({
      where: { seguimientoId },
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

  async actualizar(
    seguimientoId: string,
    dto: Record<string, any>,
    user: UserJwt,
  ) {
    await this.verificarAcceso(user);

    const seguimiento = await this.prisma.seguimientoInternacional.findUnique({
      where: { id: seguimientoId },
    });
    if (!seguimiento) throw new NotFoundException('Seguimiento no encontrado');

    const updates: Record<string, any> = {};
    const logs: {
      campo: string;
      valorAnterior: string | null;
      valorNuevo: string | null;
    }[] = [];

    for (const campo of CAMPOS_EDITABLES) {
      if (!(campo in dto)) continue;
      let valorNuevo: any = dto[campo];

      if (CAMPOS_FECHA.has(campo)) {
        valorNuevo =
          valorNuevo == null || valorNuevo === '' ? null : new Date(valorNuevo);
      } else if (CAMPOS_BOOLEAN.has(campo)) {
        valorNuevo = Boolean(valorNuevo);
      } else {
        valorNuevo = valorNuevo ?? null;
      }

      const valorAnterior = (seguimiento as any)[campo];
      const anteriorStr =
        valorAnterior == null
          ? null
          : valorAnterior instanceof Date
            ? valorAnterior.toISOString()
            : String(valorAnterior);
      const nuevoStr =
        valorNuevo == null
          ? null
          : valorNuevo instanceof Date
            ? valorNuevo.toISOString()
            : String(valorNuevo);

      if (anteriorStr === nuevoStr) continue;

      updates[campo] = valorNuevo;
      logs.push({
        campo,
        valorAnterior: anteriorStr,
        valorNuevo: nuevoStr,
      });
    }

    if (Object.keys(updates).length === 0) return seguimiento;

    const [updated] = await this.prisma.$transaction([
      this.prisma.seguimientoInternacional.update({
        where: { id: seguimientoId },
        data: updates,
      }),
      this.prisma.seguimientoInternacionalLog.createMany({
        data: logs.map((l) => ({
          seguimientoId,
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
    const s = c.seguimientoInternacional;
    const descripcion = (c.detalles as any[])
      .map((d: any) => `${d.descripcionProducto} (x${d.cantidad})`)
      .join(' | ');

    const epComprado = c.estadosProductos?.[0];

    return {
      id: s.id,
      cotizacionId: c.id,
      // Auto
      fechaSolicitud: c.fechaSolicitud,
      nombreCotizacion: c.nombreCotizacion,
      ordenCompraCotizacion: c.ordenCompra ?? null,
      solicitante: c.solicitante?.nombre ?? null,
      proyecto: c.proyecto?.nombre ?? null,
      area: c.tipo?.area?.nombreArea ?? null,
      descripcionProducto: descripcion,
      paisOrigen: s.paisOrigenEdit ?? epComprado?.paisOrigen?.nombre ?? null,
      medioTransporte: epComprado?.medioTransporte ?? null,
      tipoEntrega: epComprado?.tipoEntrega ?? null,
      fechaComprado: epComprado?.fechaComprado ?? null,
      // Editables
      tipoOperacion: s.tipoOperacion,
      prioridad: s.prioridad,
      detalles: s.detalles,
      tipoEmbarque: s.tipoEmbarque,
      proveedor: s.proveedor,
      marcaModelo: s.marcaModelo,
      nombreMaterial: s.nombreMaterial,
      numeroOC: s.numeroOC,
      tipoImportacion: s.tipoImportacion,
      paisOrigenEdit: s.paisOrigenEdit,
      destino: s.destino,
      estado: s.estado,
      seguimiento: s.seguimiento,
      incoterms: s.incoterms,
      terminosPago: s.terminosPago,
      formaPago: s.formaPago,
      tipoTransporte: s.tipoTransporte,
      bookingBl: s.bookingBl,
      tracking: s.tracking,
      puertoSalida: s.puertoSalida,
      puertoLlegada: s.puertoLlegada,
      agenteAduanal: s.agenteAduanal,
      naviera: s.naviera,
      contenedor: s.contenedor,
      observaciones: s.observaciones,
      fechaOc: s.fechaOc,
      fechaFabricacion: s.fechaFabricacion,
      fechaListoEmbarque: s.fechaListoEmbarque,
      fechaEmbarque: s.fechaEmbarque,
      fechaLlegadaPuerto: s.fechaLlegadaPuerto,
      fechaRetiroPuerto: s.fechaRetiroPuerto,
      fechaEmisionBoletinImpuesto: s.fechaEmisionBoletinImpuesto,
      fechaPagoBoletin: s.fechaPagoBoletin,
      fechaSelectivo: s.fechaSelectivo,
      fechaRevision: s.fechaRevision,
      fechaLevante: s.fechaLevante,
      fechaLiberacionAduana: s.fechaLiberacionAduana,
      fechaGatePass: s.fechaGatePass,
      fechaEntregaFinal: s.fechaEntregaFinal,
      fechaPagoProveedor: s.fechaPagoProveedor,
      fechaDocumentosCompletos: s.fechaDocumentosCompletos,
      remesaNotificado: s.remesaNotificado,
      blTelexReleased: s.blTelexReleased,
      polizaSeguroRecibida: s.polizaSeguroRecibida,
      factura: s.factura,
      actualizado: s.actualizado,
    };
  }
}
