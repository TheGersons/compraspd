import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationStatus } from './dto/change-status.dto';

type UserJwt = { sub: string; role?: string };

/**
 * Transiciones de estado permitidas
 */
const ALLOWED_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  ENVIADA: ['EN_REVISION', 'CANCELADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
  APROBADA: [], // Estado final
  RECHAZADA: [], // Estado final
  CANCELADA: [], // Estado final
};

/**
 * Service para gestión de cotizaciones
 * Basado en el nuevo schema: Cotizacion + CotizacionDetalle
 */
@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una cotización nueva con sus items
   * Validaciones:
   * - Al menos 1 item
   * - tipoId debe existir en la tabla Tipo
   * - proyectoId debe existir (si se proporciona)
   */
  /**
   * Crea una cotización nueva con sus items
   * Ahora también crea el chat automáticamente
   */
  async create(dto: CreateQuotationDto, user: UserJwt) {
    const { items, ...quotationData } = dto;

    // Validar items
    if (!items || items.length === 0) {
      throw new BadRequestException(
        'Debes incluir al menos 1 ítem en la cotización',
      );
    }

    // Validar que el tipo existe
    const tipo = await this.prisma.tipo.findUnique({
      where: { id: dto.tipoId },
      include: { area: true },
    });
    if (!tipo) {
      throw new NotFoundException(`Tipo con ID ${dto.tipoId} no encontrado`);
    }

    // Validar proyecto si se proporciona
    if (dto.proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: dto.proyectoId },
      });
      if (!proyecto || !proyecto.estado) {
        throw new NotFoundException('Proyecto no encontrado o inactivo');
      }
    }

    // Crear cotización con chat en una transacción
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el chat primero
      const chat = await tx.chat.create({
        data: {
          participantes: {
            create: {
              userId: quotationData.solicitanteId,
              ultimoLeido: new Date(),
            },
          },
        },
      });

      // 2. Crear cotización con el chatId
      const cotizacion = await tx.cotizacion.create({
        data: {
          nombreCotizacion: quotationData.nombreCotizacion,
          tipoCompra: quotationData.tipoCompra,
          lugarEntrega: quotationData.lugarEntrega,
          fechaLimite: new Date(quotationData.fechaLimite),
          fechaEstimada: new Date(quotationData.fechaEstimada),
          comentarios: quotationData.comentarios,
          estado: 'ENVIADA',
          solicitanteId: quotationData.solicitanteId,
          tipoId: dto.tipoId,
          proyectoId: dto.proyectoId || null,
          chatId: chat.id, // ← Asociar el chat

          detalles: {
            create: items.map((item) => ({
              descripcionProducto: item.descripcionProducto,
              cantidad: item.cantidad,
              tipoUnidad: item.tipoUnidad,
              notas: item.notas || null,
            })),
          },
        },
        include: {
          detalles: true,
          solicitante: {
            select: {
              id: true,
              nombre: true,
              email: true,
              departamento: {
                select: { nombre: true },
              },
            },
          },
          tipo: {
            include: { area: true },
          },
          proyecto: true,
          chat: true, // ← Incluir chat en respuesta
        },
      });

      return cotizacion;
    });
  }

  /**
   * Lista todas las cotizaciones del usuario autenticado
   * Incluye paginación
   */
  async listMine(user: UserJwt, page = 1, pageSize = 20) {
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize));
    const take = Math.min(100, Math.max(1, pageSize));

    const [total, items] = await this.prisma.$transaction([
      this.prisma.cotizacion.count({
        where: { solicitanteId: user.sub },
      }),
      this.prisma.cotizacion.findMany({
        where: { solicitanteId: user.sub },
        include: {
          detalles: true,
          tipo: { include: { area: true } },
          proyecto: true,
          solicitante: {
            select: { nombre: true, email: true },
          },
        },
        orderBy: { fechaSolicitud: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  /**
   * Obtiene una cotización por ID
   * Valida permisos: solo el solicitante o supervisores pueden verla
   */
  /**
   * Obtiene una cotización por ID
   * Si es supervisor/admin y no está en el chat, lo agrega automáticamente
   */
  async getById(id: string, user: UserJwt) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            precios: {
              include: {
                proveedor: true,
              },
            },
            preciosOfertas: {
              include: {
                proveedor: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
              orderBy: {
                precio: 'asc',
              },
            },
          },
        },
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: { select: { nombre: true } },
          },
        },
        tipo: { include: { area: true } },
        proyecto: true,
        chat: {
          include: {
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

    // Validar permisos
    const isOwner = cotizacion.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    if (!isOwner && !isSupervisor) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta cotización',
      );
    }

    // Si es supervisor y hay chat, verificar si está como participante
    if (isSupervisor && cotizacion.chatId) {
      const yaEsParticipante = cotizacion.chat?.participantes.some(
        (p) => p.userId === user.sub,
      );

      if (!yaEsParticipante) {
        // Agregar supervisor al chat
        await this.prisma.participantesChat
          .create({
            data: {
              chatId: cotizacion.chatId,
              userId: user.sub,
              ultimoLeido: new Date(),
            },
          })
          .catch(() => {
            // Ignorar si ya existe (por race condition)
          });
      }
    }

    return cotizacion;
  }

  /**
   * Actualiza una cotización existente
   * Solo permite editar si:
   * - Es el dueño Y estado = ENVIADA
   * - Es supervisor/admin Y estado = ENVIADA o EN_REVISION
   */
  async update(id: string, dto: UpdateQuotationDto, user: UserJwt) {
    const current = await this.prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar permisos de edición
    const isOwner = current.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    const canEdit =
      (isOwner && current.estado === 'ENVIADA') ||
      (isSupervisor && ['ENVIADA', 'EN_REVISION'].includes(current.estado));

    if (!canEdit) {
      throw new ForbiddenException(
        'No puedes editar esta cotización en su estado actual',
      );
    }

    // Validar tipoId si se proporciona
    if (dto.tipoId && dto.tipoId !== current.tipoId) {
      const tipo = await this.prisma.tipo.findUnique({
        where: { id: dto.tipoId },
      });
      if (!tipo) {
        throw new NotFoundException('Tipo no encontrado');
      }
    }

    // Validar proyectoId si se proporciona
    if (dto.proyectoId && dto.proyectoId !== current.proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: dto.proyectoId },
      });
      if (!proyecto || !proyecto.estado) {
        throw new NotFoundException('Proyecto no encontrado o inactivo');
      }
    }

    // Actualizar solo campos de cabecera
    return this.prisma.cotizacion.update({
      where: { id },
      data: {
        nombreCotizacion: dto.nombreCotizacion ?? current.nombreCotizacion,
        tipoCompra: dto.tipoCompra ?? current.tipoCompra,
        lugarEntrega: dto.lugarEntrega ?? current.lugarEntrega,
        fechaLimite: dto.fechaLimite
          ? new Date(dto.fechaLimite)
          : current.fechaLimite,
        fechaEstimada: dto.fechaEstimada
          ? new Date(dto.fechaEstimada)
          : current.fechaEstimada,
        comentarios: dto.comentarios ?? current.comentarios,
        tipoId: dto.tipoId ?? current.tipoId,
        proyectoId: dto.proyectoId ?? current.proyectoId,
      },
      include: {
        detalles: true,
        tipo: { include: { area: true } },
        proyecto: true,
      },
    });
  }

  /**
   * Cambia el estado de una cotización
   * Valida transiciones permitidas y permisos
   */
  async changeStatus(id: string, nuevoEstado: QuotationStatus, user: UserJwt) {
    const current = await this.prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!current) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar transición
    const estadoActual = current.estado as QuotationStatus;
    const transicionesPermitidas = ALLOWED_TRANSITIONS[estadoActual] || [];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoActual} → ${nuevoEstado}`,
      );
    }

    // Validar permisos
    const isOwner = current.solicitanteId === user.sub;
    const isSupervisor = this.isSupervisorOrAdmin(user);

    // Reglas de permisos por transición
    if (nuevoEstado === 'CANCELADA') {
      // Solo el dueño puede cancelar (si aún no está aprobada/rechazada)
      if (!isOwner) {
        throw new ForbiddenException('Solo el solicitante puede cancelar');
      }
    } else if (['APROBADA', 'RECHAZADA', 'EN_REVISION'].includes(nuevoEstado)) {
      // Solo supervisores/admin pueden aprobar/rechazar/revisar
      if (!isSupervisor) {
        throw new ForbiddenException(
          'Solo supervisores pueden cambiar a este estado',
        );
      }
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: {
        detalles: true,
        solicitante: { select: { nombre: true, email: true } },
        tipo: { include: { area: true } },
      },
    });
  }

  /**
   * Lista todas las cotizaciones (para supervisores/admin)
   * Incluye filtros opcionales
   */
  async listAll(
    user: UserJwt,
    filters?: {
      estado?: QuotationStatus;
      tipoId?: string;
      proyectoId?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException(
        'No tienes permiso para ver todas las cotizaciones',
      );
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize));
    const take = Math.min(100, Math.max(1, pageSize));

    const where: any = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.tipoId) where.tipoId = filters.tipoId;
    if (filters?.proyectoId) where.proyectoId = filters.proyectoId;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.cotizacion.count({ where }),
      this.prisma.cotizacion.findMany({
        where,
        include: {
          detalles: true,
          solicitante: {
            select: {
              nombre: true,
              email: true,
              departamento: { select: { nombre: true } },
            },
          },
          tipo: { include: { area: true } },
          proyecto: true,
        },
        orderBy: { fechaSolicitud: 'desc' },
        skip,
        take,
      }),
    ]);

    return { page, pageSize, total, items };
  }

  /**
   * Verifica si el usuario es supervisor o administrador
   */
  private isSupervisorOrAdmin(user: UserJwt): boolean {
    const role = (user.role || '').toUpperCase();
    return role === 'SUPERVISOR' || role === 'ADMIN';
  }

  // ============================================================================
  // AGREGAR ESTE MÉTODO EN quotations.service.ts
  // ============================================================================

  /**
   * Obtiene todas las cotizaciones del usuario actual (como solicitante)
   * Con estadísticas de aprobación y progreso
   * Para vista MyQuotes del frontend
   */
  async getMyCotizaciones(user: UserJwt) {
    const cotizaciones = await this.prisma.cotizacion.findMany({
      where: {
        solicitanteId: user.sub,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: {
              select: { nombre: true },
            },
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
          select: {
            id: true,
            sku: true,
            descripcionProducto: true,
            cantidad: true,
            tipoUnidad: true,
          },
        },
        estadosProductos: {
          select: {
            id: true,
            sku: true,
            aprobadoPorSupervisor: true,
            criticidad: true,
            nivelCriticidad: true,
            diasRetrasoActual: true,
            paisOrigen: {
              select: { nombre: true },
            },
            medioTransporte: true,
          },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });

    // Calcular estadísticas de aprobación por cotización
    return cotizaciones.map((cot) => {
      const totalProductos = cot.detalles.length;
      const productosAprobados = cot.estadosProductos.filter(
        (ep) => ep.aprobadoPorSupervisor,
      ).length;
      const productosPendientes = totalProductos - productosAprobados;
      const porcentajeAprobado =
        totalProductos > 0
          ? Math.round((productosAprobados / totalProductos) * 100)
          : 0;

      return {
        id: cot.id,
        nombreCotizacion: cot.nombreCotizacion,
        estado: cot.estado,
        fechaSolicitud: cot.fechaSolicitud,
        fechaLimite: cot.fechaLimite,
        fechaEstimada: cot.fechaEstimada,
        aprobadaParcialmente: cot.aprobadaParcialmente,
        todosProductosAprobados: cot.todosProductosAprobados,
        comentarios: cot.comentarios,
        tipoCompra: cot.tipoCompra,
        lugarEntrega: cot.lugarEntrega,
        chatId: cot.chatId,

        // Relaciones
        solicitante: cot.solicitante,
        supervisorResponsable: cot.supervisorResponsable,
        proyecto: cot.proyecto,
        tipo: cot.tipo,

        // Estadísticas calculadas
        totalProductos,
        productosAprobados,
        productosPendientes,
        porcentajeAprobado,

        // NO incluir detalles completos aquí para reducir payload
        // El frontend pedirá los detalles con getById si es necesario
      };
    });
  }
  /**
   * Crea un chat para una cotización existente que no tiene uno
   * Evita duplicados verificando si ya existe
   */
  async ensureChat(cotizacionId: string, user: UserJwt) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: {
        id: true,
        chatId: true,
        solicitanteId: true,
        supervisorResponsableId: true,
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Si ya tiene chat, retornarlo
    if (cotizacion.chatId) {
      return this.prisma.chat.findUnique({
        where: { id: cotizacion.chatId },
        include: {
          participantes: {
            include: {
              usuario: {
                select: { id: true, nombre: true, email: true },
              },
            },
          },
        },
      });
    }

    // Crear chat con participantes (solicitante + supervisor si existe)
    const participantes = [cotizacion.solicitanteId];
    if (cotizacion.supervisorResponsableId) {
      participantes.push(cotizacion.supervisorResponsableId);
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear chat
      const chat = await tx.chat.create({
        data: {
          participantes: {
            create: participantes.map((userId) => ({
              userId,
              ultimoLeido: new Date(),
            })),
          },
        },
      });

      // Asociar a cotización
      await tx.cotizacion.update({
        where: { id: cotizacionId },
        data: { chatId: chat.id },
      });

      return tx.chat.findUnique({
        where: { id: chat.id },
        include: {
          participantes: {
            include: {
              usuario: {
                select: { id: true, nombre: true, email: true },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Elimina una cotización y limpia sus datos asociados
   */
  async delete(id: string, user: UserJwt) {
    // 1. Obtener datos para limpieza (Chat ID)
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      select: { chatId: true },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // 2. Transacción de borrado
    return this.prisma.$transaction(async (tx) => {
      // PASO A: Borrar la cotización
      // Esto borrará en cascada: Detalles, Estados, Historial, Notificaciones
      await tx.cotizacion.delete({
        where: { id },
      });

      // PASO B: Borrar el Chat huérfano manualmente (si existe)
      if (cotizacion.chatId) {
        await tx.chat
          .delete({
            where: { id: cotizacion.chatId },
          })
          .catch((e) => console.warn('Chat no encontrado o ya borrado', e));
      }

      return { message: 'Cotización eliminada correctamente' };
    });
  }
}
