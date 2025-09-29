import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@ApiTags('Adjuntos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/attachments')
export class AttachmentsController {
    constructor(private readonly svc: AttachmentsService) { }


    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'uploads',
                filename: (_req, file, cb) => {
                    const id = uuid();
                    cb(null, `${id}${extname(file.originalname)}`);
                },
            }),
            limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
        }),
    )
    async upload(@CurrentUser() me: any, @UploadedFile() file: Express.Multer.File, @Body() dto: UploadAttachmentDto) {
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