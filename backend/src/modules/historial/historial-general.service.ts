// src/historial-general/historial-general.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

type EtapaContador = {
  cotizado: number;
  conDescuento: number;
  comprado: number;
  pagado: number;
  primerSeguimiento: number;
  enFOB: number;
  conBL: number;
  segundoSeguimiento: number;
  enCIF: number;
  recibido: number;
};

type CriticidadNivel = 'alta' | 'media' | 'baja';

@Injectable()
export class HistorialGeneralService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el resumen de todas las cotizaciones a las que el usuario tiene acceso
   */
  async obtenerResumenGeneral(user: UserJwt) {
    // Obtener cotizaciones según permisos
    const whereClause = this.construirFiltroPermisos(user);

    const cotizaciones = await this.prisma.cotizacion.findMany({
      where: whereClause,
      include: {
        solicitante: {
          select: {
            nombre: true,
            email: true,
          },
        },
        proyecto: {
          select: {
            nombre: true,
          },
        },
        detalles: {
          include: {
            estadosProductos: true,
          },
        },
      },
      orderBy: {
        fechaSolicitud: 'desc',
      },
    });

    // Transformar a formato del frontend
    return cotizaciones.map((cot) => this.transformarCotizacionResumen(cot));
  }

  /**
   * Obtiene el detalle completo de una cotización específica
   */
  async obtenerDetalleCotizacion(id: string, user: UserJwt) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        solicitante: {
          select: {
            nombre: true,
            email: true,
          },
        },
        proyecto: {
          select: {
            nombre: true,
          },
        },
        detalles: {
          include: {
            estadosProductos: true,
          },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Verificar permisos
    this.verificarPermisos(cotizacion, user);

    // Transformar a formato del frontend
    return this.transformarCotizacionResumen(cotizacion);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - LÓGICA DE NEGOCIO
  // ============================================================================

  /**
   * Construye el filtro WHERE según los permisos del usuario
   */
  private construirFiltroPermisos(user: UserJwt) {
    const role = user.role?.toUpperCase();

    // Supervisores y admins ven todas las cotizaciones
    if (role === 'SUPERVISOR' || role === 'ADMIN') {
      return {};
    }

    // Usuarios normales solo ven sus propias cotizaciones
    return {
      solicitanteId: user.sub,
    };
  }

  /**
   * Verifica si el usuario tiene permisos para ver una cotización
   */
  private verificarPermisos(cotizacion: any, user: UserJwt) {
    const role = user.role?.toUpperCase();

    // Supervisores y admins pueden ver todo
    if (role === 'SUPERVISOR' || role === 'ADMIN') {
      return;
    }

    // Usuarios normales solo pueden ver sus propias cotizaciones
    if (cotizacion.solicitanteId !== user.sub) {
      throw new ForbiddenException('No tienes permiso para ver esta cotización');
    }
  }

  /**
   * Transforma una cotización de Prisma al formato del frontend
   */
  private transformarCotizacionResumen(cotizacion: any) {
    const estadosProductos = cotizacion.detalles.map((d: any) => d.estadoProducto).filter(Boolean);

    const etapas = this.contarProductosPorEtapa(estadosProductos);
    const productosCompletados = this.contarProductosCompletados(estadosProductos);
    const productosAtrasados = this.contarProductosAtrasados(estadosProductos);
    const criticidad = this.calcularCriticidad(estadosProductos);

    return {
      id: cotizacion.id,
      nombreCotizacion: cotizacion.nombreCotizacion,
      solicitante: {
        nombre: cotizacion.solicitante.nombre,
        email: cotizacion.solicitante.email,
      },
      proyecto: cotizacion.proyecto
        ? {
            nombre: cotizacion.proyecto.nombre,
          }
        : null,
      totalProductos: cotizacion.detalles.length,
      productosCompletados,
      productosAtrasados,
      fechaCreacion: cotizacion.fechaSolicitud,
      fechaActualizacion: cotizacion.fechaSolicitud, // Usar fecha solicitud si no hay updatedAt
      criticidad,
      etapas,
    };
  }

  /**
   * Cuenta cuántos productos están en cada etapa
   * Un producto cuenta en una etapa si esa etapa está en 'completado' o 'en_proceso'
   */
  private contarProductosPorEtapa(estadosProductos: any[]): EtapaContador {
    const etapas: EtapaContador = {
      cotizado: 0,
      conDescuento: 0,
      comprado: 0,
      pagado: 0,
      primerSeguimiento: 0,
      enFOB: 0,
      conBL: 0,
      segundoSeguimiento: 0,
      enCIF: 0,
      recibido: 0,
    };

    for (const estado of estadosProductos) {
      // Contar si la etapa está activa (true en el booleano)
      if (estado.cotizado) etapas.cotizado++;
      if (estado.conDescuento) etapas.conDescuento++;
      if (estado.comprado) etapas.comprado++;
      if (estado.pagado) etapas.pagado++;
      if (estado.primerSeguimiento) etapas.primerSeguimiento++;
      if (estado.enFOB) etapas.enFOB++;
      if (estado.conBL) etapas.conBL++;
      if (estado.segundoSeguimiento) etapas.segundoSeguimiento++;
      if (estado.enCIF) etapas.enCIF++;
      if (estado.recibido) etapas.recibido++;
    }

    return etapas;
  }

  /**
   * Cuenta cuántos productos han completado todas las etapas
   */
  private contarProductosCompletados(estadosProductos: any[]): number {
    return estadosProductos.filter((estado) => {
      // Un producto está completado si llegó a la última etapa (recibido)
      return estado.recibido === true;
    }).length;
  }

  /**
   * Cuenta cuántos productos tienen atraso
   * Un producto está atrasado si diasRetrasoActual > 0
   */
  private contarProductosAtrasados(estadosProductos: any[]): number {
    return estadosProductos.filter((estado) => {
      return estado.diasRetrasoActual > 0;
    }).length;
  }

  /**
   * Calcula el nivel de criticidad de una cotización
   * basado en el porcentaje de productos atrasados
   */
  private calcularCriticidad(estadosProductos: any[]): CriticidadNivel {
    if (estadosProductos.length === 0) return 'baja';

    const atrasados = this.contarProductosAtrasados(estadosProductos);
    const porcentajeAtrasados = (atrasados / estadosProductos.length) * 100;

    if (porcentajeAtrasados > 20) return 'alta';
    if (porcentajeAtrasados > 5) return 'media';
    return 'baja';
  }
}