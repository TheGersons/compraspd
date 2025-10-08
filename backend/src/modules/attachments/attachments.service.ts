import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class AttachmentsService {
    constructor(private prisma: PrismaService) { }


    create(data: { entityType: string; entityId: string; fileName: string; mimeType: string; size: number; url: string; createdById?: string }) {
        return this.prisma.attachment.create({ data });
    }


    list(entityType: string, entityId: string) {
        return this.prisma.attachment.findMany({ where: { entityType, entityId }, orderBy: { createdAt: 'desc' } });
    }
}