import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  UploadedFile, 
  UseGuards, 
  UseInterceptors,
  ParseUUIDPipe,
  Body,
  BadRequestException
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

type UserJwt = { sub: string; role?: string };

/**
 * Controller para gestión de adjuntos/archivos
 * 
 * Endpoints:
 * - POST /attachments/upload - Subir archivo
 * - GET /attachments/message/:mensajeId - Listar adjuntos de un mensaje
 * - GET /attachments/:id - Obtener adjunto específico
 * - DELETE /attachments/:id - Eliminar adjunto
 */
@ApiTags('Adjuntos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  /**
   * POST /api/v1/attachments/upload
   * Sube un archivo al servidor
   * 
   * El archivo puede:
   * 1. Asociarse directamente a un mensaje (mensajeId en body)
   * 2. Quedar temporal para asociarse después al crear mensaje
   * 
   * Archivos temporales (sin mensajeId) se limpian después de 24h
   */
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Asegúrate de que esta carpeta existe
        filename: (_req, file, cb) => {
          // Generar nombre único: uuid-timestamp.ext
          const uniqueName = `${uuid()}-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo
      },
      fileFilter: (_req, file, cb) => {
        // Opcional: Filtrar tipos de archivo permitidos
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de archivo no permitido'), false);
        }
      },
    }),
  )
  @Post('upload')
  async upload(
    @CurrentUser() user: UserJwt,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // URL del archivo (relativa o absoluta según tu configuración)
    const fileUrl = `/uploads/${file.filename}`;

    const adjunto = await this.service.create(
      {
        direccionArchivo: fileUrl,
        tipoArchivo: file.mimetype,
        tamanio: file.size,
        mensajeId: dto.mensajeId, // Puede ser undefined
      },
      user.sub
    );

    // Convertir BigInt a string para JSON
    return {
      id: adjunto.id,
      direccionArchivo: adjunto.direccionArchivo,
      tipoArchivo: adjunto.tipoArchivo,
      tamanio: adjunto.tamanio.toString(),
      mensajeId: adjunto.mensajeId,
      creado: adjunto.creado,
    };
  }

  /**
   * GET /api/v1/attachments/message/:mensajeId
   * Lista todos los adjuntos de un mensaje específico
   */
  @Get('message/:mensajeId')
  listByMessage(@Param('mensajeId', ParseUUIDPipe) mensajeId: string) {
    return this.service.listByMessage(mensajeId);
  }

  /**
   * GET /api/v1/attachments/:id
   * Obtiene información de un adjunto específico
   * Útil para descargas o previsualizaciones
   */
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getById(id);
  }

  /**
   * DELETE /api/v1/attachments/:id
   * Elimina un adjunto
   * Solo el dueño del mensaje puede eliminarlo
   */
  @Delete(':id')
  delete(
    @CurrentUser() user: UserJwt,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.service.delete(id, user.sub);
  }

  /**
   * GET /api/v1/attachments/orphaned/list
   * [ADMIN] Lista adjuntos huérfanos (sin mensaje > 24h)
   * Útil para debugging o limpieza manual
   */
  @Get('orphaned/list')
  listOrphaned() {
    // TODO: Agregar validación de rol admin
    return this.service.listOrphaned();
  }

  /**
   * POST /api/v1/attachments/orphaned/clean
   * [ADMIN/CRON] Limpia adjuntos huérfanos
   * Debería ejecutarse automáticamente con un cron job
   */
  @Post('orphaned/clean')
  cleanOrphaned() {
    // TODO: Agregar validación de rol admin o API key para cron
    return this.service.cleanOrphaned();
  }
}