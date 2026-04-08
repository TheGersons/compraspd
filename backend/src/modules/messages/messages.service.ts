import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatDto, AddParticipantsDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { StorageService } from '../storage';
import { MailService } from '../Mail/mail.service';
import { NotificacionService } from '../notifications/notificacion.service';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de chats y mensajes
 * Basado en: Chat, ParticipantesChat, Mensaje, Adjuntos
 */
@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
    private readonly notificacionService: NotificacionService,
  ) {}

  /**
   * Crea un nuevo chat con participantes
   * El usuario autenticado es incluido automáticamente como participante
   */
  async createChat(dto: CreateChatDto, user: UserJwt) {
    // Verificar que los participantes existen
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        id: { in: dto.participantesIds },
        activo: true,
      },
      select: { id: true, nombre: true },
    });

    if (usuarios.length !== dto.participantesIds.length) {
      throw new NotFoundException(
        'Uno o más usuarios no encontrados o inactivos',
      );
    }

    // Crear chat con participantes (incluyendo al creador)
    const allParticipants = [...new Set([user.sub, ...dto.participantesIds])];

    return this.prisma.chat.create({
      data: {
        participantes: {
          create: allParticipants.map((userId) => ({
            userId,
            ultimoLeido: new Date(), // El creador marca como leído desde inicio
          })),
        },
      },
      include: {
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Lista todos los chats donde el usuario es participante
   * Incluye último mensaje y contador de no leídos
   */
  async listMyChats(user: UserJwt, page = 1, pageSize = 20) {
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize));
    const take = Math.min(100, Math.max(1, pageSize));

    // Obtener chats donde el usuario participa
    const participaciones = await this.prisma.participantesChat.findMany({
      where: { userId: user.sub },
      include: {
        chat: {
          include: {
            participantes: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true,
                  },
                },
              },
            },
            mensajes: {
              take: 1,
              orderBy: { creado: 'desc' },
              include: {
                emisor: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          actualizado: 'desc',
        },
      },
      skip,
      take,
    });

    // Calcular mensajes no leídos para cada chat
    const chatsConInfo = await Promise.all(
      participaciones.map(async (p) => {
        const unreadCount = await this.prisma.mensaje.count({
          where: {
            chatId: p.chatId,
            creado: {
              gt: p.ultimoLeido || new Date(0), // Mensajes después del último leído
            },
            emisorId: {
              not: user.sub, // No contar propios mensajes
            },
          },
        });

        return {
          chatId: p.chatId,
          ultimoLeido: p.ultimoLeido,
          unreadCount,
          chat: p.chat,
          lastMessage: p.chat.mensajes[0] || null,
        };
      }),
    );

    const total = await this.prisma.participantesChat.count({
      where: { userId: user.sub },
    });

    return {
      page,
      pageSize,
      total,
      items: chatsConInfo,
    };
  }

  /**
   * Obtiene un chat específico
   * Valida que el usuario sea participante
   */
  async getChat(chatId: string, user: UserJwt) {
    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        },
      },
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Agrega participantes a un chat existente
   * Solo participantes actuales pueden agregar nuevos
   */
  async addParticipants(
    chatId: string,
    dto: AddParticipantsDto,
    user: UserJwt,
  ) {
    // Verificar que el usuario es participante actual
    const isParticipant = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    // Verificar que los nuevos usuarios existen
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        id: { in: dto.participantesIds },
        activo: true,
      },
      select: { id: true },
    });

    if (usuarios.length !== dto.participantesIds.length) {
      throw new NotFoundException('Uno o más usuarios no encontrados');
    }

    // Agregar participantes (ignorar duplicados)
    await this.prisma.participantesChat.createMany({
      data: dto.participantesIds.map((userId) => ({
        chatId,
        userId,
      })),
      skipDuplicates: true,
    });

    return this.getChat(chatId, user);
  }

  /**
   * Crea un mensaje en un chat
   * Actualiza la marca de tiempo del chat y marca como leído para el emisor
   */
  async createMessage(dto: CreateMessageDto, user: UserJwt) {
    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId: dto.chatId,
          userId: user.sub,
        },
      },
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    // Validar adjuntos si se proporcionan
    if (dto.adjuntosIds && dto.adjuntosIds.length > 0) {
      const adjuntos = await this.prisma.adjuntos.findMany({
        where: {
          id: { in: dto.adjuntosIds },
          mensajeId: '', // Solo adjuntos sin asignar
        },
      });

      if (adjuntos.length !== dto.adjuntosIds.length) {
        throw new BadRequestException(
          'Uno o más adjuntos no encontrados o ya están asignados',
        );
      }
    }

    // Crear mensaje en transacción
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear mensaje
      const mensaje = await tx.mensaje.create({
        data: {
          chatId: dto.chatId,
          emisorId: user.sub,
          contenido: dto.contenido,
          tipoMensaje: dto.tipoMensaje || 'TEXTO',
        },
      });

      // 2. Asociar adjuntos si existen
      if (dto.adjuntosIds && dto.adjuntosIds.length > 0) {
        await tx.adjuntos.updateMany({
          where: {
            id: { in: dto.adjuntosIds },
          },
          data: {
            mensajeId: mensaje.id,
          },
        });
      }

      // 3. Actualizar timestamp del chat
      await tx.chat.update({
        where: { id: dto.chatId },
        data: { actualizado: new Date() },
      });

      // 4. Marcar como leído para el emisor
      await tx.participantesChat.update({
        where: {
          chatId_userId: {
            chatId: dto.chatId,
            userId: user.sub,
          },
        },
        data: { ultimoLeido: new Date() },
      });

      // 5. Retornar mensaje completo
      const result = await tx.mensaje.findUnique({
        where: { id: mensaje.id },
        include: {
          emisor: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          adjuntos: true,
        },
      });
      // Convertir BigInt a Number para serialización JSON
      if (result?.adjuntos) {
        (result as any).adjuntos = result.adjuntos.map((a: any) => ({
          ...a,
          tamanio: a.tamanio ? Number(a.tamanio) : 0,
        }));
      }
      return result;
    }).then((result) => {
      // Enviar notificaciones por correo (fire-and-forget)
      this.notifyOtherParticipants(dto.chatId, user.sub, dto.contenido).catch(() => {});
      return result;
    });
  }

  /**
   * Lista mensajes de un chat con paginación
   * Marca como leídos automáticamente
   */
  async listMessages(chatId: string, user: UserJwt, page = 1, pageSize = 50) {
    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        },
      },
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize));
    const take = Math.min(100, Math.max(1, pageSize));

    const [total, mensajes] = await this.prisma.$transaction([
      this.prisma.mensaje.count({ where: { chatId } }),
      this.prisma.mensaje.findMany({
        where: { chatId },
        include: {
          emisor: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          adjuntos: true,
        },
        orderBy: { creado: 'desc' },
        skip,
        take,
      }),
    ]);

    // Marcar como leído (asíncrono, no esperar)
    this.prisma.participantesChat
      .update({
        where: {
          chatId_userId: {
            chatId,
            userId: user.sub,
          },
        },
        data: { ultimoLeido: new Date() },
      })
      .catch(() => {
        // Ignorar errores silenciosamente
      });

    return {
      page,
      pageSize,
      total,
      items: mensajes.map((m: any) => ({
        ...m,
        adjuntos:
          m.adjuntos?.map((a: any) => ({
            ...a,
            tamanio: a.tamanio ? Number(a.tamanio) : 0,
          })) || [],
      })),
    };
  }

  /**
   * Marca todos los mensajes de un chat como leídos
   */
  async markAsRead(chatId: string, user: UserJwt) {
    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        },
      },
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    await this.prisma.participantesChat.update({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        },
      },
      data: { ultimoLeido: new Date() },
    });

    return { message: 'Mensajes marcados como leídos' };
  }

  /**
   * Obtiene contador de mensajes no leídos totales
   */
  async getUnreadCount(user: UserJwt) {
    const participaciones = await this.prisma.participantesChat.findMany({
      where: { userId: user.sub },
      select: {
        chatId: true,
        ultimoLeido: true,
      },
    });

    let totalUnread = 0;

    for (const p of participaciones) {
      const count = await this.prisma.mensaje.count({
        where: {
          chatId: p.chatId,
          creado: {
            gt: p.ultimoLeido || new Date(0),
          },
          emisorId: {
            not: user.sub,
          },
        },
      });
      totalUnread += count;
    }

    return { unreadCount: totalUnread };
  }

  /**
   * Crea un mensaje con archivo adjunto
   * 1. Sube archivo a Nextcloud
   * 2. Crea mensaje + adjunto en una transacción
   */
  async createMessageWithFile(
    chatId: string,
    file: Express.Multer.File,
    user: UserJwt,
    contenido?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: { chatId, userId: user.sub },
      },
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    // Subir archivo a Nextcloud
    const uploadResult = await this.storageService.uploadChatFile(
      file.buffer,
      file.originalname,
      chatId,
      user.sub,
    );

    // Crear mensaje + adjunto en transacción
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear mensaje
      const mensaje = await tx.mensaje.create({
        data: {
          chatId,
          emisorId: user.sub,
          contenido: contenido || `📎 ${file.originalname}`,
          tipoMensaje: 'ARCHIVO',
        },
      });

      // 2. Crear adjunto
      await tx.adjuntos.create({
        data: {
          mensajeId: mensaje.id,
          direccionArchivo: uploadResult.url,
          tipoArchivo: uploadResult.tipoArchivo,
          tamanio: file.size,
          nombreArchivo: file.originalname,
          previewUrl: uploadResult.previewUrl,
        } as any,
      });

      // 3. Actualizar timestamp del chat
      await tx.chat.update({
        where: { id: chatId },
        data: { actualizado: new Date() },
      });

      // 4. Marcar como leído para el emisor
      await tx.participantesChat.update({
        where: {
          chatId_userId: { chatId, userId: user.sub },
        },
        data: { ultimoLeido: new Date() },
      });

      // 5. Retornar mensaje completo
      const result = await tx.mensaje.findUnique({
        where: { id: mensaje.id },
        include: {
          emisor: {
            select: { id: true, nombre: true, email: true },
          },
          adjuntos: true,
        },
      });
      if (result?.adjuntos) {
        (result as any).adjuntos = result.adjuntos.map((a: any) => ({
          ...a,
          tamanio: a.tamanio ? Number(a.tamanio) : 0,
        }));
      }
      return result;
    }).then((result) => {
      // Enviar notificaciones por correo (fire-and-forget)
      const msgContent = contenido || `📎 ${file.originalname}`;
      this.notifyOtherParticipants(chatId, user.sub, msgContent).catch(() => {});
      return result;
    });
  }

  /**
   * Crea notificaciones en BD, emite por SSE y envía emails
   * a todos los participantes del chat excepto el emisor.
   * También incluye al supervisorResponsable y al responsableSeguimiento
   * de la cotización vinculada al chat si aún no son participantes,
   * y los agrega automáticamente al chat.
   */
  private async notifyOtherParticipants(
    chatId: string,
    senderId: string,
    messageContent: string,
  ): Promise<void> {
    const frontendUrl = 'http://89.167.20.163:8080';
    const SUPERVISOR_EMAIL = 'lmartinez@energiapd.com';

    // Obtener todos los participantes actuales con sus datos de usuario
    const participantes = await this.prisma.participantesChat.findMany({
      where: { chatId },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, activo: true },
        },
      },
    });

    const participantesIds = new Set(participantes.map((p) => p.usuario.id));

    // Buscar cotización vinculada a este chat para obtener responsables y contexto
    const cotizacion = await this.prisma.cotizacion.findFirst({
      where: { chatId },
      select: {
        id: true,
        nombreCotizacion: true,
        solicitante: {
          select: { id: true, nombre: true, email: true, activo: true },
        },
        supervisorResponsable: {
          select: { id: true, nombre: true, email: true, activo: true },
        },
        estadosProductos: {
          select: {
            responsableSeguimiento: {
              select: { id: true, nombre: true, email: true, activo: true },
            },
          },
        },
      },
    });

    // Recopilar responsables que no son participantes del chat todavía
    type UsuarioBasico = { id: string; nombre: string; email: string; activo: boolean };
    const responsablesExternos: UsuarioBasico[] = [];
    const responsablesVistos = new Set<string>();

    const agregarSiExterno = (u: UsuarioBasico | null | undefined) => {
      if (u && !participantesIds.has(u.id) && !responsablesVistos.has(u.id)) {
        responsablesVistos.add(u.id);
        responsablesExternos.push(u);
      }
    };

    agregarSiExterno(cotizacion?.supervisorResponsable as UsuarioBasico | undefined);
    for (const ep of cotizacion?.estadosProductos ?? []) {
      agregarSiExterno(ep.responsableSeguimiento as UsuarioBasico | undefined);
    }

    // Agregar responsables externos como participantes del chat
    if (responsablesExternos.length > 0) {
      await this.prisma.participantesChat.createMany({
        data: responsablesExternos.map((r) => ({
          chatId,
          userId: r.id,
          ultimoLeido: new Date(0),
        })),
        skipDuplicates: true,
      });
    }

    // Obtener datos del emisor (nombre + email para determinar rol)
    const emisor = await this.prisma.usuario.findUnique({
      where: { id: senderId },
      select: { nombre: true, email: true },
    });

    const senderName = emisor?.nombre || 'Un usuario';
    const senderEmail = emisor?.email || '';
    const chatUrl = `${frontendUrl}/messages/${chatId}`;
    const preview =
      messageContent.length > 100
        ? messageContent.substring(0, 100) + '...'
        : messageContent;

    // Título enriquecido con nombre de la cotización si existe
    const titulo = cotizacion?.nombreCotizacion
      ? `Nuevo mensaje en "${cotizacion.nombreCotizacion}"`
      : `Nuevo mensaje de ${senderName}`;

    const descripcion = cotizacion?.nombreCotizacion
      ? `${senderName}: ${preview}`
      : preview;

    // Destinatarios de notificaciones (BD + SSE) = todos los participantes excepto el emisor
    const destinatariosNotif: UsuarioBasico[] = [
      ...participantes
        .filter((p) => p.usuario.id !== senderId && p.usuario.activo)
        .map((p) => p.usuario),
      ...responsablesExternos.filter((r) => r.activo),
    ];

    // Destinatario de EMAIL:
    // - Si manda el supervisor (lmartinez) → email solo al solicitante
    // - Si manda el solicitante u otro → email solo a lmartinez@energiapd.com
    let emailDestinatario: UsuarioBasico | null = null;

    if (senderEmail === SUPERVISOR_EMAIL) {
      // El supervisor manda → notificar al solicitante
      const solicitante = cotizacion?.solicitante as UsuarioBasico | undefined;
      if (solicitante?.activo && solicitante.email) {
        emailDestinatario = solicitante;
      }
    } else {
      // El solicitante (u otro) manda → notificar a lmartinez
      const supervisora = await this.prisma.usuario.findFirst({
        where: { email: SUPERVISOR_EMAIL, activo: true },
        select: { id: true, nombre: true, email: true, activo: true },
      });
      if (supervisora) {
        emailDestinatario = supervisora as UsuarioBasico;
      }
    }

    await Promise.allSettled(
      destinatariosNotif.map(async (usuario) => {
        const notifData = {
          tipo: 'COMENTARIO_NUEVO',
          titulo,
          descripcion,
        };

        // 1. Crear notificación en BD
        const notif = await this.notificacionService.create({
          userId: usuario.id,
          ...notifData,
        } as any);

        // 2. Emitir por SSE — incluir chatId y cotizacionId para navegación en el frontend
        this.notificacionService.emitToUser(usuario.id, {
          ...notif,
          chatId,
          cotizacionId: cotizacion?.id ?? null,
        });
      }),
    );

    // 3. Email — solo al destinatario determinado arriba
    if (emailDestinatario) {
      this.mailService.sendNewMessageNotification(
        emailDestinatario.email,
        emailDestinatario.nombre,
        senderName,
        messageContent,
        chatUrl,
        cotizacion?.nombreCotizacion ?? undefined,
        cotizacion?.id ?? undefined,
      ).catch(() => {});
    }
  }
}
