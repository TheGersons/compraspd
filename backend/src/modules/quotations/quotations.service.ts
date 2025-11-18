import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
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
  async create(dto: CreateQuotationDto, user: UserJwt) {
    const { items, ...quotationData } = dto;

    // Validar items
    if (!items || items.length === 0) {
      throw new BadRequestException('Debes incluir al menos 1 ítem en la cotización');
    }

    // Validar que el tipo existe
    const tipo = await this.prisma.tipo.findUnique({
      where: { id: dto.tipoId },
      include: { area: true }
    });
    if (!tipo) {
      throw new NotFoundException(`Tipo con ID ${dto.tipoId} no encontrado`);
    }

    // Validar proyecto si se proporciona
    if (dto.proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: dto.proyectoId }
      });
      if (!proyecto || !proyecto.estado) {
        throw new NotFoundException('Proyecto no encontrado o inactivo');
      }
    }

    // Crear cotización con items
    return this.prisma.cotizacion.create({
      data: {
        nombreCotizacion: quotationData.nombreCotizacion,
        tipoCompra: quotationData.tipoCompra,
        lugarEntrega: quotationData.lugarEntrega,
        fechaLimite: new Date(quotationData.fechaLimite),
        fechaEstimada: new Date(quotationData.fechaEstimada),
        comentarios: quotationData.comentarios,
        estado: 'ENVIADA', // Estado inicial
        solicitanteId: user.sub,
        tipoId: dto.tipoId,
        proyectoId: dto.proyectoId || null,
        
        // Crear detalles en la misma transacción
        detalles: {
          create: items.map(item => ({
            sku: item.sku || null,
            descripcionProducto: item.descripcionProducto,
            cantidad: item.cantidad,
            tipoUnidad: item.tipoUnidad,
            notas: item.notas || null,
          }))
        }
      },
      include: {
        detalles: true,
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: {
              select: { nombre: true }
            }
          }
        },
        tipo: {
          include: { area: true }
        },
        proyecto: true,
      }
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
        where: { solicitanteId: user.sub } 
      }),
      this.prisma.cotizacion.findMany({
        where: { solicitanteId: user.sub },
        include: {
          detalles: true,
          tipo: { include: { area: true } },
          proyecto: true,
          solicitante: {
            select: { nombre: true, email: true }
          }
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
      items 
    };
  }

  /**
   * Obtiene una cotización por ID
   * Valida permisos: solo el solicitante o supervisores pueden verla
   */
  async getById(id: string, user: UserJwt) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            precios: {
              include: {
                proveedor: true
              }
            }
          }
        },
        solicitante: {
          select: {
            id: true,
            nombre: true,
            email: true,
            departamento: { select: { nombre: true } }
          }
        },
        tipo: { include: { area: true } },
        proyecto: true,
      }
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar permisos
    if (cotizacion.solicitanteId !== user.sub && !this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('No tienes permiso para ver esta cotización');
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
      where: { id } 
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
        'No puedes editar esta cotización en su estado actual'
      );
    }

    // Validar tipoId si se proporciona
    if (dto.tipoId && dto.tipoId !== current.tipoId) {
      const tipo = await this.prisma.tipo.findUnique({ 
        where: { id: dto.tipoId } 
      });
      if (!tipo) {
        throw new NotFoundException('Tipo no encontrado');
      }
    }

    // Validar proyectoId si se proporciona
    if (dto.proyectoId && dto.proyectoId !== current.proyectoId) {
      const proyecto = await this.prisma.proyecto.findUnique({ 
        where: { id: dto.proyectoId } 
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
        fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : current.fechaLimite,
        fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : current.fechaEstimada,
        comentarios: dto.comentarios ?? current.comentarios,
        tipoId: dto.tipoId ?? current.tipoId,
        proyectoId: dto.proyectoId ?? current.proyectoId,
      },
      include: {
        detalles: true,
        tipo: { include: { area: true } },
        proyecto: true,
      }
    });
  }

  /**
   * Cambia el estado de una cotización
   * Valida transiciones permitidas y permisos
   */
  async changeStatus(id: string, nuevoEstado: QuotationStatus, user: UserJwt) {
    const current = await this.prisma.cotizacion.findUnique({ 
      where: { id } 
    });

    if (!current) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Validar transición
    const estadoActual = current.estado as QuotationStatus;
    const transicionesPermitidas = ALLOWED_TRANSITIONS[estadoActual] || [];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición no permitida: ${estadoActual} → ${nuevoEstado}`
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
          'Solo supervisores pueden cambiar a este estado'
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
      }
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
    }
  ) {
    if (!this.isSupervisorOrAdmin(user)) {
      throw new ForbiddenException('No tienes permiso para ver todas las cotizaciones');
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
              departamento: { select: { nombre: true } }
            }
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
}