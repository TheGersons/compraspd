import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatDto, AddParticipantsDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';


type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de chats y mensajes
 * Basado en: Chat, ParticipantesChat, Mensaje, Adjuntos
 */
@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

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
      select: { id: true, nombre: true }
    });

    if (usuarios.length !== dto.participantesIds.length) {
      throw new NotFoundException('Uno o más usuarios no encontrados o inactivos');
    }

    // Crear chat con participantes (incluyendo al creador)
    const allParticipants = [...new Set([user.sub, ...dto.participantesIds])];

    return this.prisma.chat.create({
      data: {
        participantes: {
          create: allParticipants.map(userId => ({
            userId,
            ultimoLeido: new Date(), // El creador marca como leído desde inicio
          }))
        }
      },
      include: {
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              }
            }
          }
        }
      }
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
                  }
                }
              }
            },
            mensajes: {
              take: 1,
              orderBy: { creado: 'desc' },
              include: {
                emisor: {
                  select: {
                    id: true,
                    nombre: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          actualizado: 'desc'
        }
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
            }
          }
        });

        return {
          chatId: p.chatId,
          ultimoLeido: p.ultimoLeido,
          unreadCount,
          chat: p.chat,
          lastMessage: p.chat.mensajes[0] || null,
        };
      })
    );

    const total = await this.prisma.participantesChat.count({
      where: { userId: user.sub }
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
        }
      }
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
              }
            }
          }
        }
      }
    });
  }

  /**
   * Agrega participantes a un chat existente
   * Solo participantes actuales pueden agregar nuevos
   */
  async addParticipants(chatId: string, dto: AddParticipantsDto, user: UserJwt) {
    // Verificar que el usuario es participante actual
    const isParticipant = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        }
      }
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
      select: { id: true }
    });

    if (usuarios.length !== dto.participantesIds.length) {
      throw new NotFoundException('Uno o más usuarios no encontrados');
    }

    // Agregar participantes (ignorar duplicados)
    await this.prisma.participantesChat.createMany({
      data: dto.participantesIds.map(userId => ({
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
        }
      }
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    // Validar adjuntos si se proporcionan
    if (dto.adjuntosIds && dto.adjuntosIds.length > 0) {
      const adjuntos = await this.prisma.adjuntos.findMany({
        where: {
          id: { in: dto.adjuntosIds },
          mensajeId: "", // Solo adjuntos sin asignar
        }
      });

      if (adjuntos.length !== dto.adjuntosIds.length) {
        throw new BadRequestException('Uno o más adjuntos no encontrados o ya están asignados');
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
        }
      });

      // 2. Asociar adjuntos si existen
      if (dto.adjuntosIds && dto.adjuntosIds.length > 0) {
        await tx.adjuntos.updateMany({
          where: {
            id: { in: dto.adjuntosIds }
          },
          data: {
            mensajeId: mensaje.id,
          }
        });
      }

      // 3. Actualizar timestamp del chat
      await tx.chat.update({
        where: { id: dto.chatId },
        data: { actualizado: new Date() }
      });

      // 4. Marcar como leído para el emisor
      await tx.participantesChat.update({
        where: {
          chatId_userId: {
            chatId: dto.chatId,
            userId: user.sub,
          }
        },
        data: { ultimoLeido: new Date() }
      });

      // 5. Retornar mensaje completo
      return tx.mensaje.findUnique({
        where: { id: mensaje.id },
        include: {
          emisor: {
            select: {
              id: true,
              nombre: true,
              email: true,
            }
          },
          adjuntos: true,
        }
      });
    });
  }

  /**
   * Lista mensajes de un chat con paginación
   * Marca como leídos automáticamente
   */
  async listMessages(
    chatId: string, 
    user: UserJwt,
    page = 1,
    pageSize = 50
  ) {
    // Verificar que el usuario es participante
    const participacion = await this.prisma.participantesChat.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        }
      }
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
            }
          },
          adjuntos: true,
        },
        orderBy: { creado: 'desc' },
        skip,
        take,
      })
    ]);

    // Marcar como leído (asíncrono, no esperar)
    this.prisma.participantesChat.update({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        }
      },
      data: { ultimoLeido: new Date() }
    }).catch(() => {
      // Ignorar errores silenciosamente
    });

    return {
      page,
      pageSize,
      total,
      items: mensajes,
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
        }
      }
    });

    if (!participacion) {
      throw new ForbiddenException('No eres participante de este chat');
    }

    await this.prisma.participantesChat.update({
      where: {
        chatId_userId: {
          chatId,
          userId: user.sub,
        }
      },
      data: { ultimoLeido: new Date() }
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
      }
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
          }
        }
      });
      totalUnread += count;
    }

    return { unreadCount: totalUnread };
  }
}