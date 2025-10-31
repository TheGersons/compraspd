import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/sendmessage.dto';

type UserJwt = { sub: string; role?: string };

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['IN_PROGRESS', 'CANCELLED', 'REJECTED'],
  IN_PROGRESS: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};
const toEnumProcurement = (v?: string) => {
  const t = (v ?? '').toUpperCase();
  if (t === 'NATIONAL' || t === 'INTERNATIONAL') return t;
  if (t === 'NACIONAL') return 'NATIONAL';
  if (t === 'INTERNACIONAL') return 'INTERNATIONAL';
  return undefined;
};

const toEnumDelivery = (v?: string) => {
  const t = (v ?? '').toUpperCase();
  if (t === 'WAREHOUSE' || t === 'PROJECT') return t;
  if (t === 'ALMACEN' || t === 'ALMACÉN') return 'WAREHOUSE';
  if (t === 'PROYECTO') return 'PROJECT';
  return undefined;
};


/**
 * Service responsible for handling purchase request operations. This
 * implementation makes optional relations like projectId, departmentId and
 * clientId truly optional by conditionally attaching them to the create
 * payload. It also connects the authenticated user as the requester and
 * sanitises item payloads so undefined optional properties become null.
 */
@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Creates a new purchase request. Ensures that at least one item is
   * provided and attaches the authenticated user as the requester. Optional
   * relations (project, department, client) are only connected when values
   * are supplied.
   *
   * @param input The payload for the purchase request
   * @param user The authenticated user creating the request
   */
  async create(input: CreatePurchaseRequestDto, user: { sub?: string; userId?: string }) {
    // Validate items exist
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Debes incluir al menos 1 ítem');
    }

    // 1) Usuario solicitante
    const requesterId = user?.userId ?? user?.sub;
    if (!requesterId) throw new BadRequestException('Usuario no identificado. ' + user.userId);

    // 2) Normaliza enums para Prisma
    const procurement = toEnumProcurement(input.procurement);
    const deliveryType = toEnumDelivery(input.deliveryType);
    if (!procurement) throw new BadRequestException('procurement inválido');
    if (!deliveryType) throw new BadRequestException('deliveryType inválido');
    
    // Destructure optional foreign keys so we can handle them separately
    const {
      items,
      projectId,
      departmentId,
      clientId,
      locationId,
      requestCategory,
      warehouseId,
      dueDate,
      quoteDeadline,
      ...rest
    } = input;

    // Start constructing the data payload.
    const data: any = {
      ...rest,
      procurement,
      deliveryType,
      requestCategory: requestCategory,
      requester: { connect: { id: requesterId } },
      dueDate: dueDate ? new Date(dueDate) : undefined,
      quoteDeadline: quoteDeadline ? new Date(quoteDeadline) : undefined
    };

    // --- INICIO DE VERIFICACIÓN DE FALLO ---
    console.log('--- CHECKPOINT 1: Inicio de Mapeo de Relaciones ---');
    console.log('IDs Opcionales:', { projectId, departmentId, clientId, locationId });
    // ----------------------------------------

    // Condicionalmente adjuntar relaciones opcionales.
    if (departmentId) data.department = { connect: { id: departmentId } };
    if (locationId) data.location = { connect: { id: locationId } };

    // Proyecto / Almacén coherentes con deliveryType
    if (deliveryType === 'PROJECT') {
      if (projectId) data.project = { connect: { id: projectId } };
    } else {
      if (warehouseId) data.warehouse = { connect: { id: warehouseId } };
    }

    // ----------------------------------------------------------------
    // !!! CORRECCIÓN DEL CLIENTE !!!
    // Conecta el cliente *siempre* usando el campo 'id' de la tabla Client.
    // Esto coincide con el error de Prisma que requiere 'id' o 'taxId' para `connect`.
    if (clientId) {
        data.client = { connect: { id: clientId } };
    }
    // ----------------------------------------------------------------

    // Map items, converting undefined optional fields to null so Prisma
    data.items = {
      create: items.map((item) => {
        // Objeto base del ítem (campos obligatorios y el que requiere conversión)
        const itemData: any = {
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit ?? 1,
          sku: item.sku ?? undefined,
          barcode: item.barcode ?? undefined,
          requiredCurrency: item.requiredCurrency ?? 'HNL',
          productId: item.productId ?? undefined,
          itemType: item.itemType ?? undefined,
          extraSpecs: item.extraSpecs ?? undefined,
        };

        // **PASO CLAVE: Función de Limpieza**
        // Filtramos el objeto para eliminar claves que son undefined o null.
        Object.keys(itemData).forEach((key) => {
          if (itemData[key] == null) {
            delete itemData[key];
          }
        });

        return itemData;
      }),
    }

    // --- PUNTO CRÍTICO DE LOG ---
    console.log('--- CHECKPOINT 2: DATA FINAL LISTA PARA PRISMA ---');
    const logData = {
      ...data,
      items: { create: data.items.create.length > 0 ? [data.items.create[0], `... ${data.items.create.length - 1} más`] : [] }
    };
    console.log('Data Final (Extracto):', JSON.stringify(logData, null, 2));
    console.log('--------------------------------------------------');
    // ----------------------------

    // Log corto útil
    console.log('[PR.create] data.deliveryType=', data.deliveryType,
      'warehouseId=', data.warehouseId, 'project?', !!data.project,
      'requester=', requesterId);


    // La operación de creación de la Solicitud de Compra
    return this.prisma.purchaseRequest.create({
      data,
      include: {
        requester: true,
        items: true,
        project: true,
        location: true,
        department: true,
        client: true,
      },
    });
}

  // Lista todas las solicitudes creadas por el usuario autenticado.
  async listMine(me: UserJwt, page = 1, pageSize = 20) {
    const [total, items] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.count({ where: { requesterId: me.sub } }),
      this.prisma.purchaseRequest.findMany({
        where: { requesterId: me.sub },
        include: { items: true, project: true, location: true },
        orderBy: { createdAt: 'desc' },
        skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize)),
        take: Math.min(100, Math.max(1, pageSize)),
      }),
    ]);
    return { page, pageSize, total, items };
  }

  // Obtiene una solicitud por ID.
  async getById(id: string, me: UserJwt) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true, project: true, location: true, attachments: true },
    });
    if (!pr) throw new NotFoundException('Solicitud no encontrada');

    // Si no es supervisor/admin, solo puede ver las suyas (puedes refinar con permisos)
    if (pr.requesterId !== me.sub && !this.isSupervisorOrAdmin(me)) {
      throw new ForbiddenException('No puedes ver esta solicitud');
    }
    return pr;
  }

  // Actualiza una solicitud existente.
  async update(id: string, dto: any, me: UserJwt) {
    // --- NUEVO LOG DE VERIFICACIÓN ---
    console.log('--- VERIFICANDO ROL DEL USUARIO EN UPDATE ---');
    console.log('Usuario que ejecuta (me):', me);
    console.log('--------------------------------------------');
    // ------------------------------------
    const current = await this.prisma.purchaseRequest.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw new NotFoundException('Solicitud no encontrada');

    // Solo dueño puede editar en DRAFT. Supervisores podrían editar en IN_PROGRESS si así lo decides.
    const canEdit =
      (current.requesterId === me.sub && current.status === 'SUBMITTED') ||
      (this.isSupervisorOrAdmin(me) && ['SUBMITTED', 'IN_PROGRESS'].includes(current.status));
    if (!canEdit) throw new ForbiddenException('No puedes editar esta solicitud en su estado actual');

    // Actualizar cabecera (no tocamos items aquí; puedes modelar PATCH de items aparte)
    return this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        title: dto.title ?? current.title,
        description: dto.description ?? current.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : current.dueDate,
        projectId: dto.projectId ?? current.projectId,
        locationId: dto.locationId ?? current.locationId,
        departmentId: dto.departmentId ?? current.departmentId,
        clientId: dto.clientId ?? current.clientId,
        procurement: dto.procurement ?? current.procurement,
        quoteDeadline: dto.quoteDeadline ? new Date(dto.quoteDeadline) : current.quoteDeadline,
        deliveryType: dto.deliveryType ?? current.deliveryType,
        reference: dto.reference ?? current.reference,
        comments: dto.comments ?? current.comments,
      },
      include: { items: true },
    });
  }

  // Cambia el estado de una solicitud.
  async changeStatus(id: string, status: string, me: UserJwt) {
    const current = await this.prisma.purchaseRequest.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Solicitud no encontrada');

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Transición no permitida: ${current.status} → ${status}`);
    }

    // Reglas:
    // - El solicitante puede pasar DRAFT→SUBMITTED / DRAFT→CANCELLED
    // - Supervisor/Admin pueden mover SUBMITTED/IN_PROGRESS → (APPROVED|REJECTED|CANCELLED|IN_PROGRESS)
    const isOwner = current.requesterId === me.sub;
    const isSupervisor = this.isSupervisorOrAdmin(me);

    if (current.status === 'SUBMITTED' || current.status === 'IN_PROGRESS') {
      if (!(isOwner || isSupervisor)) throw new ForbiddenException('No autorizado');
    } else {
      if (!isSupervisor) throw new ForbiddenException('Solo supervisores o admin pueden cambiar este estado');
    }

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: { status },
    });
  }

  // Listado de solicitudes asignadas a un supervisor para revisión
  async listAssignedTo(me: UserJwt, page = 1, pageSize = 20) {
    // Busca assignments del usuario sobre PR y trae la PR asociada
    const assignments = await this.prisma.assignment.findMany({
      where: { assignedToId: me.sub, entityType: 'PurchaseRequest' },
      orderBy: { createdAt: 'desc' },
      skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize)),
      take: Math.min(100, Math.max(1, pageSize)),
    });

    const ids = assignments.map(a => a.entityId);
    const [total, items] = await this.prisma.$transaction([
      this.prisma.purchaseRequest.count({ where: { id: { in: ids } } }),
      this.prisma.purchaseRequest.findMany({
        where: { id: { in: ids } },
        include: { items: true, project: true, location: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { page, pageSize, total, items };
  }

  // Comprueba si el usuario tiene rol de supervisor o administrador
  private isSupervisorOrAdmin(me: UserJwt) {
    const r = (me.role || '').toUpperCase();
    return r === 'SUPERVISOR' || r === 'ADMIN';
  }

   // Lista las solicitudes del usuario logueado
  async listMyRequests(userId: string) {
    const requests = await this.prisma.purchaseRequest.findMany({
      where: {
        requesterId: userId,
        status: { 
          notIn: ['COMPLETED','CANCELLED'],
         }
      },
      include: {
        assignments: {
          where: {
            followStatus: { not: 'COMPLETED' }
          },
          include: {
            assignedTo: {
              select: { fullName: true }
            }
          },
          take: 1, // Solo la asignación activa
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests.map(req => ({
      id: req.id,
      reference: req.reference,
      title: req.title,
      finalClient: req.finalClient,
      createdAt: req.createdAt,
      quotedeadline: req.quoteDeadline,
      requestCategory: req.requestCategory,
      procurement: req.procurement,
      deliveryType: req.deliveryType,
      projectId: req.projectId,
      comments: req.comments,
      status: req.status,
      assignment: req.assignments[0] ? {
        id: req.assignments[0].id,
        progress: req.assignments[0].progress,
        eta: req.assignments[0].eta,
        followStatus: req.assignments[0].followStatus,
        assignedTo: req.assignments[0].assignedTo
      } : undefined
    }));
  }

  // Lista el chat de una solicitud específica
  async listRequestChat(requestId: string) {
    // Encuentra la asignación asociada a esta solicitud
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        purchaseRequestId: requestId,
      },
      select: { id: true }
    });

    if (!assignment) {
      // Si no hay asignación aún, retorna array vacío
      return [];
    }

    // Obtiene los mensajes de la asignación
    return this.prisma.chatMessage.findMany({
      where: { assignmentId: assignment.id },
      include: { 
        files: true, 
        sender: {
          select: { id: true, fullName: true } 
        } 
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Envía un mensaje en el chat de una solicitud
  async sendRequestChat(requestId: string, userId: string, dto: SendMessageDto) {
    // 1. Busca la asignación activa de esta solicitud
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        purchaseRequestId: requestId,
      },
      select: { id: true, assignedToId: true }
    });

    if (!assignment) {
      throw new NotFoundException('Esta solicitud aún no tiene una asignación activa.');
    }

    // 2. Crea el mensaje
    const newMessage = await this.prisma.chatMessage.create({
      data: {
        body: dto.body,
        assignmentId: assignment.id,
        senderId: userId,
        files: {
          connect: dto.fileIds?.map(fileId => ({ id: fileId })) || [],
        },
      },
      include: {
        files: true,
        sender: {
          select: { id: true, fullName: true }
        }
      },
    });

    return newMessage;
  }

  // Sube archivos y los guarda en la base de datos
  async uploadFiles(files: Express.Multer.File[]) {
    // TODO: Implementar subida real a S3 o almacenamiento cloud
    // Por ahora, simula la subida guardando metadata
    
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Aquí deberías subir el archivo a S3, Cloudinary, etc.
        // const uploadResult = await s3.upload(file);
        
        // Por ahora, crea el registro en la base de datos con una URL simulada
        const fileAttachment = await this.prisma.fileAttachment.create({
          data: {
            fileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            url: `/uploads/${file.originalname}`, // TODO: URL real después de subir a S3
          }
        });

        return {
          id: fileAttachment.id,
          name: fileAttachment.fileName,
          sizeBytes: fileAttachment.sizeBytes,
          url: fileAttachment.url,
        };
      })
    );

    return uploadedFiles;
  }

  async listAllRequests() {
    const requests = await this.prisma.purchaseRequest.findMany({
      include: {
        requester: {
          select: {
            fullName: true,
            email: true,
          }
        },
        project: {
          select: {
            name: true,
            code: true,
          }
        },
        department: {
          select: {
            name: true,
          }
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unit: true,
            itemType: true,
            sku: true,
            barcode: true,
          }
        },
        assignments: {
          where: {
            followStatus: { not: 'COMPLETED' }
          },
          include: {
            assignedTo: {
              select: { fullName: true }
            }
          },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests;
  }

  async listMyRequestsHistory(userId: string) {
    const requests = await this.prisma.purchaseRequest.findMany({
      include: {
        requester: {
          select: {
            fullName: true,
            email: true,
          }
        },
        project: {
          select: {
            name: true,
            code: true,
          }
        },
        department: {
          select: {
            name: true,
          }
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unit: true,
            itemType: true,
            sku: true,
            barcode: true,
          }
        },
        assignments: {
          where: {
            followStatus: { not: 'COMPLETED' },
            requesterId: userId
          },
          include: {
            assignedTo: {
              select: { fullName: true }
            }
          },
          take: 1,
        }
      },
      where: {
        requesterId: userId
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests;
  }
}