import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
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
      locationId, // Añadido locationId para ser manejado aquí
      requestCategory,
      warehouseId,
      dueDate,
      quoteDeadline,
      ...rest
    } = input;

    // Start constructing the data payload. Attach the requester via a
    // relation instead of passing an undefined requesterId.
    const data: any = {
      ...rest,
      procurement,
      deliveryType,
      requestCategory : requestCategory,
      warehouseId : warehouseId || undefined,
      requester: { connect: { id: user.userId } },
      dueDate: dueDate ? new Date(dueDate) : undefined,
      quoteDeadline: quoteDeadline ? new Date(quoteDeadline) : undefined
    };
    
    // --- INICIO DE VERIFICACIÓN DE FALLO ---
    console.log('--- CHECKPOINT 1: Inicio de Mapeo de Relaciones ---');
    console.log('IDs Opcionales:', { projectId, departmentId, clientId, locationId });
    // ----------------------------------------

    // Condicionalmente adjuntar relaciones opcionales. Agregué una
    // verificación para string vacío (''), que es a menudo el problema en peticiones HTTP.
    // Proyecto / Almacén coherentes con deliveryType
     // relaciones opcionales
    if (departmentId) data.department = { connect: { id: departmentId } };
    if (locationId)  data.location  = { connect: { id: locationId } };

    // aquí NO uses warehouseId: el schema expone relación "warehouse"
    if (deliveryType === 'PROJECT') {
      if (projectId) data.project = { connect: { id: projectId } };
    } else {
      if (warehouseId) data.warehouse = { connect: { id: warehouseId } }; // << corrección
    }

    // cliente: conecta por id real; por nombre solo si es UNIQUE en Prisma
    if (clientId) {
      if (/^[0-9a-f-]{16,}$/i.test(clientId)) data.client = { connect: { id: clientId } };
      else data.client = { connect: { name: clientId } }; // requiere @@unique(name)
    }
    // Map items, converting undefined optional fields to null so Prisma
    // accepts them. The quantity is converted to a number.
    data.items = {
      create: items.map((item) => {

        // Objeto base del ítem (campos obligatorios y el que requiere conversión)
        const itemData: any = {
          description: item.description,
          quantity: Number(item.quantity), // Convertir el string del DTO a Number/Decimal
          unit: item.unit ?? 1, // Si es undefined, se queda así
          sku: item.sku ?? undefined,
          barcode: item.barcode ?? undefined,
          requiredCurrency: item.requiredCurrency ?? 'HNL',
          productId: item.productId ?? undefined,
          itemType: item.itemType ?? undefined,
        };

        // **PASO CLAVE: Función de Limpieza**
        // Filtramos el objeto para eliminar claves que son undefined o null.
        Object.keys(itemData).forEach((key) => {
          // Usamos `== null` para verificar si es `null` o `undefined`.
          if (itemData[key] == null) {
            delete itemData[key];
          }
        });

        return itemData;
      }),
    }
    
    // --- PUNTO CRÍTICO DE LOG ---
    console.log('--- CHECKPOINT 2: DATA FINAL LISTA PARA PRISMA ---');
    // Muestra solo los campos principales de "data" y el primer ítem
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
      }, // Incluimos todas las relaciones para confirmar que se conectan
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

    // Solo dueño puede editar en DRAFT. Supervisores podrían editar en UNDER_REVIEW si así lo decides.
    const canEdit =
      (current.requesterId === me.sub && current.status === 'DRAFT') ||
      (this.isSupervisorOrAdmin(me) && ['SUBMITTED', 'UNDER_REVIEW'].includes(current.status));
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
        comment: dto.comment ?? current.comment,
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
    // - Supervisor/Admin pueden mover SUBMITTED/UNDER_REVIEW → (APPROVED|REJECTED|CANCELLED|UNDER_REVIEW)
    const isOwner = current.requesterId === me.sub;
    const isSupervisor = this.isSupervisorOrAdmin(me);

    if (current.status === 'DRAFT') {
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
      where: { assigneeId: me.sub, entityType: 'PurchaseRequest' },
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
}