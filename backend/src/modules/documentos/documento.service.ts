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
   * Obtener documentos adjuntos de un producto, agrupados por estado,
   * cruzados con los requeridos para saber qué falta
   */
  async getDocumentosProducto(estadoProductoId: string) {
    // 1. Obtener el estado producto para saber el tipo de compra
    const estadoProducto = await this.prisma.estadoProducto.findUnique({
      where: { id: estadoProductoId },
      include: {
        cotizacion: { select: { tipoCompra: true } },
      },
    });

    if (!estadoProducto) {
      throw new NotFoundException('Estado de producto no encontrado');
    }

    // 2. Obtener todos los requeridos activos
    const requeridos = await this.prisma.documentoRequerido.findMany({
      where: { activo: true },
      orderBy: [{ estado: 'asc' }, { orden: 'asc' }],
    });

    // 3. Obtener todos los adjuntos de este producto
    const adjuntos = await this.prisma.documentoAdjunto.findMany({
      where: { estadoProductoId },
      include: {
        subidoPor: { select: { id: true, nombre: true, email: true } },
        documentoRequerido: { select: { id: true, nombre: true } },
      },
      orderBy: { creado: 'asc' },
    });

    // 4. Construir la vista cruzada por estado
    const resultado: Record<
      string,
      {
        estado: string;
        noAplica: boolean;
        requeridos: {
          id: string;
          nombre: string;
          descripcion?: string;
          obligatorio: boolean;
          adjuntos: typeof adjuntos;
        }[];
        extras: typeof adjuntos; // Documentos subidos sin requerimiento asociado
      }
    > = {};

    // Agrupar requeridos por estado
    for (const req of requeridos) {
      if (!resultado[req.estado]) {
        // Determinar si está marcado "no aplica"
        const noAplicaField = `noAplicaDocumentos${req.estado.charAt(0).toUpperCase() + req.estado.slice(1)}`;
        resultado[req.estado] = {
          estado: req.estado,
          noAplica: (estadoProducto as any)[noAplicaField] || false,
          requeridos: [],
          extras: [],
        };
      }

      // Adjuntos que cumplen este requerimiento
      const adjuntosDelReq = adjuntos.filter(
        (a) => a.documentoRequeridoId === req.id,
      );

      resultado[req.estado].requeridos.push({
        id: req.id,
        nombre: req.nombre,
        descripcion: req.descripcion || undefined,
        obligatorio: req.obligatorio,
        adjuntos: adjuntosDelReq,
      });
    }

    // Agregar adjuntos "extras" (sin requerimiento asociado)
    for (const adj of adjuntos) {
      if (!adj.documentoRequeridoId) {
        if (!resultado[adj.estado]) {
          const noAplicaField = `noAplicaDocumentos${adj.estado.charAt(0).toUpperCase() + adj.estado.slice(1)}`;
          resultado[adj.estado] = {
            estado: adj.estado,
            noAplica: (estadoProducto as any)[noAplicaField] || false,
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
}
