import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
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
  EstadoProceso
} from './dto/estado-producto.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Orden secuencial de los 10 estados
 */
const ORDEN_ESTADOS: EstadoProceso[] = [
  EstadoProceso.COTIZADO,
  EstadoProceso.CON_DESCUENTO,
  EstadoProceso.COMPRADO,
  EstadoProceso.PAGADO,
  EstadoProceso.PRIMER_SEGUIMIENTO,
  EstadoProceso.EN_FOB,
  EstadoProceso.CON_BL,
  EstadoProceso.SEGUNDO_SEGUIMIENTO,
  EstadoProceso.EN_CIF,
  EstadoProceso.RECIBIDO
];

/**
 * Mapeo de estados a nombres de campos de fecha
 */
const ESTADO_A_CAMPO_FECHA: Record<EstadoProceso, string> = {
  [EstadoProceso.COTIZADO]: 'fechaCotizado',
  [EstadoProceso.CON_DESCUENTO]: 'fechaConDescuento',
  [EstadoProceso.COMPRADO]: 'fechaComprado',
  [EstadoProceso.PAGADO]: 'fechaPagado',
  [EstadoProceso.PRIMER_SEGUIMIENTO]: 'fechaPrimerSeguimiento',
  [EstadoProceso.EN_FOB]: 'fechaEnFOB',
  [EstadoProceso.CON_BL]: 'fechaConBL',
  [EstadoProceso.SEGUNDO_SEGUIMIENTO]: 'fechaSegundoSeguimiento',
  [EstadoProceso.EN_CIF]: 'fechaEnCIF',
  [EstadoProceso.RECIBIDO]: 'fechaRecibido'
};

/**
 * Service para gestión de Estado Producto
 * Sistema completo de tracking de las 10 etapas
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
      where: { id: dto.cotizacionId }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Obtener timeline del SKU si existe
    const timelineSKU = await this.prisma.timelineSKU.findUnique({
      where: { sku: dto.sku }
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
        medioTransporte: dto.medioTransporte,
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
        estadoGeneral: 'warn'
      },
      include: {
        proyecto: true,
        cotizacion: {
          select: { nombreCotizacion: true }
        },
        paisOrigen: true
      }
    });
  }

  /**
   * Listar estados de productos con filtros
   */
  async list(filters: ListEstadoProductoQueryDto, user: UserJwt) {
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.proyectoId) where.proyectoId = filters.proyectoId;
    if (filters.cotizacionId) where.cotizacionId = filters.cotizacionId;
    if (filters.sku) where.sku = { contains: filters.sku, mode: 'insensitive' };
    if (filters.nivelCriticidad) where.nivelCriticidad = filters.nivelCriticidad;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.estadoProducto.count({ where }),
      this.prisma.estadoProducto.findMany({
        where,
        include: {
          proyecto: { select: { nombre: true } },
          cotizacion: { select: { nombreCotizacion: true } },
          paisOrigen: { select: { nombre: true } }
        },
        orderBy: [
          { criticidad: 'desc' },
          { actualizado: 'desc' }
        ],
        skip,
        take: pageSize
      })
    ]);

    return {
      page,
      pageSize,
      total,
      items: items.map(item => ({
        ...item,
        estadoActual: this.obtenerEstadoActual(item),
        progreso: this.calcularProgreso(item)
      }))
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
              select: { nombre: true, email: true }
            }
          }
        },
        cotizacionDetalle: true,
        compra: true,
        compraDetalle: true,
        paisOrigen: true
      }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    return {
      ...estado,
      estadoActual: this.obtenerEstadoActual(estado),
      progreso: this.calcularProgreso(estado),
      timeline: this.generarTimeline(estado)
    };
  }

  /**
   * Avanzar al siguiente estado
   */
  async avanzarEstado(id: string, dto: AvanzarEstadoDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden avanzar estados');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const estadoActual = this.obtenerEstadoActual(estado);
    const indexActual = ORDEN_ESTADOS.indexOf(estadoActual as EstadoProceso);

    if (indexActual === -1 || indexActual >= ORDEN_ESTADOS.length - 1) {
      throw new BadRequestException('El producto ya está en el último estado');
    }

    const siguienteEstado = ORDEN_ESTADOS[indexActual + 1];

    return this.cambiarEstado(id, {
      estado: siguienteEstado,
      observacion: dto.observacion
    }, user);
  }

  /**
   * Cambiar a un estado específico
   */
  async cambiarEstado(id: string, dto: CambiarEstadoDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden cambiar estados');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const campoFecha = ESTADO_A_CAMPO_FECHA[dto.estado];
    const fechaActual = new Date();

    // Preparar data para actualizar
    const updateData: any = {
      [dto.estado]: true,
      [campoFecha]: fechaActual
    };

    // Si hay observaciones, actualizar
    if (dto.observacion) {
      updateData.observaciones = dto.observacion;
    }

    // Recalcular criticidad y retraso
    const { criticidad, nivelCriticidad, diasRetraso } = this.calcularCriticidad(
      estado,
      dto.estado,
      fechaActual
    );

    updateData.criticidad = criticidad;
    updateData.nivelCriticidad = nivelCriticidad;
    updateData.diasRetrasoActual = diasRetraso;
    updateData.estadoGeneral = this.determinarEstadoGeneral(nivelCriticidad);

    return this.prisma.estadoProducto.update({
      where: { id },
      data: updateData,
      include: {
        proyecto: true,
        cotizacion: true,
        paisOrigen: true
      }
    });
  }

  /**
   * Actualizar fechas manualmente
   */
  async actualizarFechas(id: string, dto: ActualizarFechasDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar fechas');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const updateData: any = {};

    // Actualizar fechas proporcionadas
    if (dto.fechaCotizado) updateData.fechaCotizado = new Date(dto.fechaCotizado);
    if (dto.fechaConDescuento) updateData.fechaConDescuento = new Date(dto.fechaConDescuento);
    if (dto.fechaComprado) updateData.fechaComprado = new Date(dto.fechaComprado);
    if (dto.fechaPagado) updateData.fechaPagado = new Date(dto.fechaPagado);
    if (dto.fechaPrimerSeguimiento) updateData.fechaPrimerSeguimiento = new Date(dto.fechaPrimerSeguimiento);
    if (dto.fechaEnFOB) updateData.fechaEnFOB = new Date(dto.fechaEnFOB);
    if (dto.fechaConBL) updateData.fechaConBL = new Date(dto.fechaConBL);
    if (dto.fechaSegundoSeguimiento) updateData.fechaSegundoSeguimiento = new Date(dto.fechaSegundoSeguimiento);
    if (dto.fechaEnCIF) updateData.fechaEnCIF = new Date(dto.fechaEnCIF);
    if (dto.fechaRecibido) updateData.fechaRecibido = new Date(dto.fechaRecibido);

    return this.prisma.estadoProducto.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Actualizar fechas límite manualmente
   */
  async actualizarFechasLimite(id: string, dto: ActualizarFechasLimiteDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden actualizar fechas límite');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const updateData: any = {};

    if (dto.fechaLimiteCotizado) updateData.fechaLimiteCotizado = new Date(dto.fechaLimiteCotizado);
    if (dto.fechaLimiteConDescuento) updateData.fechaLimiteConDescuento = new Date(dto.fechaLimiteConDescuento);
    if (dto.fechaLimiteComprado) updateData.fechaLimiteComprado = new Date(dto.fechaLimiteComprado);
    if (dto.fechaLimitePagado) updateData.fechaLimitePagado = new Date(dto.fechaLimitePagado);
    if (dto.fechaLimitePrimerSeguimiento) updateData.fechaLimitePrimerSeguimiento = new Date(dto.fechaLimitePrimerSeguimiento);
    if (dto.fechaLimiteEnFOB) updateData.fechaLimiteEnFOB = new Date(dto.fechaLimiteEnFOB);
    if (dto.fechaLimiteConBL) updateData.fechaLimiteConBL = new Date(dto.fechaLimiteConBL);
    if (dto.fechaLimiteSegundoSeguimiento) updateData.fechaLimiteSegundoSeguimiento = new Date(dto.fechaLimiteSegundoSeguimiento);
    if (dto.fechaLimiteEnCIF) updateData.fechaLimiteEnCIF = new Date(dto.fechaLimiteEnCIF);
    if (dto.fechaLimiteRecibido) updateData.fechaLimiteRecibido = new Date(dto.fechaLimiteRecibido);

    return this.prisma.estadoProducto.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Obtener timeline completo con retrasos
   */
  async getTimeline(id: string, user: UserJwt) {
    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const timeline = this.generarTimeline(estado);
    const estadoActual = this.obtenerEstadoActual(estado);
    const progreso = this.calcularProgreso(estado);

    return {
      estadoActual,
      progreso,
      timeline,
      criticidad: estado.criticidad,
      nivelCriticidad: estado.nivelCriticidad,
      diasRetrasoTotal: estado.diasRetrasoActual
    };
  }

  /**
   * Obtener productos por proyecto
   */
  async getByProyecto(proyectoId: string, user: UserJwt) {
    const productos = await this.prisma.estadoProducto.findMany({
      where: { proyectoId },
      include: {
        cotizacion: {
          select: { nombreCotizacion: true }
        },
        paisOrigen: {
          select: { nombre: true }
        }
      },
      orderBy: [
        { criticidad: 'desc' },
        { actualizado: 'desc' }
      ]
    });

    return productos.map(p => ({
      ...p,
      estadoActual: this.obtenerEstadoActual(p),
      progreso: this.calcularProgreso(p)
    }));
  }

  /**
   * Obtener productos críticos (con retrasos)
   */
  async getCriticos(user: UserJwt) {
    const productos = await this.prisma.estadoProducto.findMany({
      where: {
        OR: [
          { nivelCriticidad: 'ALTO' },
          { diasRetrasoActual: { gt: 0 } }
        ]
      },
      include: {
        proyecto: { select: { nombre: true } },
        cotizacion: { select: { nombreCotizacion: true } },
        paisOrigen: { select: { nombre: true } }
      },
      orderBy: [
        { diasRetrasoActual: 'desc' },
        { criticidad: 'desc' }
      ],
      take: 50
    });

    return productos.map(p => ({
      ...p,
      estadoActual: this.obtenerEstadoActual(p),
      progreso: this.calcularProgreso(p)
    }));
  }

  /**
   * Aprobar producto por supervisor
   */
  async aprobarProducto(id: string, dto: AprobarProductoDto, user: UserJwt) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('Solo supervisores pueden aprobar productos');
    }

    const estado = await this.prisma.estadoProducto.findUnique({
      where: { id },
      include: { cotizacion: true }
    });

    if (!estado) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const updated = await this.prisma.estadoProducto.update({
      where: { id },
      data: {
        aprobadoPorSupervisor: dto.aprobado,
        fechaAprobacion: dto.aprobado ? new Date() : null,
        observaciones: dto.observaciones
      }
    });

    let Estado = estado.cotizacionId ? estado.cotizacionId : '';
    if (Estado === '') {
      throw new BadRequestException('Cotización asociada no encontrada');
    }
    // Verificar si todos los productos de la cotización están aprobados
    await this.verificarAprobacionCompleta(Estado);

    return updated;
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Obtener el estado actual del producto
   */
  private obtenerEstadoActual(estado: any): string {
    for (let i = ORDEN_ESTADOS.length - 1; i >= 0; i--) {
      const estadoKey = ORDEN_ESTADOS[i];
      if (estado[estadoKey]) {
        return estadoKey;
      }
    }
    return ORDEN_ESTADOS[0]; // cotizado por defecto
  }

  /**
   * Calcular progreso en porcentaje (0-100)
   */
  private calcularProgreso(estado: any): number {
    let estadosCompletados = 0;
    for (const estadoKey of ORDEN_ESTADOS) {
      if (estado[estadoKey]) {
        estadosCompletados++;
      }
    }
    return Math.round((estadosCompletados / ORDEN_ESTADOS.length) * 100);
  }

  /**
   * Generar timeline completo con fechas y retrasos
   */
  private generarTimeline(estado: any) {
    return ORDEN_ESTADOS.map(estadoKey => {
      const completado = estado[estadoKey];
      const campoFecha = ESTADO_A_CAMPO_FECHA[estadoKey];
      const campoFechaLimite = `fechaLimite${campoFecha.replace('fecha', '')}`;
      
      const fecha = estado[campoFecha];
      const fechaLimite = estado[campoFechaLimite];

      let diasRetraso = 0;
      let enTiempo = true;

      if (fechaLimite) {
        const fechaComparar = fecha || new Date();
        diasRetraso = Math.max(
          0,
          Math.floor((fechaComparar.getTime() - fechaLimite.getTime()) / (1000 * 60 * 60 * 24))
        );
        enTiempo = diasRetraso === 0;
      }

      return {
        estado: estadoKey,
        completado,
        fecha,
        fechaLimite,
        diasRetraso,
        enTiempo
      };
    });
  }

  /**
   * Calcular criticidad basada en retrasos
   */
  private calcularCriticidad(estado: any, nuevoEstado: EstadoProceso, fecha: Date) {
    const campoFechaLimite = `fechaLimite${ESTADO_A_CAMPO_FECHA[nuevoEstado].replace('fecha', '')}`;
    const fechaLimite = estado[campoFechaLimite];

    let diasRetraso = 0;
    if (fechaLimite) {
      diasRetraso = Math.max(
        0,
        Math.floor((fecha.getTime() - fechaLimite.getTime()) / (1000 * 60 * 60 * 24))
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
      case 'BAJO': return 'success';
      case 'MEDIO': return 'warn';
      case 'ALTO': return 'danger';
      default: return 'warn';
    }
  }

  /**
   * Calcular fechas límite desde TimelineSKU
   */
  private calcularFechasLimite(fechaInicial: Date, timeline: any) {
    const fechas: any = {};
    let fechaActual = new Date(fechaInicial);

    const mapeo = [
      { dias: timeline.diasCotizadoADescuento, campo: 'fechaLimiteConDescuento' },
      { dias: timeline.diasDescuentoAComprado, campo: 'fechaLimiteComprado' },
      { dias: timeline.diasCompradoAPagado, campo: 'fechaLimitePagado' },
      { dias: timeline.diasPagadoASeguimiento1, campo: 'fechaLimitePrimerSeguimiento' },
      { dias: timeline.diasSeguimiento1AFob, campo: 'fechaLimiteEnFOB' },
      { dias: timeline.diasFobABl, campo: 'fechaLimiteConBL' },
      { dias: timeline.diasBlASeguimiento2, campo: 'fechaLimiteSegundoSeguimiento' },
      { dias: timeline.diasSeguimiento2ACif, campo: 'fechaLimiteEnCIF' },
      { dias: timeline.diasCifARecibido, campo: 'fechaLimiteRecibido' }
    ];

    fechas.fechaLimiteCotizado = fechaInicial;

    for (const { dias, campo } of mapeo) {
      if (dias !== null && dias !== undefined) {
        fechaActual = new Date(fechaActual.getTime() + dias * 24 * 60 * 60 * 1000);
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
      where: { cotizacionId }
    });

    const todosAprobados = productos.every(p => p.aprobadoPorSupervisor);
    const algunoAprobado = productos.some(p => p.aprobadoPorSupervisor);

    await this.prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: {
        todosProductosAprobados: todosAprobados,
        aprobadaParcialmente: algunoAprobado && !todosAprobados
      }
    });
  }

  /**
   * Verificar si es supervisor o admin
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }
}