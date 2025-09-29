import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';


@Module({
    imports: [PrismaModule],
    providers: [AttachmentsService],
    controllers: [AttachmentsController],
})
export class AttachmentsModule { }