// documento.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentoService } from './documento.service';
import {
  CreateDocumentoRequeridoDto,
  UpdateDocumentoRequeridoDto,
} from './dto/documento-requerido.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Documentos')
@Controller('api/v1/documentos')
@UseGuards(AuthGuard('jwt'))
export class DocumentoController {
  constructor(
    private readonly service: DocumentoService,
    private readonly prisma: PrismaService,
  ) {}

  // =============================================
  // Verificar ADMIN/SUPERVISOR
  // =============================================
  private async verificarPermisos(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    });
    const rol = usuario?.rol.nombre.toLowerCase() || '';
    if (!rol.includes('admin') && !rol.includes('supervisor')) {
      throw new ForbiddenException(
        'Solo ADMIN y SUPERVISOR pueden realizar esta acción',
      );
    }
  }

  // =============================================
  // DOCUMENTOS REQUERIDOS (Config global)
  // =============================================

  @Get('requeridos')
  @ApiOperation({
    summary: 'Obtener documentos requeridos agrupados por estado',
  })
  async getRequeridos() {
    return this.service.getDocumentosRequeridos();
  }

  @Get('requeridos/:estado')
  @ApiOperation({ summary: 'Obtener documentos requeridos para un estado' })
  async getRequeridosPorEstado(@Param('estado') estado: string) {
    return this.service.getDocumentosRequeridosPorEstado(estado);
  }

  @Post('requeridos')
  @ApiOperation({ summary: 'Crear documento requerido (ADMIN/SUPERVISOR)' })
  async createRequerido(
    @Body() dto: CreateDocumentoRequeridoDto,
    @Req() req: any,
  ) {
    await this.verificarPermisos(req.user.sub);
    return this.service.createDocumentoRequerido(dto);
  }

  @Patch('requeridos/:id')
  @ApiOperation({ summary: 'Actualizar documento requerido' })
  async updateRequerido(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentoRequeridoDto,
    @Req() req: any,
  ) {
    await this.verificarPermisos(req.user.sub);
    return this.service.updateDocumentoRequerido(id, dto);
  }

  @Delete('requeridos/:id')
  @ApiOperation({ summary: 'Desactivar documento requerido' })
  async deleteRequerido(@Param('id') id: string, @Req() req: any) {
    await this.verificarPermisos(req.user.sub);
    return this.service.deleteDocumentoRequerido(id);
  }

  // =============================================
  // DOCUMENTOS ADJUNTOS (Por producto)
  // =============================================

  @Get('producto/:estadoProductoId')
  @ApiOperation({
    summary: 'Obtener documentos de un producto (requeridos + adjuntos)',
  })
  async getDocumentosProducto(
    @Param('estadoProductoId') estadoProductoId: string,
  ) {
    return this.service.getDocumentosProducto(estadoProductoId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir documento adjunto para un producto/estado' })
  async uploadDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      estadoProductoId: string;
      documentoRequeridoId?: string;
      estado: string;
      nombreDocumento: string;
    },
    @Req() req: any,
  ) {
    if (!file) throw new ForbiddenException('No se proporcionó archivo');

    return this.service.uploadDocumento(
      file.buffer,
      file.originalname,
      body,
      req.user.sub,
    );
  }

  @Delete('adjunto/:id')
  @ApiOperation({ summary: 'Eliminar documento adjunto' })
  async deleteDocumento(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteDocumento(id, req.user.sub);
  }

  /*  @Patch('no-aplica')
  @ApiOperation({ summary: 'Toggle "No aplica" documentos para un estado' })
  async toggleNoAplica(
    @Body()
    body: { estadoProductoId: string; estado: string; noAplica: boolean },
    @Req() req: any,
  ) {
    return this.service.toggleNoAplicaDocumentos(
      body.estadoProductoId,
      body.estado,
      body.noAplica,
    );
  } */

  /**
   * PATCH /documentos/no-aplica-documento
   * Marcar un requerimiento específico como "no aplica"
   */
  @Patch('no-aplica-documento')
  @ApiOperation({ summary: 'Marcar documento requerido como "No aplica"' })
  async toggleNoAplicaDocumento(
    @Body()
    body: {
      estadoProductoId: string;
      documentoRequeridoId: string;
      estado: string;
      noAplica: boolean;
    },
    @Req() req: any,
  ) {
    return this.service.marcarDocumentoNoAplica(
      body.estadoProductoId,
      body.documentoRequeridoId,
      body.estado,
      body.noAplica,
      req.user.sub,
    );
  }

  /**
   * PATCH /documentos/justificacion
   * Guardar justificación de "no aplica" para un estado
   */
  @Patch('justificacion')
  @ApiOperation({
    summary: 'Guardar justificación de "no aplica" para un estado',
  })
  async guardarJustificacion(
    @Body()
    body: {
      estadoProductoId: string;
      estado: string;
      justificacion: string;
    },
    @Req() req: any,
  ) {
    if (!body.justificacion?.trim()) {
      throw new BadRequestException('La justificación es requerida');
    }
    return this.service.guardarJustificacion(
      body.estadoProductoId,
      body.estado,
      body.justificacion,
      req.user.sub,
    );
  }

  /**
   * GET /documentos/verificar/:estadoProductoId/:estado
   * Verificar si documentos están completos para avanzar
   */
  @Get('verificar/:estadoProductoId/:estado')
  @ApiOperation({
    summary: 'Verificar si documentos están completos para un estado',
  })
  async verificarDocumentos(
    @Param('estadoProductoId') estadoProductoId: string,
    @Param('estado') estado: string,
  ) {
    return this.service.verificarDocumentosCompletos(estadoProductoId, estado);
  }
}
