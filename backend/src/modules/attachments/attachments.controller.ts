import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { Express } from 'express'; // <-- añade este import de tipo
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';


@ApiTags('Adjuntos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/attachments')
export class AttachmentsController {
    constructor(private readonly svc: AttachmentsService) { }


    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'uploads',
                filename: (_req, file, cb) => cb(null, `${uuid()}-${file.originalname}`),
            }),
        }),
    )
    @Post('upload')
    async upload(
        @CurrentUser() me: any,
        @UploadedFile() file: Express.Multer.File, // <-- ya tipa bien
        @Body() dto: UploadAttachmentDto,
    ) {
        const url = `/uploads/${file.filename}`;
        const saved = await this.svc.create({
            entityType: dto.entityType,
            entityId: dto.entityId,
            fileName: dto.fileName || file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url,
            createdById: me?.sub,
        });
        return saved;
    }


    @Get(':entityType/:entityId')
    list(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
        return this.svc.list(entityType, entityId);
    }
}