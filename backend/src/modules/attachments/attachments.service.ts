import { 
  Injectable, 
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type UserJwt = { sub: string; role?: string };

/**
 * Service para gestión de adjuntos/archivos
 * Basado en: Adjuntos (tabla simplificada para mensajes)
 */
@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un registro de adjunto en la base de datos
   * El archivo físico ya fue guardado por Multer
   * 
   * @param data Información del archivo subido
   * @param userId ID del usuario que sube el archivo
   */
  async create(
    data: {
      direccionArchivo: string; // URL/path del archivo
      tipoArchivo: string;      // MIME type
      tamanio: number;          // Tamaño en bytes
      mensajeId?: string;       // Opcional: asociar directamente a mensaje
    },
    userId: string
  ) {
    // Si se proporciona mensajeId, validar que existe
    if (data.mensajeId) {
      const mensaje = await this.prisma.mensaje.findUnique({
        where: { id: data.mensajeId },
        select: { id: true, emisorId: true }
      });

      if (!mensaje) {
        throw new NotFoundException('Mensaje no encontrado');
      }

      // Solo el emisor del mensaje puede adjuntar archivos
      if (mensaje.emisorId !== userId) {
        throw new BadRequestException('Solo puedes adjuntar archivos a tus propios mensajes');
      }
    }

    return this.prisma.adjuntos.create({
      data: {
        direccionArchivo: data.direccionArchivo,
        tipoArchivo: data.tipoArchivo,
        tamanio: BigInt(data.tamanio),
        mensajeId: data.mensajeId || "",
      }
    });
  }

  /**
   * Lista adjuntos de un mensaje específico
   */
  async listByMessage(mensajeId: string) {
    const mensaje = await this.prisma.mensaje.findUnique({
      where: { id: mensajeId },
      select: { id: true }
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return this.prisma.adjuntos.findMany({
      where: { mensajeId },
      orderBy: { creado: 'desc' }
    });
  }

  /**
   * Obtiene un adjunto específico
   */
  async getById(id: string) {
    const adjunto = await this.prisma.adjuntos.findUnique({
      where: { id },
      include: {
        mensaje: {
          select: {
            id: true,
            emisorId: true,
            chatId: true,
          }
        }
      }
    });

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    return adjunto;
  }

  /**
   * Elimina un adjunto
   * Solo el dueño del mensaje puede eliminarlo
   * TODO: También eliminar archivo físico del storage
   */
  async delete(id: string, userId: string) {
    const adjunto = await this.prisma.adjuntos.findUnique({
      where: { id },
      include: {
        mensaje: {
          select: {
            emisorId: true,
          }
        }
      }
    });

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    // Solo el emisor del mensaje puede eliminar adjuntos
    if (adjunto.mensaje && adjunto.mensaje.emisorId !== userId) {
      throw new BadRequestException('Solo puedes eliminar tus propios adjuntos');
    }

    await this.prisma.adjuntos.delete({
      where: { id }
    });

    // TODO: Eliminar archivo físico del storage
    // await storageService.delete(adjunto.direccionArchivo);

    return {
      message: 'Adjunto eliminado exitosamente',
      id,
    };
  }

  /**
   * Lista adjuntos temporales (sin mensaje asignado)
   * Útil para limpiar archivos huérfanos
   */
  async listOrphaned() {
    return this.prisma.adjuntos.findMany({
      where: {
        mensajeId: "",
        creado: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Más de 24 horas
        }
      }
    });
  }

  /**
   * Limpia adjuntos huérfanos (sin mensaje después de 24 horas)
   * Útil para cron job
   */
  async cleanOrphaned() {
    const orphaned = await this.listOrphaned();

    if (orphaned.length === 0) {
      return { deleted: 0 };
    }

    // TODO: Eliminar archivos físicos
    // await Promise.all(orphaned.map(a => storageService.delete(a.direccionArchivo)));

    const result = await this.prisma.adjuntos.deleteMany({
      where: {
        id: { in: orphaned.map(a => a.id) }
      }
    });

    return {
      deleted: result.count,
      files: orphaned.map(a => a.direccionArchivo),
    };
  }
}