import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EstadoProceso,
  ESTADOS_NACIONAL,
  ESTADOS_INTERNACIONAL,
  ESTADO_LABELS,
} from '../estado-producto/dto/estado-producto.dto';

// Mapeo de EstadoProceso a campo de fecha límite
const ESTADO_A_FECHA_LIMITE: Record<string, string> = {
  cotizado: 'fechaLimiteCotizado',
  conDescuento: 'fechaLimiteConDescuento',
  aprobacionCompra: 'fechaLimiteAprobacionCompra',
  comprado: 'fechaLimiteComprado',
  pagado: 'fechaLimitePagado',
  aprobacionPlanos: 'fechaLimiteAprobacionPlanos',
  primerSeguimiento: 'fechaLimitePrimerSeguimiento',
  enFOB: 'fechaLimiteEnFOB',
  cotizacionFleteInternacional: 'fechaLimiteCotizacionFleteInternacional',
  conBL: 'fechaLimiteConBL',
  segundoSeguimiento: 'fechaLimiteSegundoSeguimiento',
  enCIF: 'fechaLimiteEnCIF',
  recibido: 'fechaLimiteRecibido',
};

const ESTADO_A_FECHA: Record<string, string> = {
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
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // DASHBOARD GERENCIA
  // ============================================================================

  async getGerencia() {
    // 1. Cargar todas las áreas
    const areas = await this.prisma.area.findMany({
      orderBy: { creado: 'asc' },
    });

    // 2. Cargar todos los proyectos activos con su área
    const proyectos = await this.prisma.proyecto.findMany({
      where: { estado: true },
      include: {
        area: { select: { id: true, tipo: true } },
      },
      orderBy: { criticidad: 'desc' },
    });

    // 3. Cargar cotizaciones activas (excluir canceladas/rechazadas/completadas-archivadas
    //    y excluir tipo "logistica"), traer sus detalles (CotizacionDetalle) y los
    //    EstadoProducto vinculados para hacer un LEFT JOIN en memoria.
    //    Esto permite ver productos desde el momento en que llega la solicitud,
    //    aunque aún no exista un EstadoProducto creado.
    const cotizaciones = await this.prisma.cotizacion.findMany({
      where: {
        estado: { notIn: ['CANCELADA', 'RECHAZADA'] },
        NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
      },
      include: {
        proyecto: { select: { id: true, nombre: true, areaId: true } },
        solicitante: { select: { nombre: true } },
        supervisorResponsable: { select: { nombre: true } },
        detalles: {
          select: {
            id: true,
            sku: true,
            descripcionProducto: true,
            cantidad: true,
          },
        },
        estadosProductos: {
          where: { rechazado: false },
          include: {
            responsableSeguimiento: { select: { nombre: true } },
            ordenCompra: { select: { id: true, nombre: true, numeroOC: true } },
          },
        },
      },
    });

    // 4. Construir lista unificada de productos: para cada CotizacionDetalle,
    //    si existe EstadoProducto vinculado se usan sus flags/fechas reales;
    //    si no existe, se crea un "producto virtual" con todas las flags en
    //    false y fechas null (se mostrará como "Sin fechas definidas" en el UI).
    const productos: any[] = [];
    for (const cot of cotizaciones) {
      // Map de EstadoProducto por cotizacionDetalleId para lookup rápido
      const estadoPorDetalleId = new Map<string, any>();
      for (const ep of cot.estadosProductos) {
        if (ep.cotizacionDetalleId) {
          estadoPorDetalleId.set(ep.cotizacionDetalleId, ep);
        }
      }

      const cotizacionInfo = {
        id: cot.id,
        nombreCotizacion: cot.nombreCotizacion,
        tipoCompra: cot.tipoCompra,
        fechaSolicitud: cot.fechaSolicitud,
        fechaLimite: cot.fechaLimite,
        solicitante: cot.solicitante,
        supervisorResponsable: cot.supervisorResponsable,
      };

      for (const detalle of cot.detalles) {
        const ep = estadoPorDetalleId.get(detalle.id);
        if (ep) {
          // Producto con EstadoProducto: agregamos la cotización y el proyecto enriquecidos
          productos.push({
            ...ep,
            sinFechasDefinidas: false,
            cotizacion: cotizacionInfo,
            proyecto: cot.proyecto,
            proyectoId: cot.proyecto?.id ?? ep.proyectoId,
          });
        } else {
          // Producto "virtual" — solo existe en CotizacionDetalle.
          productos.push({
            id: `virtual-${detalle.id}`,
            sku: detalle.sku ?? '',
            descripcion: detalle.descripcionProducto,
            cantidad: detalle.cantidad,
            proveedor: null,
            precioUnitario: null,
            precioTotal: null,
            // Todas las flags de estado en false → 'pendiente'
            cotizado: false,
            conDescuento: false,
            aprobacionCompra: false,
            comprado: false,
            pagado: false,
            aprobacionPlanos: false,
            primerSeguimiento: false,
            enFOB: false,
            cotizacionFleteInternacional: false,
            conBL: false,
            segundoSeguimiento: false,
            enCIF: false,
            recibido: false,
            // Sin fechas reales ni límite
            // (calcularEstadosDetallados leerá undefined → estado 'pendiente')
            rechazado: false,
            diasRetrasoActual: 0,
            criticidad: 5,
            nivelCriticidad: 'MEDIO',
            creado: cot.fechaSolicitud,
            actualizado: cot.fechaSolicitud,
            sinFechasDefinidas: true,
            cotizacion: cotizacionInfo,
            proyecto: cot.proyecto,
            proyectoId: cot.proyecto?.id ?? null,
            responsableSeguimiento: null,
            ordenCompra: null,
          });
        }
      }
    }

    // 5. Agrupar productos por área y por proyecto
    const productosPorArea: Record<string, typeof productos> = {};
    const productosPorProyecto: Record<string, typeof productos> = {};

    for (const p of productos) {
      const areaId = p.proyecto?.areaId;
      if (areaId) {
        if (!productosPorArea[areaId]) productosPorArea[areaId] = [];
        productosPorArea[areaId].push(p);
      }
      if (p.proyectoId) {
        if (!productosPorProyecto[p.proyectoId])
          productosPorProyecto[p.proyectoId] = [];
        productosPorProyecto[p.proyectoId].push(p);
      }
    }

    // 6. Construir respuesta de áreas
    const areasConResumen = areas.map((area) => {
      const productosArea = productosPorArea[area.id] || [];
      return {
        id: area.id,
        nombre: area.nombreArea,
        tipo: area.tipo,
        icono: area.icono || '📦',
        resumen: this.calcularResumen(productosArea),
        totalProyectos: proyectos.filter((p) => p.area?.id === area.id).length,
      };
    });

    // 7. Construir proyectos con resumen
    const proyectosConResumen = proyectos.map((proy) => {
      const productosProyecto = productosPorProyecto[proy.id] || [];
      const estadoVisual = this.calcularEstadoProyecto(productosProyecto);

      return {
        id: proy.id,
        nombre: proy.nombre,
        estado: estadoVisual,
        criticidad: proy.criticidad,
        resumen: this.calcularResumen(productosProyecto),
        responsable:
          productosProyecto[0]?.responsableSeguimiento?.nombre ||
          productosProyecto[0]?.cotizacion?.supervisorResponsable?.nombre ||
          'Sin asignar',
        fechaInicio: proy.creado.toISOString(),
        fechaLimite:
          productosProyecto[0]?.cotizacion?.fechaLimite?.toISOString() ||
          proy.actualizado.toISOString(),
        areaId: proy.areaId,
        areaTipo: proy.area?.tipo,
      };
    });

    // 8. Construir productos detallados (incluye flag sinFechasDefinidas)
    const productosDetallados = productos.map((p) => {
      const tipoCompra = p.cotizacion?.tipoCompra || 'INTERNACIONAL';
      const estadosAplicables =
        tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;

      return {
        id: p.id,
        sku: p.sku,
        descripcion: p.descripcion,
        cotizacionNombre:
          p.cotizacion?.nombreCotizacion || 'Sin cotización',
        tipoCompra,
        proyectoId: p.proyectoId,
        areaId: p.proyecto?.areaId,
        responsable:
          p.responsableSeguimiento?.nombre ||
          p.cotizacion?.supervisorResponsable?.nombre ||
          'Sin asignar',
        ordenCompra: p.ordenCompra?.numeroOC || p.ordenCompra?.nombre || null,
        sinFechasDefinidas: !!p.sinFechasDefinidas,
        ...this.calcularEstadosDetallados(p, estadosAplicables),
      };
    });

    return {
      areas: areasConResumen,
      proyectos: proyectosConResumen,
      productosDetallados,
    };
  }

  // ============================================================================
  // DASHBOARD KPIs (OPERATIVO)
  // ============================================================================

  async getKpis() {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const hace30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Queries en paralelo
    const [
      cotizacionesPorEstado,
      cotizacionesSinResponsable,
      productosAprobados,
      productosConRetraso,
      cotizacionesTotal,
    ] = await Promise.all([
      // Conteo de cotizaciones por estado
      this.prisma.cotizacion.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),

      // Cotizaciones sin responsable (supervisorResponsableId null)
      this.prisma.cotizacion.count({
        where: {
          supervisorResponsableId: null,
          estado: { notIn: ['COMPLETADA', 'CANCELADA'] },
        },
      }),

      // Todos los EstadoProducto aprobados (excluir logistica)
      this.prisma.estadoProducto.findMany({
        where: {
          aprobadoPorSupervisor: true,
          rechazado: false,
          cotizacion: {
            NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
          },
        },
        include: {
          cotizacion: {
            select: {
              tipoCompra: true,
              nombreCotizacion: true,
              fechaSolicitud: true,
              fechaLimite: true,
              solicitante: {
                select: { nombre: true, departamento: { select: { nombre: true } } },
              },
              supervisorResponsable: { select: { nombre: true } },
            },
          },
          proyecto: { select: { nombre: true } },
        },
      }),

      // Productos con retraso (excluir logistica)
      this.prisma.estadoProducto.count({
        where: {
          aprobadoPorSupervisor: true,
          rechazado: false,
          diasRetrasoActual: { gt: 0 },
          cotizacion: {
            NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
          },
        },
      }),

      // Total cotizaciones activas
      this.prisma.cotizacion.count({
        where: { estado: { notIn: ['COMPLETADA', 'CANCELADA'] } },
      }),
    ]);

    // Calcular resumen de productos por etapa
    const resumenEtapas: Record<string, number> = {};
    for (const ep of Object.values(EstadoProceso)) {
      resumenEtapas[ep] = productosAprobados.filter((p) => p[ep]).length;
    }

    // Productos sin descuento (cotizados pero sin descuento)
    const sinDescuento = productosAprobados.filter(
      (p) => p.cotizado && !p.conDescuento,
    ).length;

    // Productos sin cotizar
    const sinCotizar = productosAprobados.filter((p) => !p.cotizado).length;

    // Cotizaciones vencidas (fecha límite pasada, no completadas)
    const cotizacionesVencidas = await this.prisma.cotizacion.findMany({
      where: {
        fechaLimite: { lt: now },
        estado: { notIn: ['COMPLETADA', 'CANCELADA'] },
        NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
      },
      include: {
        solicitante: {
          select: { nombre: true, departamento: { select: { nombre: true } } },
        },
        supervisorResponsable: { select: { nombre: true } },
        proyecto: { select: { nombre: true } },
        _count: { select: { detalles: true } },
      },
      orderBy: { fechaLimite: 'asc' },
    });

    // Cotizaciones rechazadas (con productos rechazados)
    const productosRechazados = await this.prisma.estadoProducto.findMany({
      where: {
        rechazado: true,
        fechaRechazo: { gte: hace30Dias },
        cotizacion: {
          NOT: { tipo: { nombre: { equals: 'logistica', mode: 'insensitive' } } },
        },
      },
      include: {
        cotizacion: { select: { nombreCotizacion: true } },
      },
      orderBy: { fechaRechazo: 'desc' },
    });

    // Promedio de días desde solicitud hasta aprobación
    const cotizacionesAprobadas = await this.prisma.cotizacion.findMany({
      where: {
        estado: { in: ['APROBADA_PARCIAL', 'APROBADA_COMPLETA'] },
        fechaAprobacion: { not: null },
      },
      select: { fechaSolicitud: true, fechaAprobacion: true },
    });

    let promedioDias = 0;
    if (cotizacionesAprobadas.length > 0) {
      const totalDias = cotizacionesAprobadas.reduce((sum, c) => {
        const diff =
          (c.fechaAprobacion!.getTime() - c.fechaSolicitud.getTime()) /
          (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      promedioDias =
        Math.round((totalDias / cotizacionesAprobadas.length) * 10) / 10;
    }

    // Monto total de precios seleccionados en cotizaciones activas
    const montosResult = await this.prisma.precios.aggregate({
      _sum: { precio: true },
      where: {
        cotizacionDetalle: {
          cotizacion: { estado: { notIn: ['CANCELADA'] } },
        },
        cotizacionDetalleSeleccionado: { some: {} },
      },
    });

    const montoTotal = Number(montosResult._sum.precio || 0);

    // Construir KPIs de cotizaciones
    const cotizacionesKpis = {
      totalEnCurso: cotizacionesTotal,
      porEstado: cotizacionesPorEstado.reduce(
        (acc, e) => {
          acc[e.estado] = e._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      sinResponsable: cotizacionesSinResponsable,
      sinDescuento,
      sinCotizar,
      vencidas: cotizacionesVencidas.map((c) => ({
        ordenCotizacion: c.nombreCotizacion,
        area: c.proyecto?.nombre || 'Sin proyecto',
        tipo: (c as any).tipoCompra || 'Nacional',
        asignado: c.supervisorResponsable?.nombre || 'Sin asignar',
        proveedor: '-',
        cantidadItems: c._count.detalles,
        diasVencida: Math.ceil(
          (now.getTime() - c.fechaLimite.getTime()) / (1000 * 60 * 60 * 24),
        ),
        prioridad:
          Math.ceil(
            (now.getTime() - c.fechaLimite.getTime()) / (1000 * 60 * 60 * 24),
          ) > 7
            ? 'Alta'
            : 'Media',
        solicitoDescuento: '-',
        status: c.estado,
      })),
      rechazados: productosRechazados.map((p) => ({
        ordenCotizacion: p.cotizacion?.nombreCotizacion || p.sku,
        motivoRechazo: p.motivoRechazo || 'Sin motivo',
        fechaRechazo: p.fechaRechazo
          ? p.fechaRechazo.toLocaleDateString('es-HN')
          : '-',
        rechazadoPor: p.responsable || 'Sistema',
      })),
      montoTotal,
      promedioDias,
    };

    // KPIs de compras (basados en EstadoProducto)
    const comprasKpis = {
      resumenEtapas,
      totalProductos: productosAprobados.length,
      productosConRetraso,
      retrasados: productosAprobados
        .filter((p) => p.diasRetrasoActual > 0)
        .sort((a, b) => b.diasRetrasoActual - a.diasRetrasoActual)
        .slice(0, 20)
        .map((p) => ({
          ordenCompra: p.cotizacion?.nombreCotizacion || p.sku,
          item: p.descripcion,
          estadoActual: this.obtenerEstadoActual(p),
          fechaEstimada: p.cotizacion?.fechaLimite
            ? p.cotizacion.fechaLimite.toLocaleDateString('es-HN')
            : '-',
          diasRetraso: p.diasRetrasoActual,
          motivoRetraso: p.observaciones || 'Sin detalle',
        })),
    };

    return {
      cotizaciones: cotizacionesKpis,
      compras: comprasKpis,
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private calcularResumen(productos: any[]) {
    const resumen: Record<string, number> = {
      totalProductos: productos.length,
    };
    for (const ep of Object.values(EstadoProceso)) {
      resumen[ep] = productos.filter((p) => p[ep]).length;
    }
    return resumen;
  }

  private calcularEstadoProyecto(
    productos: any[],
  ): 'success' | 'warn' | 'danger' {
    if (productos.length === 0) return 'success';

    const now = new Date();
    let hasDanger = false;
    let hasWarn = false;

    for (const p of productos) {
      const tipoCompra = p.cotizacion?.tipoCompra || 'INTERNACIONAL';
      const estadosAplicables =
        tipoCompra === 'NACIONAL' ? ESTADOS_NACIONAL : ESTADOS_INTERNACIONAL;

      for (const estadoKey of estadosAplicables) {
        if (p[estadoKey]) continue; // Ya completado → skip

        const fechaLimiteKey = ESTADO_A_FECHA_LIMITE[estadoKey];
        const fechaLimite = p[fechaLimiteKey];
        if (!fechaLimite) continue;

        const limite = new Date(fechaLimite);
        if (now > limite) {
          hasDanger = true;
          break;
        }

        // Calcular 30% del tiempo restante
        const fechaKey = ESTADO_A_FECHA[estadoKey];
        const fechaInicio = p[fechaKey] || p.creado;
        const totalMs = limite.getTime() - new Date(fechaInicio).getTime();
        const restanteMs = limite.getTime() - now.getTime();
        if (totalMs > 0 && restanteMs / totalMs < 0.3) {
          hasWarn = true;
        }

        break; // Solo evaluar el primer estado no completado
      }

      if (hasDanger) break;
    }

    if (hasDanger) return 'danger';
    if (hasWarn) return 'warn';
    return 'success';
  }

  private calcularEstadosDetallados(producto: any, estadosAplicables: EstadoProceso[]) {
    const now = new Date();
    const estados: Record<string, string> = {};
    const diasAtraso: Record<string, number | undefined> = {};
    const fechasLimite: Record<string, string | null> = {};
    const fechasReales: Record<string, string | null> = {};

    for (const estadoKey of estadosAplicables) {
      const lim = producto[ESTADO_A_FECHA_LIMITE[estadoKey]];
      const real = producto[ESTADO_A_FECHA[estadoKey]];
      fechasLimite[estadoKey] = lim ? new Date(lim).toISOString() : null;
      fechasReales[estadoKey] = real ? new Date(real).toISOString() : null;
    }

    if (producto.recibido) {
      for (const estadoKey of estadosAplicables) {
        estados[estadoKey] = 'completado';
      }
      return { estados, diasAtraso, fechasLimite, fechasReales };
    }

    for (const estadoKey of estadosAplicables) {
      const completado = producto[estadoKey];
      const fechaLimite = producto[ESTADO_A_FECHA_LIMITE[estadoKey]];

      if (completado) {
        estados[estadoKey] = 'completado';
      } else if (fechaLimite) {
        const limite = new Date(fechaLimite);
        if (now > limite) {
          estados[estadoKey] = 'atrasado';
          diasAtraso[`diasAtraso_${estadoKey}`] = Math.ceil(
            (now.getTime() - limite.getTime()) / (1000 * 60 * 60 * 24),
          );
        } else {
          const fechaInicio = producto[ESTADO_A_FECHA[estadoKey]] || producto.creado;
          const totalMs = limite.getTime() - new Date(fechaInicio).getTime();
          const restanteMs = limite.getTime() - now.getTime();
          if (totalMs > 0 && restanteMs / totalMs < 0.3) {
            estados[estadoKey] = 'en_proceso';
          } else {
            estados[estadoKey] = 'pendiente';
          }
        }
      } else {
        estados[estadoKey] = completado ? 'completado' : 'pendiente';
      }
    }

    return { estados, diasAtraso, fechasLimite, fechasReales };
  }

  private obtenerEstadoActual(producto: any): string {
    const estados = ESTADOS_INTERNACIONAL;
    for (let i = estados.length - 1; i >= 0; i--) {
      if (producto[estados[i]]) {
        return ESTADO_LABELS[estados[i]];
      }
    }
    return 'Sin iniciar';
  }
}
