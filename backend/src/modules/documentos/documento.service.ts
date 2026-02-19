// documento.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import {
  CreateDocumentoRequeridoDto,
  UpdateDocumentoRequeridoDto,
} from './dto/documento-requerido.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ===========================================================
  // DOCUMENTOS REQUERIDOS (Configuración global)
  // ===========================================================

  /**
   * Obtener todos los documentos requeridos, agrupados por estado
   */
  async getDocumentosRequeridos() {
    const docs = await this.prisma.documentoRequerido.findMany({
      where: { activo: true },
      orderBy: [{ estado: 'asc' }, { orden: 'asc' }],
    });

    // Agrupar por estado
    const agrupados: Record<string, typeof docs> = {};
    for (const doc of docs) {
      if (!agrupados[doc.estado]) agrupados[doc.estado] = [];
      agrupados[doc.estado].push(doc);
    }

    return agrupados;
  }

  /**
   * Obtener documentos requeridos para un estado específico
   */
  async getDocumentosRequeridosPorEstado(estado: string) {
    return this.prisma.documentoRequerido.findMany({
      where: { estado, activo: true },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Crear un nuevo documento requerido (ADMIN/SUPERVISOR)
   */
  async createDocumentoRequerido(dto: CreateDocumentoRequeridoDto) {
    return this.prisma.documentoRequerido.create({
      data: {
        estado: dto.estado,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        obligatorio: dto.obligatorio ?? true,
        orden: dto.orden ?? 0,
      },
    });
  }

  /**
   * Actualizar documento requerido
   */
  async updateDocumentoRequerido(id: string, dto: UpdateDocumentoRequeridoDto) {
    const doc = await this.prisma.documentoRequerido.findUnique({
      where: { id },
    });
    if (!doc) throw new NotFoundException('Documento requerido no encontrado');

    return this.prisma.documentoRequerido.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Desactivar documento requerido (soft delete)
   */
  async deleteDocumentoRequerido(id: string) {
    return this.prisma.documentoRequerido.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ===========================================================
  // DOCUMENTOS ADJUNTOS (Archivos subidos por producto)
  // ===========================================================

  /**
   * Obtener documentos de un producto, agrupados por estado,
   * cruzados con requeridos + justificaciones de "no aplica"
   */
  async getDocumentosProducto(estadoProductoId: string) {
    // 1. Obtener el estado producto
    const estadoProducto = await this.prisma.estadoProducto.findUnique({
      where: { id: estadoProductoId },
      include: {
        cotizacion: { select: { tipoCompra: true } },
      },
    });

    if (!estadoProducto) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    const tipoCompra = estadoProducto.cotizacion?.tipoCompra || 'INTERNACIONAL';

    // 2. Determinar estados aplicables según tipo de compra
    const estadosAplicables =
      tipoCompra === 'NACIONAL'
        ? [
            'cotizado',
            'conDescuento',
            'aprobacionCompra',
            'comprado',
            'pagado',
            'recibido',
          ]
        : [
            'cotizado',
            'conDescuento',
            'aprobacionCompra',
            'comprado',
            'pagado',
            'aprobacionPlanos',
            'primerSeguimiento',
            'enFOB',
            'cotizacionFleteInternacional',
            'conBL',
            'segundoSeguimiento',
            'enCIF',
            'recibido',
          ];

    // 3. Obtener todos los requeridos activos
    const requeridos = await this.prisma.documentoRequerido.findMany({
      where: {
        activo: true,
        estado: { in: estadosAplicables },
      },
      orderBy: [{ estado: 'asc' }, { orden: 'asc' }],
    });

    // 4. Obtener todos los adjuntos de este producto
    const adjuntos = await this.prisma.documentoAdjunto.findMany({
      where: { estadoProductoId },
      include: {
        subidoPor: { select: { id: true, nombre: true, email: true } },
        documentoRequerido: { select: { id: true, nombre: true } },
      },
      orderBy: { creado: 'asc' },
    });

    // 5. Obtener justificaciones de "no aplica"
    const justificaciones = await this.prisma.justificacionNoAplica.findMany({
      where: { estadoProductoId },
      include: {
        creadoPor: { select: { id: true, nombre: true } },
      },
    });

    const justificacionMap: Record<string, any> = {};
    for (const j of justificaciones) {
      justificacionMap[j.estado] = j;
    }

    // 6. Construir vista por estado (solo estados que tienen requeridos)
    const resultado: Record<
      string,
      {
        estado: string;
        estadoCompletado: boolean;
        justificacionNoAplica: {
          id: string;
          justificacion: string;
          creadoPor: any;
        } | null;
        requeridos: {
          id: string;
          nombre: string;
          descripcion?: string;
          obligatorio: boolean;
          noAplica: boolean;
          adjuntos: typeof adjuntos;
        }[];
        extras: typeof adjuntos;
      }
    > = {};

    for (const req of requeridos) {
      if (!resultado[req.estado]) {
        // Determinar si este estado ya fue completado
        const estadoCompletado = (estadoProducto as any)[req.estado] === true;

        resultado[req.estado] = {
          estado: req.estado,
          estadoCompletado,
          justificacionNoAplica: justificacionMap[req.estado] || null,
          requeridos: [],
          extras: [],
        };
      }

      // Adjuntos de este requerimiento
      const adjuntosDelReq = adjuntos.filter(
        (a) => a.documentoRequeridoId === req.id,
      );

      // Verificar si hay un registro "noAplica" para este requerimiento
      const tieneNoAplica = adjuntos.some(
        (a) => a.documentoRequeridoId === req.id && a.noAplica,
      );

      resultado[req.estado].requeridos.push({
        id: req.id,
        nombre: req.nombre,
        descripcion: req.descripcion || undefined,
        obligatorio: req.obligatorio,
        noAplica: tieneNoAplica,
        adjuntos: adjuntosDelReq.filter((a) => !a.noAplica),
      });
    }

    // Extras sin requerimiento
    for (const adj of adjuntos) {
      if (!adj.documentoRequeridoId && !adj.noAplica) {
        if (!resultado[adj.estado]) {
          const estadoCompletado = (estadoProducto as any)[adj.estado] === true;
          resultado[adj.estado] = {
            estado: adj.estado,
            estadoCompletado,
            justificacionNoAplica: justificacionMap[adj.estado] || null,
            requeridos: [],
            extras: [],
          };
        }
        resultado[adj.estado].extras.push(adj);
      }
    }

    return resultado;
  }

  /**
   * Marcar un requerimiento específico como "No aplica" para un producto
   */
  async marcarDocumentoNoAplica(
    estadoProductoId: string,
    documentoRequeridoId: string,
    estado: string,
    noAplica: boolean,
    userId: string,
  ) {
    if (noAplica) {
      // Crear registro de "no aplica" en documento_adjunto
      // Verificar si ya existe
      const existente = await this.prisma.documentoAdjunto.findFirst({
        where: {
          estadoProductoId,
          documentoRequeridoId,
          noAplica: true,
        },
      });

      if (!existente) {
        await this.prisma.documentoAdjunto.create({
          data: {
            estadoProductoId,
            documentoRequeridoId,
            estado,
            nombreDocumento: 'No aplica',
            nombreArchivo: 'NO_APLICA',
            urlArchivo: 'NO_APLICA',
            noAplica: true,
            subidoPorId: userId,
          },
        });
      }
    } else {
      // Quitar el "no aplica"
      await this.prisma.documentoAdjunto.deleteMany({
        where: {
          estadoProductoId,
          documentoRequeridoId,
          noAplica: true,
        },
      });
    }

    return {
      message: noAplica ? 'Marcado como "No aplica"' : '"No aplica" removido',
    };
  }

  /**
   * Guardar o actualizar justificación de "no aplica" para un estado
   */
  async guardarJustificacion(
    estadoProductoId: string,
    estado: string,
    justificacion: string,
    userId: string,
  ) {
    const resultado = await this.prisma.justificacionNoAplica.upsert({
      where: {
        estadoProductoId_estado: {
          estadoProductoId,
          estado,
        },
      },
      create: {
        estadoProductoId,
        estado,
        justificacion,
        creadoPorId: userId,
      },
      update: {
        justificacion,
        creadoPorId: userId,
      },
    });

    return resultado;
  }

  /**
   * Subir un documento adjunto
   */
  async uploadDocumento(
    file: Buffer,
    originalName: string,
    dto: {
      estadoProductoId: string;
      documentoRequeridoId?: string;
      estado: string;
      nombreDocumento: string;
    },
    userId: string,
  ) {
    // Verificar que existe el estado producto
    const ep = await this.prisma.estadoProducto.findUnique({
      where: { id: dto.estadoProductoId },
      include: { cotizacion: { select: { id: true } } },
    });

    if (!ep) throw new NotFoundException('Estado de producto no encontrado');

    // Subir archivo a Nextcloud
    const uploadResult = await this.storage.uploadFile(
      file,
      originalName,
      ep.cotizacion?.id || 'sin-cotizacion',
      ep.sku,
      'documentos',
      'otros',
    );

    // Obtener extensión y tamaño
    const ext = originalName.split('.').pop()?.toLowerCase() || 'pdf';

    // Crear registro en BD
    const documento = await this.prisma.documentoAdjunto.create({
      data: {
        estadoProductoId: dto.estadoProductoId,
        documentoRequeridoId: dto.documentoRequeridoId || null,
        estado: dto.estado,
        nombreDocumento: dto.nombreDocumento,
        nombreArchivo: uploadResult.fileName,
        urlArchivo: uploadResult.url || uploadResult.path,
        tipoArchivo: ext,
        tamanoBytes: BigInt(file.length),
        subidoPorId: userId,
      },
      include: {
        subidoPor: { select: { id: true, nombre: true } },
      },
    });

    return documento;
  }

  /**
   * Eliminar un documento adjunto
   */
  async deleteDocumento(id: string, userId: string) {
    const doc = await this.prisma.documentoAdjunto.findUnique({
      where: { id },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    // Eliminar de storage (opcional, mejor conservar)
    // await this.storage.deleteFile(doc.urlArchivo);

    await this.prisma.documentoAdjunto.delete({ where: { id } });

    return { message: 'Documento eliminado correctamente' };
  }

  /**
   * Marcar/desmarcar "No aplica" documentos para un estado de un producto
   */
  async toggleNoAplicaDocumentos(
    estadoProductoId: string,
    estado: string,
    noAplica: boolean,
  ) {
    const noAplicaField = `noAplicaDocumentos${estado.charAt(0).toUpperCase() + estado.slice(1)}`;

    await this.prisma.estadoProducto.update({
      where: { id: estadoProductoId },
      data: { [noAplicaField]: noAplica },
    });

    return {
      message: `"No aplica" ${noAplica ? 'activado' : 'desactivado'} para ${estado}`,
    };
  }
  /**
   * Verifica si todos los documentos requeridos de un estado están cumplidos
   * Retorna { completo: boolean, faltantes: string[] }
   */
  async verificarDocumentosCompletos(
    estadoProductoId: string,
    estado: string,
  ): Promise<{ completo: boolean; faltantes: string[] }> {
    // Obtener requeridos obligatorios del estado
    const requeridos = await this.prisma.documentoRequerido.findMany({
      where: { estado, activo: true, obligatorio: true },
    });

    if (requeridos.length === 0) {
      return { completo: true, faltantes: [] };
    }

    // Obtener adjuntos del producto para este estado
    const adjuntos = await this.prisma.documentoAdjunto.findMany({
      where: { estadoProductoId, estado },
    });

    const faltantes: string[] = [];

    for (const req of requeridos) {
      // Verificar si tiene archivo O está marcado como "no aplica"
      const tieneArchivo = adjuntos.some(
        (a) => a.documentoRequeridoId === req.id && !a.noAplica,
      );
      const tieneNoAplica = adjuntos.some(
        (a) => a.documentoRequeridoId === req.id && a.noAplica,
      );

      if (!tieneArchivo && !tieneNoAplica) {
        faltantes.push(req.nombre);
      }
    }

    // Si hay documentos marcados como "no aplica", verificar que exista justificación
    const hayNoAplica = adjuntos.some((a) => a.noAplica);
    if (hayNoAplica) {
      const justificacion = await this.prisma.justificacionNoAplica.findUnique({
        where: {
          estadoProductoId_estado: { estadoProductoId, estado },
        },
      });
      if (!justificacion || !justificacion.justificacion.trim()) {
        faltantes.push(
          '⚠️ Justificación requerida para documentos "No aplica"',
        );
      }
    }

    return {
      completo: faltantes.length === 0,
      faltantes,
    };
  }
}
