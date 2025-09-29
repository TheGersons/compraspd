import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class AttachmentsService {
    constructor(private prisma: PrismaClient) { }


    create(data: { entityType: string; entityId: string; fileName: string; mimeType: string; size: number; url: string; createdById?: string }) {
        return this.prisma.attachment.create({ data });
    }


    list(entityType: string, entityId: string) {
        return this.prisma.attachment.findMany({ where: { entityType, entityId }, orderBy: { createdAt: 'desc' } });
    }
}