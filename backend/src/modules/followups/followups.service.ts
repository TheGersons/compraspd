import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AprobarProductosDto } from './dto/aprobar-productos.dto';
import { ConfigurarCotizacionDto } from './dto/configurar-cotizacion.dto';


type UserJwt = { sub: string; role?: string };

/**
 * Service principal para gestión de seguimiento de cotizaciones
 * 
 * Funcionalidades:
 * - Listar cotizaciones pendientes para supervisores
 * - Configurar timeline de productos
 * - Aprobar/desaprobar productos individualmente
 * - Calcular fechas límite automáticamente
 * - Asignar supervisor responsable
 * - Obtener historial de cambios
 */
@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lista cotizaciones pendientes de configuración/aprobación
   * Solo para usuarios supervisores
   */
  async listCotizacionesPendientes(
    user: UserJwt,
    filters?: {
      estado?: string;
      proyectoId?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    // Verificar que el usuario es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });
    let rol = usuario?.rol.nombre.toLowerCase() === 'supervisor' ? true : false;
    rol = rol || usuario?.rol.nombre.toLowerCase() === 'admin' ? true : false;
    if (!rol) {
      throw new ForbiddenException('Solo supervisores pueden acceder a esta función');
    }

    const page = filters?.page || 1;
    const pageSize = Math.min(filters?.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    // Construir filtros
    const where: any = {
      estado: {
        in: ['ENVIADA' ,'PENDIENTE', 'EN_CONFIGURACION', 'APROBADA_PARCIAL']
      }
    };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.proyectoId) {
      where.proyectoId = filters.proyectoId;
    }

    if (filters?.search) {
      where.OR = [
        { nombreCotizacion: { contains: filters.search, mode: 'insensitive' } },
        { solicitante: { nombre: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const [total, cotizaciones] = await Promise.all([
      this.prisma.cotizacion.count({ where }),
      this.prisma.cotizacion.findMany({
        where,
        include: {
          solicitante: {
            select: {
              id: true,
              nombre: true,
              email: true,
              departamento: { select: { nombre: true } }
            }
          },
          supervisorResponsable: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          proyecto: {
            select: {
              id: true,
              nombre: true,
              criticidad: true
            }
          },
          detalles: {
            select: {
              id: true,
              sku: true,
              descripcionProducto: true,
              cantidad: true
            }
          },
          estadosProductos: {
            select: {
              id: true,
              aprobadoPorSupervisor: true
            }
          }
        },
        orderBy: [
          { fechaSolicitud: 'desc' }
        ],
        skip,
        take: pageSize
      })
    ]);

    // Calcular estadísticas por cotización
    const cotizacionesConEstadisticas = cotizaciones.map(cot => {
      const totalProductos = cot.detalles.length;
      const productosAprobados = cot.estadosProductos.filter(ep => ep.aprobadoPorSupervisor).length;
      const productosPendientes = totalProductos - productosAprobados;

      return {
        id: cot.id,
        nombreCotizacion: cot.nombreCotizacion,
        estado: cot.estado,
        fechaSolicitud: cot.fechaSolicitud,
        fechaLimite: cot.fechaLimite,
        aprobadaParcialmente: cot.aprobadaParcialmente,
        todosProductosAprobados: cot.todosProductosAprobados,
        solicitante: cot.solicitante,
        supervisorResponsable: cot.supervisorResponsable,
        proyecto: cot.proyecto,
        chatId: cot.chatId,
        totalProductos,
        productosAprobados,
        productosPendientes,
        porcentajeAprobado: totalProductos > 0
          ? Math.round((productosAprobados / totalProductos) * 100)
          : 0
      };
    });

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items: cotizacionesConEstadisticas
    };
  }

  /**
   * Obtiene detalle completo de una cotización
   * Incluye productos con timeline sugerido si existe
   */
  async getCotizacionDetalle(cotizacionId: string, user: UserJwt) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden acceder a esta función');
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: { select: { nombre: true } }
          }
        },
        supervisorResponsable: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        proyecto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            criticidad: true
          }
        },
        tipo: {
          select: {
            id: true,
            nombre: true,
            area: {
              select: {
                id: true,
                nombreArea: true
              }
            }
          }
        },
        detalles: {
          include: {
            preciosOfertas: {
              include: {
                proveedor: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        },
        estadosProductos: {
          include: {
            paisOrigen: true
          }
        }
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Obtener timeline sugerido para cada SKU
    const productosConTimeline = await Promise.all(
      cotizacion.detalles.map(async (detalle) => {
        let timelineSugerido: any = null;

        if (detalle.sku) {
          timelineSugerido = await this.prisma.timelineSKU.findUnique({
            where: { sku: detalle.sku },
            include: {
              paisOrigen: true
            }
          });
        }

        // Buscar estado producto correspondiente
        const estadoProducto = cotizacion.estadosProductos.find(
          ep => ep.sku === detalle.sku
        );

        return {
          ...detalle,
          estadoProducto,
          timelineSugerido
        };
      })
    );

    return {
      ...cotizacion,
      detalles: productosConTimeline
    };
  }

  /**
   * Configura timeline para productos de una cotización
   * Crea/actualiza TimelineSKU y EstadoProducto
   * Calcula fechas límite automáticamente
   */
  async configurarTimeline(
    cotizacionId: string,
    dto: ConfigurarCotizacionDto,
    user: UserJwt
  ) {
    // Verificar que la cotización existe
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        detalles: true
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden configurar timelines');
    }

    type ResultadoConfiguracion = {
      sku: string;
      timelineId: string;
      estadoProductoId: string;
    };

    // Procesar en transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      const resultados: ResultadoConfiguracion[] = [];

      for (const productoConfig of dto.productos) {
        // 1. Calcular días totales
        const diasTotales = this.calcularDiasTotales(productoConfig.timeline);

        // 2. Crear o actualizar TimelineSKU
        const timelineSKU = await tx.timelineSKU.upsert({
          where: { sku: productoConfig.sku },
          create: {
            sku: productoConfig.sku,
            paisOrigenId: productoConfig.paisOrigenId,
            medioTransporte: productoConfig.medioTransporte,
            diasCotizadoADescuento: productoConfig.timeline.diasCotizadoADescuento,
            diasDescuentoAComprado: productoConfig.timeline.diasDescuentoAComprado,
            diasCompradoAPagado: productoConfig.timeline.diasCompradoAPagado,
            diasPagadoASeguimiento1: productoConfig.timeline.diasPagadoASeguimiento1,
            diasSeguimiento1AFob: productoConfig.timeline.diasSeguimiento1AFob,
            diasFobABl: productoConfig.timeline.diasFobABl,
            diasBlASeguimiento2: productoConfig.timeline.diasBlASeguimiento2,
            diasSeguimiento2ACif: productoConfig.timeline.diasSeguimiento2ACif,
            diasCifARecibido: productoConfig.timeline.diasCifARecibido,
            diasTotalesEstimados: diasTotales,
            notas: productoConfig.notas
          },
          update: {
            paisOrigenId: productoConfig.paisOrigenId,
            medioTransporte: productoConfig.medioTransporte,
            diasCotizadoADescuento: productoConfig.timeline.diasCotizadoADescuento,
            diasDescuentoAComprado: productoConfig.timeline.diasDescuentoAComprado,
            diasCompradoAPagado: productoConfig.timeline.diasCompradoAPagado,
            diasPagadoASeguimiento1: productoConfig.timeline.diasPagadoASeguimiento1,
            diasSeguimiento1AFob: productoConfig.timeline.diasSeguimiento1AFob,
            diasFobABl: productoConfig.timeline.diasFobABl,
            diasBlASeguimiento2: productoConfig.timeline.diasBlASeguimiento2,
            diasSeguimiento2ACif: productoConfig.timeline.diasSeguimiento2ACif,
            diasCifARecibido: productoConfig.timeline.diasCifARecibido,
            diasTotalesEstimados: diasTotales,
            notas: productoConfig.notas
          }
        });

        // 3. Buscar el detalle de cotización correspondiente
        const detalle = cotizacion.detalles.find(d => d.sku === productoConfig.sku);

        if (!detalle) {
          throw new BadRequestException(`Producto con SKU ${productoConfig.sku} no encontrado en la cotización`);
        }

        // 4. Crear o actualizar EstadoProducto
        // ✅ Buscar primero
        const estadoExistente = await tx.estadoProducto.findFirst({
          where: {
            cotizacionId: cotizacionId,
            sku: productoConfig.sku
          }
        });

        let estadoProducto;

        if (estadoExistente) {
          // Actualizar existente
          estadoProducto = await tx.estadoProducto.update({
            where: { id: estadoExistente.id },
            data: {
              paisOrigenId: productoConfig.paisOrigenId,
              medioTransporte: productoConfig.medioTransporte
            }
          });
        } else {
          // Crear nuevo
          estadoProducto = await tx.estadoProducto.create({
            data: {
              cotizacionId: cotizacionId,
              cotizacionDetalleId: detalle.id,
              proyectoId: cotizacion.proyectoId,
              sku: productoConfig.sku,
              descripcion: detalle.descripcionProducto,
              cantidad: detalle.cantidad,
              paisOrigenId: productoConfig.paisOrigenId,
              medioTransporte: productoConfig.medioTransporte,
              cotizado: true,
              fechaCotizado: cotizacion.fechaSolicitud
            }
          });
        }

        // 5. Calcular y actualizar fechas límite
        await this.calcularYActualizarFechasLimite(
          tx,
          estadoProducto.id,
          timelineSKU,
          cotizacion.fechaSolicitud
        );

        resultados.push({
          sku: productoConfig.sku,
          timelineId: timelineSKU.id,
          estadoProductoId: estadoProducto.id
        });
      }

      // 6. Asignar supervisor responsable si no tiene
      if (!cotizacion.supervisorResponsableId) {
        await tx.cotizacion.update({
          where: { id: cotizacionId },
          data: {
            supervisorResponsableId: user.sub,
            estado: 'EN_CONFIGURACION'
          }
        });
      }

      // 7. Registrar en historial
      await tx.historialCotizacion.create({
        data: {
          cotizacionId: cotizacionId,
          usuarioId: user.sub,
          accion: 'TIMELINE_CONFIGURADO',
          detalles: {
            productosConfigurados: dto.productos.length,
            skus: dto.productos.map(p => p.sku)
          }
        }
      });

      return resultados;
    });

    return {
      message: 'Timeline configurado exitosamente',
      productosConfigurados: resultado.length,
      detalles: resultado
    };
  }

  /**
   * Calcula días totales sumando solo los que no son null
   */
  private calcularDiasTotales(timeline: any): number {
    const campos = [
      timeline.diasCotizadoADescuento,
      timeline.diasDescuentoAComprado,
      timeline.diasCompradoAPagado,
      timeline.diasPagadoASeguimiento1,
      timeline.diasSeguimiento1AFob,
      timeline.diasFobABl,
      timeline.diasBlASeguimiento2,
      timeline.diasSeguimiento2ACif,
      timeline.diasCifARecibido
    ];

    return campos.reduce((total, dias) => {
      return total + (dias || 0);
    }, 0);
  }

  /**
   * Calcula y actualiza fechas límite en EstadoProducto
   */
  private async calcularYActualizarFechasLimite(
    tx: any,
    estadoProductoId: string,
    timeline: any,
    fechaInicio: Date
  ) {
    let fechaActual = new Date(fechaInicio);
    const updates: any = {};

    // Fecha límite cotizado (inicio)
    updates.fechaLimiteCotizado = new Date(fechaActual);

    // Con descuento
    if (timeline.diasCotizadoADescuento) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasCotizadoADescuento);
      updates.fechaLimiteConDescuento = new Date(fechaActual);
    }

    // Comprado
    if (timeline.diasDescuentoAComprado) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasDescuentoAComprado);
      updates.fechaLimiteComprado = new Date(fechaActual);
    }

    // Pagado
    if (timeline.diasCompradoAPagado) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasCompradoAPagado);
      updates.fechaLimitePagado = new Date(fechaActual);
    }

    // 1er Seguimiento
    if (timeline.diasPagadoASeguimiento1) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasPagadoASeguimiento1);
      updates.fechaLimitePrimerSeguimiento = new Date(fechaActual);
    }

    // En FOB
    if (timeline.diasSeguimiento1AFob) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasSeguimiento1AFob);
      updates.fechaLimiteEnFOB = new Date(fechaActual);
    }

    // Con BL
    if (timeline.diasFobABl) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasFobABl);
      updates.fechaLimiteConBL = new Date(fechaActual);
    }

    // 2do Seguimiento
    if (timeline.diasBlASeguimiento2) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasBlASeguimiento2);
      updates.fechaLimiteSegundoSeguimiento = new Date(fechaActual);
    }

    // En CIF
    if (timeline.diasSeguimiento2ACif) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasSeguimiento2ACif);
      updates.fechaLimiteEnCIF = new Date(fechaActual);
    }

    // Recibido
    if (timeline.diasCifARecibido) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasCifARecibido);
      updates.fechaLimiteRecibido = new Date(fechaActual);
    }

    await tx.estadoProducto.update({
      where: { id: estadoProductoId },
      data: updates
    });
  }

  /**
   * Agrega días a una fecha (helper)
   */
  private agregarDias(fecha: Date, dias: number): Date {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }

  // Continúa en parte 2...
  /**
     * Aprueba o desaprueba productos individualmente
     * Actualiza flags de aprobación en cotización
     */
  async aprobarProductos(
    cotizacionId: string,
    dto: AprobarProductosDto,
    user: UserJwt
  ) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden aprobar productos');
    }

    // Verificar que la cotización existe
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        estadosProductos: true
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    type CambioAprobacion = {
      estadoProductoId: string;
      sku: string;
      aprobado: boolean;
    };

    // Procesar aprobaciones en transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      const cambios: CambioAprobacion[] = [];

      for (const aprobacion of dto.productos) {
        // Verificar que el estado producto pertenece a esta cotización
        const estadoProducto = cotizacion.estadosProductos.find(
          ep => ep.id === aprobacion.estadoProductoId
        );

        if (!estadoProducto) {
          throw new BadRequestException(
            `Producto ${aprobacion.estadoProductoId} no pertenece a esta cotización`
          );
        }

        // Actualizar aprobación
        await tx.estadoProducto.update({
          where: { id: aprobacion.estadoProductoId },
          data: {
            aprobadoPorSupervisor: aprobacion.aprobado,
            fechaAprobacion: aprobacion.aprobado ? new Date() : null
          }
        });

        // Registrar en historial
        await tx.historialCotizacion.create({
          data: {
            cotizacionId: cotizacionId,
            usuarioId: user.sub,
            accion: aprobacion.aprobado ? 'PRODUCTO_APROBADO' : 'PRODUCTO_DESAPROBADO',
            detalles: {
              productoId: aprobacion.estadoProductoId,
              sku: estadoProducto.sku,
              observaciones: aprobacion.observaciones
            }
          }
        });

        cambios.push({
          estadoProductoId: aprobacion.estadoProductoId,
          sku: estadoProducto.sku,
          aprobado: aprobacion.aprobado
        });
      }

      // Calcular totales
      const todosProductos = await tx.estadoProducto.findMany({
        where: { cotizacionId: cotizacionId },
        select: { aprobadoPorSupervisor: true }
      });

      const totalProductos = todosProductos.length;
      const productosAprobados = todosProductos.filter(p => p.aprobadoPorSupervisor).length;
      const aprobadaParcialmente = productosAprobados > 0 && productosAprobados < totalProductos;
      const todosAprobados = productosAprobados === totalProductos && totalProductos > 0;

      // Actualizar cotización
      const nuevoEstado = todosAprobados
        ? 'APROBADA_COMPLETA'
        : aprobadaParcialmente
          ? 'APROBADA_PARCIAL'
          : cotizacion.estado;

      await tx.cotizacion.update({
        where: { id: cotizacionId },
        data: {
          supervisorResponsableId: user.sub,
          aprobadaParcialmente,
          todosProductosAprobados: todosAprobados,
          fechaAprobacion: todosAprobados ? new Date() : cotizacion.fechaAprobacion,
          estado: nuevoEstado
        }
      });

      return {
        cambios,
        totalProductos,
        productosAprobados,
        aprobadaParcialmente,
        todosAprobados,
        nuevoEstado
      };
    });

    return {
      message: 'Aprobaciones actualizadas exitosamente',
      ...resultado
    };
  }

  /**
   * Obtiene historial completo de una cotización
   */
  async getHistorial(cotizacionId: string, filters?: {
    accion?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    const where: any = {
      cotizacionId
    };

    if (filters?.accion) {
      where.accion = filters.accion;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.creado = {};
      if (filters.fechaDesde) {
        where.creado.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.creado.lte = filters.fechaHasta;
      }
    }

    const historial = await this.prisma.historialCotizacion.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: { creado: 'desc' }
    });

    return historial;
  }

  /**
   * Obtiene estadísticas del dashboard de supervisores
   */
  async getEstadisticasSupervisor(user: UserJwt) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden acceder a estadísticas');
    }

    const [
      totalPendientes,
      totalEnConfiguracion,
      totalAprobacionParcial,
      misAsignadas
    ] = await Promise.all([
      this.prisma.cotizacion.count({
        where: { estado: 'PENDIENTE' }
      }),
      this.prisma.cotizacion.count({
        where: { estado: 'EN_CONFIGURACION' }
      }),
      this.prisma.cotizacion.count({
        where: { estado: 'APROBADA_PARCIAL' }
      }),
      this.prisma.cotizacion.count({
        where: {
          supervisorResponsableId: user.sub,
          estado: { in: ['EN_CONFIGURACION', 'APROBADA_PARCIAL'] }
        }
      })
    ]);

    return {
      totalPendientes,
      totalEnConfiguracion,
      totalAprobacionParcial,
      misAsignadas,
      totalEnProceso: totalPendientes + totalEnConfiguracion + totalAprobacionParcial
    };
  }

  /**
   * Reasigna supervisor responsable
   */
  async reasignarSupervisor(
    cotizacionId: string,
    nuevoSupervisorId: string,
    user: UserJwt
  ) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true }
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden reasignar');
    }

    // Verificar que el nuevo supervisor existe y es supervisor
    const nuevoSupervisor = await this.prisma.usuario.findUnique({
      where: { id: nuevoSupervisorId },
      include: { rol: true }
    });

    if (!nuevoSupervisor?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new BadRequestException('El usuario seleccionado no es supervisor');
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { supervisorResponsableId: true }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Actualizar y registrar
    await this.prisma.$transaction([
      this.prisma.cotizacion.update({
        where: { id: cotizacionId },
        data: { supervisorResponsableId: nuevoSupervisorId }
      }),
      this.prisma.historialCotizacion.create({
        data: {
          cotizacionId,
          usuarioId: user.sub,
          accion: 'SUPERVISOR_ASIGNADO',
          detalles: {
            supervisorAnterior: cotizacion.supervisorResponsableId,
            supervisorNuevo: nuevoSupervisorId,
            reasignadoPor: user.sub
          }
        }
      })
    ]);

    return {
      message: 'Supervisor reasignado exitosamente',
      nuevoSupervisor: {
        id: nuevoSupervisor.id,
        nombre: nuevoSupervisor.nombre,
        email: nuevoSupervisor.email
      }
    };
  }

  /**
   * Obtiene lista de supervisores disponibles
   */
  async getSupervisoresDisponibles() {
    const supervisores = await this.prisma.usuario.findMany({
      where: {
        activo: true,
        rol: {
          nombre: {
            contains: 'supervisor',
            mode: 'insensitive'
          }
        }
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        departamento: {
          select: {
            nombre: true
          }
        },
        _count: {
          select: {
            cotizacionesSupervisadas: {
              where: {
                estado: { in: ['EN_CONFIGURACION', 'APROBADA_PARCIAL'] }
              }
            }
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return supervisores.map(s => ({
      ...s,
      cotizacionesActivas: s._count.cotizacionesSupervisadas
    }));
  }
}