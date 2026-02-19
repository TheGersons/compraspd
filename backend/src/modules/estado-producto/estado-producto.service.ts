import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEstadoProductoDto,
  AvanzarEstadoDto,
  CambiarEstadoDto,
  ActualizarFechasDto,
  ActualizarFechasLimiteDto,
  ListEstadoProductoQueryDto,
  AprobarProductoDto,
  EstadoProceso,
  ESTADOS_NACIONAL,
  ESTADOS_INTERNACIONAL,
  ESTADO_LABELS,
  RegistrarEvidenciaDto,
} from './dto/estado-producto.dto';
import console from 'console';

type UserJwt = { sub: string; role?: string };

/**
 * Orden secuencial de los 10 estados (internacional)
 */
const ORDEN_ESTADOS: EstadoProceso[] = ESTADOS_INTERNACIONAL;

/**
 * Mapeo de estados a nombres de campos de fecha
 */
const ESTADO_A_CAMPO_FECHA: Record<EstadoProceso, string> = {
  [EstadoProceso.COTIZADO]: 'fechaCotizado',
  [EstadoProceso.CON_DESCUENTO]: 'fechaConDescuento',
  [EstadoProceso.APROBACION_COMPRA]: 'fechaAprobacionCompra',
  [EstadoProceso.COMPRADO]: 'fechaComprado',
  [EstadoProceso.PAGADO]: 'fechaPagado',
  [EstadoProceso.APROBACION_PLANOS]: 'fechaAprobacionPlanos', // ← NUEVO
  [EstadoProceso.PRIMER_SEGUIMIENTO]: 'fechaPrimerSeguimiento',
  [EstadoProceso.EN_FOB]: 'fechaEnFOB',
  [EstadoProceso.COTIZACION_FLETE_INTERNACIONAL]:
    'fechaCotizacionFleteInternacional',
  [EstadoProceso.CON_BL]: 'fechaConBL',
  [EstadoProceso.SEGUNDO_SEGUIMIENTO]: 'fechaSegundoSeguimiento',
  [EstadoProceso.EN_CIF]: 'fechaEnCIF',
  [EstadoProceso.RECIBIDO]: 'fechaRecibido',
};

/**
 * Mapeo de estados a campos de evidencia
 */
/* const ESTADO_A_CAMPO_EVIDENCIA: Record<EstadoProceso, string> = {
  [EstadoProceso.COTIZADO]: 'evidenciaCotizado',
  [EstadoProceso.CON_DESCUENTO]: 'evidenciaConDescuento',
  [EstadoProceso.COMPRADO]: 'evidenciaComprado',
  [EstadoProceso.PAGADO]: 'evidenciaPagado',
  [EstadoProceso.PRIMER_SEGUIMIENTO]: 'evidenciaPrimerSeguimiento',
  [EstadoProceso.EN_FOB]: 'evidenciaEnFOB',
  [EstadoProceso.CON_BL]: 'evidenciaConBL',
  [EstadoProceso.SEGUNDO_SEGUIMIENTO]: 'evidenciaSegundoSeguimiento',
  [EstadoProceso.EN_CIF]: 'evidenciaEnCIF',
  [EstadoProceso.RECIBIDO]: 'evidenciaRecibido',
}; */

/**
 * Service para gestión de Estado Producto
 * Sistema completo de tracking con soporte para Nacional e Internacional
 */
@Injectable()
export class EstadoProductoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear EstadoProducto al aprobar cotización
   * Se crea con estado inicial: cotizado = true
   */
  async create(dto: CreateEstadoProductoDto, user: UserJwt) {
    // Verificar que la cotización existe
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: dto.cotizacionId },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Obtener timeline del SKU si existe
    const timelineSKU = await this.prisma.timelineSKU.findUnique({
      where: { sku: dto.sku },
    });

    const fechaCotizado = new Date();
    const fechasLimite = timelineSKU
      ? this.calcularFechasLimite(fechaCotizado, timelineSKU)
      : {};

    // Crear EstadoProducto
    return this.prisma.estadoProducto.create({
      data: {
        proyectoId: dto.proyectoId,
        cotizacionId: dto.cotizacionId,
        cotizacionDetalleId: dto.cotizacionDetalleId,
        sku: dto.sku,
        descripcion: dto.descripcion,
        paisOrigenId: dto.paisOrigenId,
        medioTransporte: dto.medioTransporte as any,
        proveedor: dto.proveedor,
        responsable: dto.responsable,
        precioUnitario: dto.precioUnitario,
        precioTotal: dto.precioTotal,
        cantidad: dto.cantidad,

        // Estado inicial: COTIZADO
        cotizado: true,
        fechaCotizado,

        // Fechas límite calculadas
        ...fechasLimite,

        // Criticidad inicial
        criticidad: 5,
        nivelCriticidad: 'MEDIO',
        diasRetrasoActual: 0,
        estadoGeneral: 'warn',
      },
      include: {
        proyecto: true,
        cotizacion: {
          select: { nombreCotizacion: true, tipoCompra: true },
        },
        paisOrigen: true,
      },
    });
  }

  /**
   * Listar estados de productos con filtros
   * Ahora incluye filtro por tipo de compra
   */
  async list(filters: ListEstadoProductoQueryDto, user: UserJwt) {
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {
      // Solo mostrar productos aprobados por supervisor
      aprobadoPorSupervisor: true,
    };

    if (filters.proyectoId) where.proyectoId = filters.proyectoId;
    if (filters.cotizacionId) where.cotizacionId = filters.cotizacionId;
    if (filters.sku) where.sku = { contains: filters.sku, mode: 'insensitive' };
    if (filters.nivelCriticidad)
      where.nivelCriticidad = filters.nivelCriticidad;

    // Filtrar por tipo de compra
    if (filters.tipoCompra) {
      where.cotizacion = {
        tipoCompra: filters.tipoCompra,
      };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.estadoProducto.count({ where }),
      this.prisma.estadoProducto.findMany({
        where,
        include: {
          proyecto: { select: { nombre: true } },
          cotizacion: {
            select: {
              nombreCotizacion: true,
              tipoCompra: true,
              solicitante: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                  departamento: {
                    select: {
                      id: true,
                      nombre: true,
                    },
                  },
                },
              },
            },
          },
          paisOrigen: { select: { nombre: true } },
        },
        orderBy: [{ criticidad: 'desc' }, { actualizado: 'desc' }],
        skip,
        take: pageSize,
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: items.map((item) => ({
        ...item,
        estadoActual: this.obtenerEstadoActual(item),
        progreso: this.calcularProgreso(item, item.cotizacion?.tipoCompra),
        tipoCompra: item.cotizacion?.tipoCompra || 'INTERNACIONAL',
        estadosAplicables: this.getEstadosAplicables(
          item.cotizacion?.tipoCompra,
        ),
      })),
    };
  }

  /**
   * Obtener un EstadoProducto por ID con timeline completo
   */
  async findById(id: string, user: UserJwt) {
    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: {
        proyecto: true,
        cotizacion: {
          include: {
            solicitante: {
              select: { nombre: true, email: true },
            },
          },
        },
        cotizacionDetalle: true,
        compra: true,
        compraDetalle: true,
        paisOrigen: true,
      },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const tipoCompra = estado.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);

    return {
      ...estado,
      tipoCompra,
      estadosAplicables,
      estadoActual: this.obtenerEstadoActual(estado),
      progreso: this.calcularProgreso(estado, tipoCompra),
      timeline: this.generarTimeline(estado, tipoCompra),
      siguienteEstado: this.obtenerSiguienteEstado(estado, tipoCompra),
    };
  }

  /**
   * Obtener el timeline de un producto
   */
  async getTimeline(id: string, user: UserJwt) {
    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: { tipoCompra: true },
        },
      },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const tipoCompra = estado.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadoActual = this.obtenerEstadoActual(estado);
    const timeline = this.generarTimeline(estado, tipoCompra);

    return {
      estadoActual,
      progreso: this.calcularProgreso(estado, tipoCompra),
      timeline,
      criticidad: estado.criticidad,
      nivelCriticidad: estado.nivelCriticidad,
      diasRetrasoTotal: estado.diasRetrasoActual,
      tipoCompra,
      siguienteEstado: this.obtenerSiguienteEstado(estado, tipoCompra),
    };
  }

  // ============================================
  // AGREGAR ESTE MÉTODO AL SERVICIO estado-producto.service.ts
  // ============================================

  // Mapeo de estados a sus campos de fecha límite
  private readonly ESTADO_TO_FECHA_LIMITE_FIELD: Record<string, string> = {
    cotizado: 'fechaLimiteCotizado',
    conDescuento: 'fechaLimiteConDescuento',
    aprobacionCompra: 'fechaLimiteAprobacionCompra',
    comprado: 'fechaLimiteComprado',
    pagado: 'fechaLimitePagado',
    aprobacionPlanos: 'fechaLimiteAprobacionPlanos',
    primerSeguimiento: 'fechaLimitePrimerSeguimiento',
    enFOB: 'fechaLimiteEnFOB',
    conBL: 'fechaLimiteConBL',
    segundoSeguimiento: 'fechaLimiteSegundoSeguimiento',
    enCIF: 'fechaLimiteEnCIF',
    recibido: 'fechaLimiteRecibido',
  };

  // Mapeo de estados a sus campos booleanos
  private readonly ESTADO_TO_BOOLEAN_FIELD: Record<string, string> = {
    cotizado: 'cotizado',
    conDescuento: 'conDescuento',
    comprado: 'comprado',
    pagado: 'pagado',
    primerSeguimiento: 'primerSeguimiento',
    enFOB: 'enFOB',
    conBL: 'conBL',
    segundoSeguimiento: 'segundoSeguimiento',
    enCIF: 'enCIF',
    recibido: 'recibido',
  };

  // Orden de estados para Nacional e Internacional
  private readonly ESTADOS_NACIONAL = [
    'cotizado',
    'conDescuento',
    'aprobacionCompra', // ← FALTABA
    'comprado',
    'pagado',
    'recibido',
  ];
  private readonly ESTADOS_INTERNACIONAL = [
    'cotizado',
    'conDescuento',
    'aprobacionCompra',
    'comprado',
    'pagado',
    'aprobacionPlanos',
    'primerSeguimiento',
    'enFOB',
    'conFleteInternacional',
    'conBL',
    'segundoSeguimiento',
    'enCIF',
    'recibido',
  ];

  // Mapeo estado → campo de fecha real
  private readonly ESTADO_TO_FECHA_REAL_FIELD: Record<string, string> = {
    aprobacionCompra: 'fechaRealAprobacionCompra',
    comprado: 'fechaRealComprado',
    pagado: 'fechaRealPagado',
    aprobacionPlanos: 'fechaRealAprobacionPlanos',
    primerSeguimiento: 'fechaRealPrimerSeguimiento',
    enFOB: 'fechaRealEnFOB',
    cotizacionFleteInternacional: 'fechaRealCotizacionFleteInternacional',
    conBL: 'fechaRealConBL',
    segundoSeguimiento: 'fechaRealSegundoSeguimiento',
    enCIF: 'fechaRealEnCIF',
    recibido: 'fechaRealRecibido',
  };

  // Estados que tienen fecha real editable (desde aprobacionCompra en adelante)
  private readonly ESTADOS_CON_FECHA_REAL: string[] = [
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

  /**
   * Actualizar fecha límite de un estado específico
   *
   * Reglas:
   * 1. No se puede modificar fechas de estados ya completados
   * 2. No se puede modificar cotizado ni conDescuento
   * 3. La nueva fecha no puede ser menor a la fecha límite actual
   * 4. La nueva fecha no puede ser mayor a la fecha límite del siguiente estado
   */
  async updateFechaLimite(
    id: string,
    estado: string,
    nuevaFechaLimite: Date,
  ): Promise<{
    message: string;
    fechaAnterior: Date | null;
    fechaNueva: Date;
  }> {
    // 1. Validar que el estado sea válido y modificable
    const estadosNoModificables = ['cotizado', 'conDescuento'];
    if (estadosNoModificables.includes(estado)) {
      throw new BadRequestException(
        `No se puede modificar la fecha límite del estado "${estado}". Los estados Cotizado y Con Descuento no son editables.`,
      );
    }

    const fechaLimiteField = this.ESTADO_TO_FECHA_LIMITE_FIELD[estado];
    if (!fechaLimiteField) {
      throw new BadRequestException(`Estado "${estado}" no es válido`);
    }

    // 2. Obtener el producto
    const producto = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: { tipoCompra: true },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // 3. Determinar el tipo de compra y estados aplicables
    const tipoCompra = producto.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadosAplicables =
      tipoCompra === 'NACIONAL'
        ? this.ESTADOS_NACIONAL
        : this.ESTADOS_INTERNACIONAL;

    // Verificar que el estado aplique para este tipo de compra
    if (!estadosAplicables.includes(estado)) {
      throw new BadRequestException(
        `El estado "${estado}" no aplica para compras de tipo ${tipoCompra}`,
      );
    }

    // 4. Verificar que el estado NO esté completado
    const booleanField = this.ESTADO_TO_BOOLEAN_FIELD[estado];
    if (producto[booleanField] === true) {
      throw new BadRequestException(
        `No se puede modificar la fecha límite de "${estado}" porque ya fue completado`,
      );
    }

    // 5. Obtener la fecha límite actual
    const fechaLimiteActual = producto[fechaLimiteField] as Date | null;

    // 6. Validar que la nueva fecha no sea menor a la actual
    if (fechaLimiteActual && nuevaFechaLimite < fechaLimiteActual) {
      throw new BadRequestException(
        `La nueva fecha límite no puede ser menor a la fecha actual (${fechaLimiteActual.toISOString().split('T')[0]})`,
      );
    }

    // 7. Validar contra la fecha límite del siguiente estado
    const indexActual = estadosAplicables.indexOf(estado);
    if (indexActual < estadosAplicables.length - 1) {
      const siguienteEstado = estadosAplicables[indexActual + 1];
      const siguienteFechaLimiteField =
        this.ESTADO_TO_FECHA_LIMITE_FIELD[siguienteEstado];
      const siguienteFechaLimite = producto[
        siguienteFechaLimiteField
      ] as Date | null;

      if (siguienteFechaLimite && nuevaFechaLimite > siguienteFechaLimite) {
        throw new BadRequestException(
          `La nueva fecha límite no puede ser mayor a la fecha límite del siguiente estado "${siguienteEstado}" (${siguienteFechaLimite.toISOString().split('T')[0]})`,
        );
      }
    }

    // 8. Actualizar la fecha límite
    const updateData = {
      [fechaLimiteField]: nuevaFechaLimite,
      actualizado: new Date(),
    };

    await this.prisma.estadoProducto.update({
      where: { id },
      data: updateData,
    });

    console.log(`Fecha límite de "${estado}" actualizada para producto ${id}`);

    return {
      message: `Fecha límite de "${estado}" actualizada correctamente`,
      fechaAnterior: fechaLimiteActual,
      fechaNueva: nuevaFechaLimite,
    };
  }
  /**
   * Verifica documentos requeridos de un estado antes de permitir avanzar
   */
  private async verificarDocumentosParaAvanzar(
    estadoProductoId: string,
    estado: string,
  ): Promise<{ completo: boolean; faltantes: string[] }> {
    // Obtener requeridos obligatorios
    const requeridos = await this.prisma.documentoRequerido.findMany({
      where: { estado, activo: true, obligatorio: true },
    });

    // Si no hay requeridos para este estado, está completo
    if (requeridos.length === 0) {
      return { completo: true, faltantes: [] };
    }

    // Obtener adjuntos
    const adjuntos = await this.prisma.documentoAdjunto.findMany({
      where: { estadoProductoId, estado },
    });

    const faltantes: string[] = [];

    for (const req of requeridos) {
      const tieneArchivo = adjuntos.some(
        (a) => a.documentoRequeridoId === req.id && !a.noAplica,
      );
      const tieneNoAplica = adjuntos.some(
        (a) => a.documentoRequeridoId === req.id && a.noAplica,
      );

      if (!tieneArchivo && !tieneNoAplica) {
        faltantes.push(req.nombre);
      }
    }

    // Si hay "no aplica", validar justificación
    const hayNoAplica = adjuntos.some((a) => a.noAplica);
    if (hayNoAplica) {
      const justificacion = await this.prisma.justificacionNoAplica.findUnique({
        where: {
          estadoProductoId_estado: { estadoProductoId, estado },
        },
      });
      if (!justificacion || !justificacion.justificacion.trim()) {
        faltantes.push(
          'Justificación requerida para documentos marcados "No aplica"',
        );
      }
    }

    return { completo: faltantes.length === 0, faltantes };
  }

  /**
   * Avanzar al siguiente estado
   * Requiere evidencia o marcar como "No aplica"
   */
  async avanzarEstado(id: string, dto: AvanzarEstadoDto, user: UserJwt) {
    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: { cotizacion: true },
    });

    if (!estado) throw new NotFoundException();

    const tipoCompra = estado.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);
    const estadoActual = this.obtenerEstadoActual(estado);
    const indexActual = estadosAplicables.indexOf(
      estadoActual as EstadoProceso,
    );

    if (indexActual >= estadosAplicables.length - 1) {
      throw new BadRequestException('El producto ya está en el último estado');
    }

    const siguienteEstado = estadosAplicables[indexActual + 1];
    const verificacion = await this.verificarDocumentosParaAvanzar(
      id,
      estadoActual,
    );
    if (!verificacion.completo) {
      throw new BadRequestException(
        `No se puede avanzar. Documentos pendientes en "${ESTADO_LABELS[estadoActual]}": ${verificacion.faltantes.join(', ')}`,
      );
    }

    const ahora = new Date();

    // Preparar datos de actualización
    const updateData: any = {
      [siguienteEstado]: true,
      [ESTADO_A_CAMPO_FECHA[siguienteEstado]]: ahora,
      actualizado: ahora,
    };

    // Si hay evidencia, guardarla
    if (dto.evidenciaUrl) {
      const campoEvidencia = `evidencia${siguienteEstado.charAt(0).toUpperCase() + siguienteEstado.slice(1)}`;
      updateData[campoEvidencia] = dto.evidenciaUrl;
    } else if (dto.noAplicaEvidencia) {
      const campoEvidencia = `evidencia${siguienteEstado.charAt(0).toUpperCase() + siguienteEstado.slice(1)}`;
      updateData[campoEvidencia] = `NO_APLICA_${ahora.getTime()}`;
    }

    // ========================================
    // NUEVO: Manejo especial para estado enFOB
    // ========================================
    if (siguienteEstado === EstadoProceso.EN_FOB && dto.tipoEntrega) {
      updateData.tipoEntrega = dto.tipoEntrega;

      // Si es CIF, auto-completar cotizacionFleteInternacional
      if (dto.tipoEntrega === 'CIF' && tipoCompra === 'INTERNACIONAL') {
        updateData[EstadoProceso.COTIZACION_FLETE_INTERNACIONAL] = true;
        updateData.fechaCotizacionFleteInternacional = ahora;
        updateData.evidenciaCotizacionFleteInternacional = `AUTO_CIF_${ahora.getTime()}`;
      }
    }

    // Actualizar observaciones si hay
    if (dto.observacion) {
      updateData.observaciones = estado.observaciones
        ? `${estado.observaciones}\n[${ahora.toISOString()}] ${dto.observacion}`
        : `[${ahora.toISOString()}] ${dto.observacion}`;
    }

    // Calcular criticidad
    const { criticidad, nivelCriticidad, diasRetraso } =
      this.calcularCriticidad(estado, siguienteEstado, ahora);

    updateData.criticidad = criticidad;
    updateData.nivelCriticidad = nivelCriticidad;
    updateData.diasRetrasoActual = diasRetraso;

    // Guardar
    const updated = await this.prisma.estadoProducto.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Estado avanzado correctamente',
      estadoAnterior: estadoActual,
      estadoNuevo: siguienteEstado,
      tipoEntrega: dto.tipoEntrega,
      autoCompletado:
        dto.tipoEntrega === 'CIF' ? ['cotizacionFleteInternacional'] : [],
    };
  }
  /**
   * Cambiar a un estado específico
   * Valida que sea un estado aplicable según el tipo de compra
   */
  async cambiarEstado(id: string, dto: CambiarEstadoDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden cambiar estados');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: {
        cotizacion: { select: { tipoCompra: true } },
      },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const tipoCompra = estado.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);

    // Validar que el estado sea aplicable para este tipo de compra
    if (!estadosAplicables.includes(dto.estado)) {
      throw new BadRequestException(
        `El estado "${ESTADO_LABELS[dto.estado]}" no aplica para compras ${tipoCompra}. ` +
          `Estados válidos: ${estadosAplicables.map((e) => ESTADO_LABELS[e]).join(', ')}`,
      );
    }

    const campoFecha = ESTADO_A_CAMPO_FECHA[dto.estado];
    const fechaActual = new Date();

    // Preparar data para actualizar
    const updateData: any = {
      [dto.estado]: true,
      [campoFecha]: fechaActual,
    };

    // Guardar evidencia si se proporcionó
    if (dto.evidenciaUrl) {
      updateData[
        `evidencia${dto.estado.charAt(0).toUpperCase() + dto.estado.slice(1)}`
      ] = dto.evidenciaUrl;
    } else if (dto.noAplicaEvidencia) {
      updateData[
        `evidencia${dto.estado.charAt(0).toUpperCase() + dto.estado.slice(1)}`
      ] = `NO_APLICA_${Date.now()}`;
    }

    // Si hay observaciones, actualizar
    if (dto.observacion) {
      updateData.observaciones = dto.observacion;
    }

    // Para compras NACIONALES, al llegar a PAGADO, también marcar los estados intermedios como completados
    if (tipoCompra === 'NACIONAL' && dto.estado === EstadoProceso.PAGADO) {
      // No se marcan los estados internacionales, se quedan en null
    }

    // Recalcular criticidad y retraso
    const { criticidad, nivelCriticidad, diasRetraso } =
      this.calcularCriticidad(estado, dto.estado, fechaActual);

    updateData.criticidad = criticidad;
    updateData.nivelCriticidad = nivelCriticidad;
    updateData.diasRetrasoActual = diasRetraso;
    updateData.estadoGeneral = this.determinarEstadoGeneral(nivelCriticidad);

    const updated = await this.prisma.estadoProducto.update({
      where: { id },
      data: updateData,
      include: {
        proyecto: { select: { nombre: true } },
        cotizacion: { select: { nombreCotizacion: true, tipoCompra: true } },
        paisOrigen: { select: { nombre: true } },
      },
    });

    return {
      ...updated,
      estadoActual: this.obtenerEstadoActual(updated),
      progreso: this.calcularProgreso(updated, tipoCompra),
      siguienteEstado: this.obtenerSiguienteEstado(updated, tipoCompra),
    };
  }

  /**
   * Actualizar fechas reales de un producto
   */
  async actualizarFechas(id: string, dto: ActualizarFechasDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'Solo supervisores pueden actualizar fechas',
      );
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    return this.prisma.estadoProducto.update({
      where: { id },
      data: dto as any,
    });
  }

  /**
   * Actualizar fechas límite
   */
  async actualizarFechasLimite(
    id: string,
    dto: ActualizarFechasLimiteDto,
    user: UserJwt,
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'Solo supervisores pueden actualizar fechas límite',
      );
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    return this.prisma.estadoProducto.update({
      where: { id },
      data: dto as any,
    });
  }

  /**
   * Obtener productos por proyecto
   */
  async getByProyecto(proyectoId: string, user: UserJwt) {
    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        proyectoId,
        aprobadoPorSupervisor: true,
      },
      include: {
        cotizacion: {
          select: { nombreCotizacion: true, tipoCompra: true },
        },
        paisOrigen: {
          select: { nombre: true },
        },
      },
      orderBy: [{ criticidad: 'desc' }, { actualizado: 'desc' }],
    });

    return productos.map((p) => ({
      ...p,
      estadoActual: this.obtenerEstadoActual(p),
      progreso: this.calcularProgreso(p, p.cotizacion?.tipoCompra),
      tipoCompra: p.cotizacion?.tipoCompra || 'INTERNACIONAL',
    }));
  }

  /**
   * Obtener productos críticos (con retrasos)
   */
  async getCriticos(user: UserJwt) {
    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        aprobadoPorSupervisor: true,
        OR: [{ nivelCriticidad: 'ALTO' }, { diasRetrasoActual: { gt: 0 } }],
      },
      include: {
        proyecto: { select: { nombre: true } },
        cotizacion: {
          select: {
            nombreCotizacion: true,
            tipoCompra: true,
            solicitante: {
              select: {
                id: true,
                nombre: true,
                email: true,
                departamento: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        paisOrigen: { select: { nombre: true } },
      },
      orderBy: [{ diasRetrasoActual: 'desc' }, { criticidad: 'desc' }],
      take: 50,
    });

    return productos.map((p) => ({
      ...p,
      estadoActual: this.obtenerEstadoActual(p),
      progreso: this.calcularProgreso(p, p.cotizacion?.tipoCompra),
      tipoCompra: p.cotizacion?.tipoCompra || 'INTERNACIONAL',
    }));
  }

  /**
   * Obtener productos del solicitante actual (mis productos en compra)
   * Permite al usuario ver el estado de compra de sus productos aprobados
   */
  async getMisProductos(user: UserJwt) {
    // Obtener todos los productos de cotizaciones donde el usuario es el solicitante
    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        aprobadoPorSupervisor: true,
        cotizacion: {
          solicitanteId: user.sub,
        },
      },
      include: {
        proyecto: { select: { nombre: true } },
        cotizacion: {
          select: {
            id: true,
            nombreCotizacion: true,
            tipoCompra: true,
            estado: true,
            fechaLimite: true,
            solicitante: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
        paisOrigen: { select: { nombre: true } },
      },
      orderBy: [
        { recibido: 'asc' }, // Los no recibidos primero
        { criticidad: 'desc' },
        { actualizado: 'desc' },
      ],
    });

    return {
      total: productos.length,
      recibidos: productos.filter((p) => p.recibido).length,
      enProceso: productos.filter((p) => !p.recibido).length,
      items: productos.map((p) => ({
        ...p,
        estadoActual: this.obtenerEstadoActual(p),
        progreso: this.calcularProgreso(p, p.cotizacion?.tipoCompra),
        tipoCompra: p.cotizacion?.tipoCompra || 'INTERNACIONAL',
      })),
    };
  }

  /**
   * Aprobar producto por supervisor
   */
  async aprobarProducto(id: string, dto: AprobarProductoDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'Solo supervisores pueden aprobar productos',
      );
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: { cotizacion: true },
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const updated = await this.prisma.estadoProducto.update({
      where: { id },
      data: {
        aprobadoPorSupervisor: dto.aprobado,
        fechaAprobacion: dto.aprobado ? new Date() : null,
        observaciones: dto.observaciones,
      },
    });

    let cotizacionId = estado.cotizacionId;
    if (!cotizacionId) {
      throw new BadRequestException('Cotización asociada no encontrada');
    }

    // Verificar si todos los productos de la cotización están aprobados
    await this.verificarAprobacionCompleta(cotizacionId);

    return updated;
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Obtener estados aplicables según tipo de compra
   */
  private getEstadosAplicables(tipoCompra?: string): EstadoProceso[] {
    return tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;
  }

  /**
   * Obtener el estado actual del producto
   */
  private obtenerEstadoActual(estado: any): string {
    // Recorremos de atrás hacia adelante para encontrar el último estado completado
    const estadosAplicables = this.getEstadosAplicables(
      estado.cotizacion?.tipoCompra,
    );

    for (let i = estadosAplicables.length - 1; i >= 0; i--) {
      const estadoKey = estadosAplicables[i];
      if (estado[estadoKey]) {
        return estadoKey;
      }
    }
    return estadosAplicables[0]; // cotizado por defecto
  }

  /**
   * Obtener el siguiente estado
   */
  private obtenerSiguienteEstado(
    estado: any,
    tipoCompra?: string,
  ): EstadoProceso | null {
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);
    const estadoActual = this.obtenerEstadoActual(estado);
    const indexActual = estadosAplicables.indexOf(
      estadoActual as EstadoProceso,
    );

    if (indexActual === -1 || indexActual >= estadosAplicables.length - 1) {
      return null; // Ya está en el último estado
    }

    return estadosAplicables[indexActual + 1];
  }

  /**
   * Calcular progreso en porcentaje (0-100)
   */
  private calcularProgreso(estado: any, tipoCompra?: string): number {
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);
    let estadosCompletados = 0;

    for (const estadoKey of estadosAplicables) {
      if (estado[estadoKey]) {
        estadosCompletados++;
      }
    }

    return Math.round((estadosCompletados / estadosAplicables.length) * 100);
  }

  /**
   * Generar timeline completo con fechas y retrasos
   * Solo incluye los estados aplicables según el tipo de compra
   */
  private generarTimeline(estado: any, tipoCompra?: string) {
    const estadosAplicables = this.getEstadosAplicables(tipoCompra);

    return estadosAplicables.map((estadoKey) => {
      const completado = estado[estadoKey];
      const campoFecha = ESTADO_A_CAMPO_FECHA[estadoKey];
      const campoFechaLimite = `fechaLimite${campoFecha.replace('fecha', '')}`;
      const campoEvidencia = `evidencia${estadoKey.charAt(0).toUpperCase() + estadoKey.slice(1)}`;

      // NUEVO: Campo de fecha real
      const campoFechaReal = `fechaReal${campoFecha.replace('fecha', '')}`;

      const fecha = estado[campoFecha];
      const fechaLimite = estado[campoFechaLimite];
      const evidencia = estado[campoEvidencia];

      // NUEVO: Obtener fecha real y determinar si este estado la tiene
      const fechaReal = estado[campoFechaReal] || null;
      const tieneFechaReal = this.ESTADOS_CON_FECHA_REAL.includes(estadoKey);

      let diasRetraso = 0;
      let enTiempo = true;

      if (fechaLimite) {
        const fechaComparar = fecha ? new Date(fecha) : new Date();
        const limite = new Date(fechaLimite);
        diasRetraso = Math.max(
          0,
          Math.floor(
            (fechaComparar.getTime() - limite.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        );
        enTiempo = diasRetraso === 0;
      }

      return {
        estado: estadoKey,
        label: ESTADO_LABELS[estadoKey],
        completado,
        fecha,
        fechaLimite,
        fechaReal, // ← NUEVO
        tieneFechaReal, // ← NUEVO
        diasRetraso,
        enTiempo,
        evidencia,
        tieneEvidencia: !!evidencia,
        esNoAplica: evidencia?.startsWith('NO_APLICA_') || false,
      };
    });
  }

  /**
   * Calcular criticidad basada en retrasos
   */
  private calcularCriticidad(
    estado: any,
    nuevoEstado: EstadoProceso,
    fecha: Date,
  ) {
    const campoFechaLimite = `fechaLimite${ESTADO_A_CAMPO_FECHA[nuevoEstado].replace('fecha', '')}`;
    const fechaLimite = estado[campoFechaLimite];

    let diasRetraso = 0;
    if (fechaLimite) {
      diasRetraso = Math.max(
        0,
        Math.floor(
          (fecha.getTime() - new Date(fechaLimite).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
    }

    let criticidad = 5;
    let nivelCriticidad = 'MEDIO';

    if (diasRetraso === 0) {
      criticidad = 3;
      nivelCriticidad = 'BAJO';
    } else if (diasRetraso <= 3) {
      criticidad = 5;
      nivelCriticidad = 'MEDIO';
    } else if (diasRetraso <= 7) {
      criticidad = 7;
      nivelCriticidad = 'ALTO';
    } else {
      criticidad = 10;
      nivelCriticidad = 'ALTO';
    }

    return { criticidad, nivelCriticidad, diasRetraso };
  }

  /**
   * Determinar estado general (success/warn/danger)
   */
  private determinarEstadoGeneral(nivelCriticidad: string): string {
    switch (nivelCriticidad) {
      case 'BAJO':
        return 'success';
      case 'MEDIO':
        return 'warn';
      case 'ALTO':
        return 'danger';
      default:
        return 'warn';
    }
  }

  /**
   * Calcular fechas límite desde TimelineSKU
   */
  private calcularFechasLimite(fechaInicial: Date, timeline: any) {
    const fechas: any = {};
    let fechaActual = new Date(fechaInicial);

    const mapeo = [
      {
        dias: timeline.diasCotizadoADescuento,
        campo: 'fechaLimiteConDescuento',
      },
      {
        dias: timeline.diasAprobacionCompra,
        campo: 'fechaLimiteAprobacionCompra',
      },
      { dias: timeline.diasDescuentoAComprado, campo: 'fechaLimiteComprado' },
      { dias: timeline.diasCompradoAPagado, campo: 'fechaLimitePagado' },
      {
        dias: timeline.diasAprobacionPlanos,
        campo: 'fechaLimiteAprobacionPlanos',
      },
      {
        dias: timeline.diasPagadoASeguimiento1,
        campo: 'fechaLimitePrimerSeguimiento',
      },
      { dias: timeline.diasSeguimiento1AFob, campo: 'fechaLimiteEnFOB' },
      {
        dias: timeline.diasFobACotizacionFlete, // ← NUEVO
        campo: 'fechaLimiteCotizacionFleteInternacional',
      },
      {
        dias: timeline.diasCotizacionFleteABl, // ← ACTUALIZADO (antes era diasFobABl)
        campo: 'fechaLimiteConBL',
      },
      {
        dias: timeline.diasBlASeguimiento2,
        campo: 'fechaLimiteSegundoSeguimiento',
      },
      { dias: timeline.diasSeguimiento2ACif, campo: 'fechaLimiteEnCIF' },
      { dias: timeline.diasCifARecibido, campo: 'fechaLimiteRecibido' },
    ];

    fechas.fechaLimiteCotizado = fechaInicial;

    for (const { dias, campo } of mapeo) {
      if (dias !== null && dias !== undefined) {
        fechaActual = new Date(
          fechaActual.getTime() + dias * 24 * 60 * 60 * 1000,
        );
        fechas[campo] = new Date(fechaActual);
      }
    }

    return fechas;
  }

  /**
   * Verificar si todos los productos de la cotización están aprobados
   */
  private async verificarAprobacionCompleta(cotizacionId: string) {
    const productos = await this.prisma.estadoProducto.findMany({
      where: { cotizacionId },
    });

    const todosAprobados = productos.every((p) => p.aprobadoPorSupervisor);
    const algunoAprobado = productos.some((p) => p.aprobadoPorSupervisor);

    await this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        todosProductosAprobados: todosAprobados,
        aprobadaParcialmente: algunoAprobado && !todosAprobados,
      },
    });
  }

  /**
   * Verificar si es supervisor o admin
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }

  /**
   * Actualizar fecha real de un estado + registrar en historial
   * Solo supervisores pueden hacer esto
   */
  async updateFechaReal(
    id: string,
    estado: string,
    nuevaFechaReal: Date,
    userId: string,
  ): Promise<{
    message: string;
    fechaAnterior: Date | null;
    fechaNueva: Date;
    historialId: string;
  }> {
    // 1. Validar que el estado tenga fecha real
    if (!this.ESTADOS_CON_FECHA_REAL.includes(estado)) {
      throw new BadRequestException(
        `El estado "${estado}" no tiene fecha real editable`,
      );
    }

    const fechaRealField = this.ESTADO_TO_FECHA_REAL_FIELD[estado];
    if (!fechaRealField) {
      throw new BadRequestException(`Estado "${estado}" no es válido`);
    }

    // 2. Obtener el producto
    const producto = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: {
        cotizacion: {
          select: { tipoCompra: true },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // 3. Verificar que el estado aplique para este tipo de compra
    const tipoCompra = producto.cotizacion?.tipoCompra || 'INTERNACIONAL';
    const estadosAplicables =
      tipoCompra === 'NACIONAL'
        ? this.ESTADOS_NACIONAL
        : this.ESTADOS_INTERNACIONAL;

    if (!estadosAplicables.includes(estado)) {
      throw new BadRequestException(
        `El estado "${estado}" no aplica para compras de tipo ${tipoCompra}`,
      );
    }

    // 4. Verificar que el estado NO esté completado
    const booleanField = this.ESTADO_TO_BOOLEAN_FIELD[estado];
    if (producto[booleanField] === true) {
      throw new BadRequestException(
        `No se puede modificar la fecha real de "${estado}" porque ya fue completado`,
      );
    }

    // 5. Obtener la fecha real actual
    const fechaRealActual = producto[fechaRealField] as Date | null;

    // 6. Validar que la nueva fecha no sea menor a la fecha real actual
    if (fechaRealActual && nuevaFechaReal < new Date(fechaRealActual)) {
      throw new BadRequestException(
        `La nueva fecha real no puede ser menor a la actual (${new Date(fechaRealActual).toISOString().split('T')[0]})`,
      );
    }

    // 7. Validar contra la fecha real del siguiente estado
    const indexActual = estadosAplicables.indexOf(estado);
    if (indexActual >= 0 && indexActual < estadosAplicables.length - 1) {
      const siguienteEstado = estadosAplicables[indexActual + 1];
      const siguienteFechaRealField =
        this.ESTADO_TO_FECHA_REAL_FIELD[siguienteEstado];

      // El siguiente estado puede no tener fecha real (ej: cotizado, conDescuento)
      // En ese caso no validamos contra él
      if (siguienteFechaRealField) {
        const siguienteFechaReal = producto[
          siguienteFechaRealField
        ] as Date | null;

        if (
          siguienteFechaReal &&
          nuevaFechaReal > new Date(siguienteFechaReal)
        ) {
          const labelSiguiente =
            ESTADO_LABELS[siguienteEstado] || siguienteEstado;
          throw new BadRequestException(
            `La nueva fecha real no puede ser mayor a la fecha real del siguiente estado "${labelSiguiente}" (${new Date(siguienteFechaReal).toISOString().split('T')[0]})`,
          );
        }
      }
    }

    // 8. Ejecutar en transacción: actualizar fecha real + crear historial
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Actualizar la fecha real en estado_producto
      await tx.estadoProducto.update({
        where: { id },
        data: {
          [fechaRealField]: nuevaFechaReal,
          actualizado: new Date(),
        },
      });

      // Crear registro en historial
      const historial = await tx.historialFechaLimite.create({
        data: {
          estadoProductoId: id,
          estado: estado,
          fechaAnterior: fechaRealActual,
          fechaNueva: nuevaFechaReal,
          creadoPorId: userId,
        },
      });

      return historial;
    });

    console.log(
      `Fecha real de "${estado}" actualizada para producto ${id} por usuario ${userId}`,
    );

    return {
      message: `Fecha real de "${estado}" actualizada correctamente`,
      fechaAnterior: fechaRealActual,
      fechaNueva: nuevaFechaReal,
      historialId: resultado.id,
    };
  }

  /**
   * Obtener historial de cambios de fecha para un estado producto
   */
  async getHistorialFechas(
    estadoProductoId: string,
    estado?: string,
  ): Promise<any[]> {
    const where: any = { estadoProductoId };
    if (estado) where.estado = estado;

    return this.prisma.historialFechaLimite.findMany({
      where,
      include: {
        creadoPor: {
          select: { id: true, nombre: true, email: true },
        },
      },
      orderBy: { creado: 'desc' },
    });
  }
}
