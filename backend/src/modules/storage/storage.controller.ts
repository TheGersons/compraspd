import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

type UserJwt = { sub: string; role?: string };

@ApiTags('Storage')
@Controller('api/v1/storage')
@UseGuards(AuthGuard('jwt'))
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /api/v1/storage/upload
   * Sube un archivo de comprobante a Nextcloud
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo de comprobante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        cotizacionId: { type: 'string' },
        sku: { type: 'string' },
        proveedorNombre: { type: 'string' },
        tipo: { type: 'string', enum: ['comprobantes_descuento', 'facturas', 'ordenes_compra', 'otros'] },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos faltantes' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { cotizacionId: string; sku: string; proveedorNombre: string; tipo?: string },
    @CurrentUser() user: UserJwt,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!body.cotizacionId || !body.sku || !body.proveedorNombre) {
      throw new BadRequestException('Faltan datos requeridos: cotizacionId, sku, proveedorNombre');
    }

    const tipo = (body.tipo as any) || 'comprobantes_descuento';

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      body.cotizacionId,
      body.sku,
      body.proveedorNombre,
      tipo,
    );

    return {
      ok: true,
      message: 'Archivo subido exitosamente',
      ...result,
    };
  }

  /**
   * POST /api/v1/storage/no-aplica
   * Genera un comprobante automático para "No aplica descuento"
   */
  @Post('no-aplica')
  @ApiOperation({ summary: 'Generar comprobante de "No aplica descuento"' })
  @ApiResponse({ status: 201, description: 'Comprobante generado' })
  generateNoAplica(@CurrentUser() user: UserJwt) {
    const comprobante = this.storageService.generateNoAplicaComprobante();
    
    return {
      ok: true,
      message: 'Comprobante generado',
      comprobante,
    };
  }
}