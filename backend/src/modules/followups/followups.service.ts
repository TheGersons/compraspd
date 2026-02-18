import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
  constructor(private readonly prisma: PrismaService) {}

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
    },
  ) {
    // Verificar que el usuario es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });
    let rol = usuario?.rol.nombre.toLowerCase() === 'supervisor' ? true : false;
    rol = rol || usuario?.rol.nombre.toLowerCase() === 'admin' ? true : false;
    if (!rol) {
      throw new ForbiddenException(
        'Solo supervisores pueden acceder a esta función',
      );
    }

    const page = filters?.page || 1;
    const pageSize = Math.min(filters?.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    // Construir filtros
    const where: any = {
      estado: {
        in: ['ENVIADA', 'PENDIENTE', 'EN_CONFIGURACION', 'APROBADA_PARCIAL'],
      },
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
        {
          solicitante: {
            nombre: { contains: filters.search, mode: 'insensitive' },
          },
        },
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
              departamento: { select: { nombre: true } },
            },
          },
          supervisorResponsable: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          proyecto: {
            select: {
              id: true,
              nombre: true,
              criticidad: true,
            },
          },
          detalles: {
            select: {
              id: true,
              sku: true,
              descripcionProducto: true,
              cantidad: true,
            },
          },
          estadosProductos: {
            select: {
              id: true,
              aprobadoPorSupervisor: true,
            },
          },
        },
        orderBy: [{ fechaSolicitud: 'desc' }],
        skip,
        take: pageSize,
      }),
    ]);

    // Calcular estadísticas por cotización
    const cotizacionesConEstadisticas = cotizaciones.map((cot) => {
      const totalProductos = cot.detalles.length;
      const productosAprobados = cot.estadosProductos.filter(
        (ep) => ep.aprobadoPorSupervisor,
      ).length;
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
        porcentajeAprobado:
          totalProductos > 0
            ? Math.round((productosAprobados / totalProductos) * 100)
            : 0,
      };
    });

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items: cotizacionesConEstadisticas,
    };
  }

  /**
   * Obtiene detalle completo de una cotización
   * Incluye productos con timeline sugerido si existe
   * NUEVO: Agrega automáticamente al supervisor como participante del chat
   */
  async getCotizacionDetalle(cotizacionId: string, user: UserJwt) {
    // Verificar que es supervisor o admin
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });

    const rolNombre = usuario?.rol.nombre.toLowerCase() || '';
    const esSupervisorOAdmin =
      rolNombre.includes('supervisor') || rolNombre.includes('admin');

    if (!esSupervisorOAdmin) {
      throw new ForbiddenException(
        'Solo supervisores pueden acceder a esta función',
      );
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: { select: { nombre: true } },
          },
        },
        supervisorResponsable: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        proyecto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            criticidad: true,
          },
        },
        tipo: {
          select: {
            id: true,
            nombre: true,
            area: {
              select: {
                id: true,
                nombreArea: true,
              },
            },
          },
        },
        detalles: {
          include: {
            preciosOfertas: {
              include: {
                proveedor: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        estadosProductos: {
          include: {
            paisOrigen: true,
          },
        },
        // Incluir chat con participantes para verificar
        chat: {
          select: {
            id: true,
            participantes: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // =====================================================
    // NUEVO: Agregar supervisor al chat si no es participante
    // =====================================================
    if (cotizacion.chatId && cotizacion.chat) {
      const yaEsParticipante = cotizacion.chat.participantes.some(
        (p) => p.userId === user.sub,
      );

      if (!yaEsParticipante) {
        try {
          await this.prisma.participantesChat.create({
            data: {
              chatId: cotizacion.chatId,
              userId: user.sub,
              ultimoLeido: new Date(),
            },
          });
        } catch (error) {
          // Ignorar error si ya existe (race condition)
          // El unique constraint evitará duplicados
        }
      }
    }
    // =====================================================

    // Obtener timeline sugerido para cada SKU
    const productosConTimeline = await Promise.all(
      cotizacion.detalles.map(async (detalle) => {
        let timelineSugerido: any = null;

        if (detalle.sku) {
          timelineSugerido = await this.prisma.timelineSKU.findUnique({
            where: { sku: detalle.sku },
            include: {
              paisOrigen: true,
            },
          });
        }

        // Buscar estado producto correspondiente
        const estadoProducto = cotizacion.estadosProductos.find(
          (ep) => ep.sku === detalle.sku,
        );

        return {
          ...detalle,
          estadoProducto,
          timelineSugerido,
        };
      }),
    );

    // Retornar sin el objeto chat interno (solo chatId)
    const { chat, ...cotizacionSinChat } = cotizacion;

    return {
      ...cotizacionSinChat,
      detalles: productosConTimeline,
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
    user: UserJwt,
  ) {
    // Verificar que la cotización existe
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        detalles: true,
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException(
        'Solo supervisores pueden configurar timelines',
      );
    }

    type ResultadoConfiguracion = {
      sku: string;
      timelineId: string;
      estadoProductoId: string;
    };

    // Procesar en transacción
    const resultado = await this.prisma.$transaction(async (transaction) => {
      const resultados: ResultadoConfiguracion[] = [];

      for (const productoConfig of dto.productos) {
        // 1. Calcular días totales
        const diasTotales = this.calcularDiasTotales(productoConfig.timeline);

        // 2. Crear o actualizar TimelineSKU
        const timelineSKU = await transaction.timelineSKU.upsert({
          where: { sku: productoConfig.sku },
          create: {
            sku: productoConfig.sku,
            paisOrigenId: productoConfig.paisOrigenId,
            medioTransporte: productoConfig.medioTransporte,
            diasCotizadoADescuento:
              productoConfig.timeline.diasCotizadoADescuento,
            diasDescuentoAComprado:
              productoConfig.timeline.diasDescuentoAComprado,
            diasCompradoAPagado: productoConfig.timeline.diasCompradoAPagado,
            diasPagadoASeguimiento1:
              productoConfig.timeline.diasPagadoASeguimiento1,
            diasSeguimiento1AFob: productoConfig.timeline.diasSeguimiento1AFob,
            diasFobACotizacionFlete:
              productoConfig.timeline.diasFobACotizacionFlete, // ← NUEVO
            diasCotizacionFleteABl:
              productoConfig.timeline.diasCotizacionFleteABl, // ← NUEVO
            diasFobABl: productoConfig.timeline.diasFobABl, // Mantener por compatibilidad
            diasBlASeguimiento2: productoConfig.timeline.diasBlASeguimiento2,
            diasSeguimiento2ACif: productoConfig.timeline.diasSeguimiento2ACif,
            diasCifARecibido: productoConfig.timeline.diasCifARecibido,
            diasTotalesEstimados: diasTotales,
            notas: productoConfig.notas,
          },
          update: {
            paisOrigenId: productoConfig.paisOrigenId,
            medioTransporte: productoConfig.medioTransporte,
            diasCotizadoADescuento:
              productoConfig.timeline.diasCotizadoADescuento,
            diasDescuentoAComprado:
              productoConfig.timeline.diasDescuentoAComprado,
            diasCompradoAPagado: productoConfig.timeline.diasCompradoAPagado,
            diasPagadoASeguimiento1:
              productoConfig.timeline.diasPagadoASeguimiento1,
            diasSeguimiento1AFob: productoConfig.timeline.diasSeguimiento1AFob,
            diasFobACotizacionFlete:
              productoConfig.timeline.diasFobACotizacionFlete, // ← NUEVO
            diasCotizacionFleteABl:
              productoConfig.timeline.diasCotizacionFleteABl, // ← NUEVO
            diasFobABl: productoConfig.timeline.diasFobABl, // Mantener por compatibilidad
            diasBlASeguimiento2: productoConfig.timeline.diasBlASeguimiento2,
            diasSeguimiento2ACif: productoConfig.timeline.diasSeguimiento2ACif,
            diasCifARecibido: productoConfig.timeline.diasCifARecibido,
            diasTotalesEstimados: diasTotales,
            notas: productoConfig.notas,
          },
        });

        // 3. Buscar el detalle de cotización correspondiente
        const detalle = cotizacion.detalles.find(
          (d) => d.sku === productoConfig.sku,
        );

        if (!detalle) {
          throw new BadRequestException(
            `Producto con SKU ${productoConfig.sku} no encontrado en la cotización`,
          );
        }

        // 4. Crear o actualizar EstadoProducto
        // ✅ Buscar primero
        const estadoExistente = await transaction.estadoProducto.findFirst({
          where: {
            cotizacionId: cotizacionId,
            sku: productoConfig.sku,
          },
        });

        let estadoProducto;

        if (estadoExistente) {
          // Actualizar existente
          estadoProducto = await transaction.estadoProducto.update({
            where: { id: estadoExistente.id },
            data: {
              paisOrigenId: productoConfig.paisOrigenId,
              medioTransporte: productoConfig.medioTransporte,
            },
          });
        } else {
          // Crear nuevo
          estadoProducto = await transaction.estadoProducto.create({
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
              fechaCotizado: cotizacion.fechaSolicitud,
            },
          });
        }

        // 5. Calcular y actualizar fechas límite
        await this.calcularYActualizarFechasLimite(
          transaction,
          estadoProducto.id,
          timelineSKU,
          cotizacion.fechaSolicitud,
        );

        resultados.push({
          sku: productoConfig.sku,
          timelineId: timelineSKU.id,
          estadoProductoId: estadoProducto.id,
        });
      }

      // 6. Asignar supervisor responsable si no tiene
      if (!cotizacion.supervisorResponsableId) {
        await transaction.cotizacion.update({
          where: { id: cotizacionId },
          data: {
            supervisorResponsableId: user.sub,
            estado: 'EN_CONFIGURACION',
          },
        });
      }

      // 7. Registrar en historial
      await transaction.historialCotizacion.create({
        data: {
          cotizacionId: cotizacionId,
          usuarioId: user.sub,
          accion: 'TIMELINE_CONFIGURADO',
          detalles: {
            productosConfigurados: dto.productos.length,
            skus: dto.productos.map((p) => p.sku),
          },
        },
      });

      return resultados;
    });

    return {
      message: 'Timeline configurado exitosamente',
      productosConfigurados: resultado.length,
      detalles: resultado,
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
      timeline.diasFobACotizacionFlete,
      timeline.diasCotizacionFleteABl,
      timeline.diasBlASeguimiento2,
      timeline.diasSeguimiento2ACif,
      timeline.diasCifARecibido,
    ];

    return campos.reduce((total, dias) => {
      return total + (dias || 0);
    }, 0);
  }

  /**
   * Calcula y actualiza fechas límite en EstadoProducto
   */
  private async calcularYActualizarFechasLimite(
    transaction: any,
    estadoProductoId: string,
    timeline: any,
    fechaInicio: Date,
  ) {
    let fechaActual = new Date(fechaInicio);
    const updates: any = {};

    // 1. Fecha límite cotizado (inicio)
    updates.fechaLimiteCotizado = new Date(fechaActual);

    // 2. Con descuento
    if (timeline.diasCotizadoADescuento) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasCotizadoADescuento,
      );
      updates.fechaLimiteConDescuento = new Date(fechaActual).toISOString();
    }

    // 3. Aprobación de Compra ← NUEVO
    if (timeline.diasDescuentoAAprobacionCompra) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasDescuentoAAprobacionCompra,
      );
      updates.fechaLimiteAprobacionCompra = new Date(fechaActual).toISOString();
    }

    // 4. Comprado
    if (timeline.diasAprobacionCompraAComprado) {
      // Si tiene el nuevo flujo con aprobación de compra
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasAprobacionCompraAComprado,
      );
      updates.fechaLimiteComprado = new Date(fechaActual).toISOString();
    } else if (timeline.diasDescuentoAComprado) {
      // Fallback para compatibilidad con datos antiguos (sin aprobación de compra)
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasDescuentoAComprado,
      );
      updates.fechaLimiteComprado = new Date(fechaActual).toISOString();
    }

    // 5. Pagado
    if (timeline.diasCompradoAPagado) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasCompradoAPagado);
      updates.fechaLimitePagado = new Date(fechaActual).toISOString();
    }

    // 6. Aprobación de Planos ← NUEVO
    if (timeline.diasPagadoAAprobacionPlanos) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasPagadoAAprobacionPlanos,
      );
      updates.fechaLimiteAprobacionPlanos = new Date(fechaActual).toISOString();
    }

    // 7. 1er Seguimiento
    if (timeline.diasAprobacionPlanosASeguimiento1) {
      // Si tiene el nuevo flujo con aprobación de planos
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasAprobacionPlanosASeguimiento1,
      );
      updates.fechaLimitePrimerSeguimiento = new Date(
        fechaActual,
      ).toISOString();
    } else if (timeline.diasPagadoASeguimiento1) {
      // Fallback para compatibilidad con datos antiguos (sin aprobación de planos)
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasPagadoASeguimiento1,
      );
      updates.fechaLimitePrimerSeguimiento = new Date(
        fechaActual,
      ).toISOString();
    }

    // 8. En FOB / En CIF
    if (timeline.diasSeguimiento1AFob) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasSeguimiento1AFob,
      );
      updates.fechaLimiteEnFOB = new Date(fechaActual).toISOString();
    }

    // 9. Cotización Flete Internacional
    if (timeline.diasFobACotizacionFlete) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasFobACotizacionFlete,
      );
      updates.fechaLimiteCotizacionFleteInternacional = new Date(
        fechaActual,
      ).toISOString();
    }

    // 10. Con BL / Póliza Seguros
    if (timeline.diasCotizacionFleteABl) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasCotizacionFleteABl,
      );
      updates.fechaLimiteConBL = new Date(fechaActual).toISOString();
    } else if (timeline.diasFobABl) {
      // Fallback para compatibilidad con datos antiguos
      fechaActual = this.agregarDias(fechaActual, timeline.diasFobABl);
      updates.fechaLimiteConBL = new Date(fechaActual).toISOString();
    }

    // 11. 2do Seguimiento / En Tránsito
    if (timeline.diasBlASeguimiento2) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasBlASeguimiento2);
      updates.fechaLimiteSegundoSeguimiento = new Date(
        fechaActual,
      ).toISOString();
    }

    // 12. Proceso Aduana (antes En CIF)
    if (timeline.diasSeguimiento2ACif) {
      fechaActual = this.agregarDias(
        fechaActual,
        timeline.diasSeguimiento2ACif,
      );
      updates.fechaLimiteEnCIF = new Date(fechaActual).toISOString();
    }

    // 13. Recibido
    if (timeline.diasCifARecibido) {
      fechaActual = this.agregarDias(fechaActual, timeline.diasCifARecibido);
      updates.fechaLimiteRecibido = new Date(fechaActual).toISOString();
    }

    await transaction.estadoProducto.update({
      where: { id: estadoProductoId },
      data: updates,
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
    user: UserJwt,
  ) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException(
        'Solo supervisores pueden aprobar productos',
      );
    }

    // Verificar que la cotización existe
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      include: {
        estadosProductos: true,
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }
    // ============================================================================
    // VALIDACIONES ANTES DE APROBAR
    // ============================================================================
    for (const aprobacion of dto.productos) {
      if (aprobacion.aprobado) {
        // Encontrar el estado producto
        const estadoProducto = cotizacion.estadosProductos.find(
          (ep) => ep.id === aprobacion.estadoProductoId,
        );

        if (!estadoProducto) {
          throw new BadRequestException(
            `Producto ${aprobacion.estadoProductoId} no encontrado`,
          );
        }

        // Buscar el detalle correspondiente por SKU
        const detalle = await this.prisma.cotizacionDetalle.findFirst({
          where: {
            cotizacionId: cotizacionId,
            sku: estadoProducto.sku,
          },
          include: {
            precios: {
              select: {
                id: true,
                precio: true,
                precioDescuento: true,
                ComprobanteDescuento: true,
              },
            },
          },
        });

        if (!detalle) {
          throw new BadRequestException(
            `No se encontró el detalle para el producto ${estadoProducto.sku}`,
          );
        }

        // VALIDACIÓN 1: Debe tener precio seleccionado
        if (!detalle.preciosId) {
          throw new BadRequestException(
            `El producto "${estadoProducto.sku}" debe tener un precio seleccionado antes de aprobarlo`,
          );
        }

        // Obtener el precio seleccionado
        const precioSeleccionado = await this.prisma.precios.findUnique({
          where: { id: detalle.preciosId },
        });

        if (!precioSeleccionado) {
          throw new BadRequestException(
            `No se encontró el precio seleccionado para "${estadoProducto.sku}"`,
          );
        }

        // VALIDACIÓN 2: Debe tener comprobante de descuento solicitado
        if (!precioSeleccionado.ComprobanteDescuento) {
          throw new BadRequestException(
            `El producto "${estadoProducto.sku}" debe tener una solicitud de descuento con comprobante antes de aprobarlo. ` +
              `Por favor, solicite el descuento primero.`,
          );
        }

        // VALIDACIÓN 3: Debe tener resultado de descuento (aprobado o denegado)
        if (precioSeleccionado.precioDescuento === null) {
          throw new BadRequestException(
            `El producto "${estadoProducto.sku}" debe tener el resultado del descuento (aprobado o denegado) antes de aprobarlo. ` +
              `Por favor, agregue el resultado del descuento.`,
          );
        }
      }
    }

    // ============================================================================
    // SI TODAS LAS VALIDACIONES PASARON, PROCEDER CON LA APROBACIÓN
    // ============================================================================

    type CambioAprobacion = {
      estadoProductoId: string;
      sku: string;
      aprobado: boolean;
    };

    let CambioAprobacion;
    // Procesar aprobaciones en transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      const cambios: CambioAprobacion[] = [];

      for (const aprobacion of dto.productos) {
        // Verificar que el estado producto pertenece a esta cotización
        const estadoProducto = cotizacion.estadosProductos.find(
          (ep) => ep.id === aprobacion.estadoProductoId,
        );

        if (!estadoProducto) {
          throw new BadRequestException(
            `Producto ${aprobacion.estadoProductoId} no pertenece a esta cotización`,
          );
        }

        // Actualizar aprobación y estados relacionados
        if (aprobacion.aprobado) {
          // Obtener el detalle con precio seleccionado para extraer info
          const detalle = await tx.cotizacionDetalle.findFirst({
            where: {
              cotizacionId: cotizacionId,
              sku: estadoProducto.sku,
            },
            include: {
              precios: {
                where: { id: { not: undefined } },
              },
            },
          });

          const precioSeleccionado = detalle?.preciosId
            ? await tx.precios.findUnique({
                where: { id: detalle.preciosId },
                include: { proveedor: true },
              })
            : null;

          await tx.estadoProducto.update({
            where: { id: aprobacion.estadoProductoId },
            data: {
              aprobadoPorSupervisor: true,
              fechaAprobacion: new Date(),
              // Marcar como cotizado
              cotizado: true,
              fechaCotizado: estadoProducto.fechaCotizado || new Date(),
              // Marcar descuento como procesado
              conDescuento: true,
              fechaConDescuento: new Date(),
              // Guardar info del proveedor seleccionado
              proveedor:
                precioSeleccionado?.proveedor?.nombre ||
                estadoProducto.proveedor,
              precioUnitario:
                precioSeleccionado?.precioDescuento ||
                precioSeleccionado?.precio ||
                estadoProducto.precioUnitario,
              precioTotal: precioSeleccionado
                ? Number(
                    precioSeleccionado.precioDescuento ||
                      precioSeleccionado.precio,
                  ) * (estadoProducto.cantidad || 1)
                : estadoProducto.precioTotal,
            },
          });
        } else {
          // Si se desaprueba, solo quitar la aprobación (no revertir otros estados)
          await tx.estadoProducto.update({
            where: { id: aprobacion.estadoProductoId },
            data: {
              aprobadoPorSupervisor: false,
              fechaAprobacion: null,
            },
          });
        }

        // Registrar en historial
        await tx.historialCotizacion.create({
          data: {
            cotizacionId: cotizacionId,
            usuarioId: user.sub,
            accion: aprobacion.aprobado
              ? 'PRODUCTO_APROBADO'
              : 'PRODUCTO_DESAPROBADO',
            detalles: {
              productoId: aprobacion.estadoProductoId,
              sku: estadoProducto.sku,
              observaciones: aprobacion.observaciones,
            },
          },
        });
        CambioAprobacion = aprobacion.aprobado
          ? 'PRODUCTO_APROBADO'
          : 'PRODUCTO_DESAPROBADO';

        cambios.push({
          estadoProductoId: aprobacion.estadoProductoId,
          sku: estadoProducto.sku,
          aprobado: aprobacion.aprobado,
        });
      }

      // Calcular totales
      const todosProductos = await tx.estadoProducto.findMany({
        where: { cotizacionId: cotizacionId },
        select: { aprobadoPorSupervisor: true },
      });

      const totalProductos = todosProductos.length;
      const productosAprobados = todosProductos.filter(
        (p) => p.aprobadoPorSupervisor,
      ).length;
      const aprobadaParcialmente =
        productosAprobados > 0 && productosAprobados < totalProductos;
      const todosAprobados =
        productosAprobados === totalProductos && totalProductos > 0;

      // Actualizar cotización
      let nuevoEstado = todosAprobados
        ? 'APROBADA_COMPLETA'
        : aprobadaParcialmente
          ? 'APROBADA_PARCIAL'
          : cotizacion.estado;

      if (CambioAprobacion === 'PRODUCTO_DESAPROBADO') {
        nuevoEstado = 'EN_CONFIGURACION';
      }

      await tx.cotizacion.update({
        where: { id: cotizacionId },
        data: {
          supervisorResponsableId: user.sub,
          aprobadaParcialmente,
          todosProductosAprobados: todosAprobados,
          fechaAprobacion: todosAprobados
            ? new Date()
            : cotizacion.fechaAprobacion,
          estado: nuevoEstado,
        },
      });

      return {
        cambios,
        totalProductos,
        productosAprobados,
        aprobadaParcialmente,
        todosAprobados,
        nuevoEstado,
      };
    });

    return {
      message: 'Aprobaciones actualizadas exitosamente',
      ...resultado,
    };
  }

  /**
   * Obtiene historial completo de una cotización
   */
  async getHistorial(
    cotizacionId: string,
    filters?: {
      accion?: string;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
  ) {
    const where: any = {
      cotizacionId,
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
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: { creado: 'desc' },
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
      include: { rol: true },
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException(
        'Solo supervisores pueden acceder a estadísticas',
      );
    }

    const [
      totalPendientes,
      totalEnConfiguracion,
      totalAprobacionParcial,
      misAsignadas,
    ] = await Promise.all([
      this.prisma.cotizacion.count({
        where: { estado: 'PENDIENTE' },
      }),
      this.prisma.cotizacion.count({
        where: { estado: 'EN_CONFIGURACION' },
      }),
      this.prisma.cotizacion.count({
        where: { estado: 'APROBADA_PARCIAL' },
      }),
      this.prisma.cotizacion.count({
        where: {
          supervisorResponsableId: user.sub,
          estado: { in: ['EN_CONFIGURACION', 'APROBADA_PARCIAL'] },
        },
      }),
    ]);

    return {
      totalPendientes,
      totalEnConfiguracion,
      totalAprobacionParcial,
      misAsignadas,
      totalEnProceso:
        totalPendientes + totalEnConfiguracion + totalAprobacionParcial,
    };
  }

  /**
   * Reasigna supervisor responsable
   */
  async reasignarSupervisor(
    cotizacionId: string,
    nuevoSupervisorId: string,
    user: UserJwt,
  ) {
    // Verificar que es supervisor
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });

    if (!usuario?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new ForbiddenException('Solo supervisores pueden reasignar');
    }

    // Verificar que el nuevo supervisor existe y es supervisor
    const nuevoSupervisor = await this.prisma.usuario.findUnique({
      where: { id: nuevoSupervisorId },
      include: { rol: true },
    });

    if (!nuevoSupervisor?.rol.nombre.toLowerCase().includes('supervisor')) {
      throw new BadRequestException('El usuario seleccionado no es supervisor');
    }

    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { supervisorResponsableId: true },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Actualizar y registrar
    await this.prisma.$transaction([
      this.prisma.cotizacion.update({
        where: { id: cotizacionId },
        data: { supervisorResponsableId: nuevoSupervisorId },
      }),
      this.prisma.historialCotizacion.create({
        data: {
          cotizacionId,
          usuarioId: user.sub,
          accion: 'SUPERVISOR_ASIGNADO',
          detalles: {
            supervisorAnterior: cotizacion.supervisorResponsableId,
            supervisorNuevo: nuevoSupervisorId,
            reasignadoPor: user.sub,
          },
        },
      }),
    ]);

    return {
      message: 'Supervisor reasignado exitosamente',
      nuevoSupervisor: {
        id: nuevoSupervisor.id,
        nombre: nuevoSupervisor.nombre,
        email: nuevoSupervisor.email,
      },
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
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        departamento: {
          select: {
            nombre: true,
          },
        },
        _count: {
          select: {
            cotizacionesSupervisadas: {
              where: {
                estado: { in: ['EN_CONFIGURACION', 'APROBADA_PARCIAL'] },
              },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return supervisores.map((s) => ({
      ...s,
      cotizacionesActivas: s._count.cotizacionesSupervisadas,
    }));
  }

  /**
   * Rechaza un producto individual con motivo
   * El producto queda marcado como rechazado y no puede ser aprobado hasta que se corrija
   */
  async rechazarProducto(
    cotizacionId: string,
    dto: { estadoProductoId: string; motivoRechazo: string },
    user: UserJwt,
  ) {
    // 1. Validaciones de Rol (IGUAL QUE ANTES)
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.sub },
      include: { rol: true },
    });

    const rolNombre = usuario?.rol.nombre.toLowerCase() || '';
    const esSupervisorOAdmin =
      rolNombre.includes('supervisor') || rolNombre.includes('admin');

    if (!esSupervisorOAdmin) {
      throw new ForbiddenException(
        'Solo supervisores pueden rechazar productos',
      );
    }

    // 2. Validar motivo (IGUAL QUE ANTES)
    if (!dto.motivoRechazo || dto.motivoRechazo.trim().length < 10) {
      throw new BadRequestException(
        'El motivo de rechazo debe tener al menos 10 caracteres',
      );
    }

    // ===========================================================================
    // 3. LOGICA NUEVA: Determinar si es un Estado existente o un Detalle virgen
    // ===========================================================================

    // Intentamos buscarlo como EstadoProducto (el caso normal)
    let estadoProducto = await this.prisma.estadoProducto.findFirst({
      where: {
        id: dto.estadoProductoId,
        cotizacionId: cotizacionId,
      },
    });

    // Si no existe como estado, buscamos si es un Detalle de la cotización
    // (Esto pasa cuando rechazas algo que aún no ha sido configurado)
    let esNuevoEstado = false;

    if (!estadoProducto) {
      const detalleProducto = await this.prisma.cotizacionDetalle.findFirst({
        where: {
          id: dto.estadoProductoId, // Aquí usamos el ID que mandó el front
          cotizacionId: cotizacionId,
        },
      });

      if (!detalleProducto) {
        throw new BadRequestException(
          'Producto no encontrado en esta cotización',
        );
      }

      // Si encontramos el detalle, significa que debemos CREAR el estadoProducto ahora mismo
      esNuevoEstado = true;

      // Preparamos los datos básicos, pero lo guardaremos dentro de la transacción
      // para asegurar integridad
      estadoProducto = {
        id: undefined, // Se generará al crear
        cotizacionId: cotizacionId,
        sku: detalleProducto.sku, // Asumiendo que el detalle tiene SKU
        descripcion: detalleProducto.descripcionProducto,
        // ... otros campos necesarios para tu tipo
      } as any;
    }

    // ===========================================================================
    // 4. TRANSACCIÓN
    // ===========================================================================
    const resultado = await this.prisma.$transaction(async (tx) => {
      let estadoIdFinal = dto.estadoProductoId;

      if (esNuevoEstado) {
        // CASO B: Crear el estado desde cero marcado como rechazado
        const nuevoEstado = await tx.estadoProducto.create({
          data: {
            cotizacionId: cotizacionId,
            sku: estadoProducto!.sku || 'SIN-SKU', // Fallback por seguridad
            descripcion: estadoProducto?.descripcion ?? '',
            rechazado: true,
            fechaRechazo: new Date(),
            motivoRechazo: dto.motivoRechazo.trim(),
            aprobadoPorSupervisor: false,
            fechaAprobacion: null,
            // Asegúrate de llenar otros campos obligatorios de tu schema si los hay
            // Ej: criticidad: 1, nivelCriticidad: 'BAJA' (defaults)
          },
        });
        estadoIdFinal = nuevoEstado.id;

        // IMPORTANTE: Si tu modelo de datos requiere vincular el Detalle con el Estado, hazlo aquí.
        // Por ejemplo, si CotizacionDetalle tiene un campo 'estadoProductoId':
        /* await tx.cotizacionDetalle.update({
           where: { id: dto.estadoProductoId }, // el ID original que envió el front
           data: { estadoProductoId: nuevoEstado.id }
        });
        */
      } else {
        // CASO A: Actualizar estado existente
        await tx.estadoProducto.update({
          where: { id: dto.estadoProductoId },
          data: {
            rechazado: true,
            fechaRechazo: new Date(),
            motivoRechazo: dto.motivoRechazo.trim(),
            aprobadoPorSupervisor: false,
            fechaAprobacion: null,
          },
        });
      }

      // 5. Registrar en historial (Usando el ID correcto)
      await tx.historialCotizacion.create({
        data: {
          cotizacionId: cotizacionId,
          usuarioId: user.sub,
          accion: 'PRODUCTO_RECHAZADO',
          detalles: {
            productoId: estadoIdFinal,
            sku: estadoProducto!.sku,
            descripcion: estadoProducto?.descripcion ?? '',
            motivoRechazo: dto.motivoRechazo.trim(),
          },
        },
      });

      // 6. Recalcular estado de la cotización (IGUAL QUE ANTES)
      const todosProductos = await tx.estadoProducto.findMany({
        where: { cotizacionId: cotizacionId },
        select: {
          aprobadoPorSupervisor: true,
          rechazado: true,
        },
      });

      const totalProductos = todosProductos.length;
      const productosAprobados = todosProductos.filter(
        (p) => p.aprobadoPorSupervisor,
      ).length;
      const productosRechazados = todosProductos.filter(
        (p) => p.rechazado,
      ).length;
      const aprobadaParcialmente =
        productosAprobados > 0 && productosAprobados < totalProductos;

      let nuevoEstado = 'EN_CONFIGURACION';
      if (productosRechazados === 0 && productosAprobados === totalProductos) {
        nuevoEstado = 'APROBADA_COMPLETA';
      } else if (aprobadaParcialmente) {
        nuevoEstado = 'APROBADA_PARCIAL';
      }

      await tx.cotizacion.update({
        where: { id: cotizacionId },
        data: {
          supervisorResponsableId: user.sub,
          aprobadaParcialmente,
          todosProductosAprobados: false,
          estado: nuevoEstado,
        },
      });

      return {
        totalProductos,
        productosAprobados,
        productosRechazados,
        nuevoEstado,
        idRechazado: estadoIdFinal,
      };
    });

    return {
      message: 'Producto rechazado exitosamente',
      ...resultado,
    };
  }
}
