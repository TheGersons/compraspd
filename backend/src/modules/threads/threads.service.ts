import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class ThreadsService {
    constructor(private prisma: PrismaClient) { }


    async ensureThread(entityType: 'PurchaseRequest' | 'Quote', entityId: string, createdById: string) {
        const existing = await this.prisma.thread.findFirst({ where: { entityType, entityId } });
        if (existing) return existing;
        return this.prisma.thread.create({ data: { entityType, entityId, createdById } });
    }


    async postMessage(
        threadId: string,
        authorId: string,
        body?: string,
        attachments?: { fileName: string; mimeType: string; size: number; url: string }[],
    ) {
        const thread = await this.prisma.thread.findUnique({ where: { id: threadId } });
        if (!thread) throw new NotFoundException('Hilo no encontrado');

        const msg = await this.prisma.message.create({
            data: { threadId, authorId, body },
        });

        if (attachments && attachments.length) {
            await this.prisma.attachment.createMany({
                data: attachments.map(a => ({
                    entityType: 'Message',
                    entityId: msg.id,
                    messageId: msg.id,
                    fileName: a.fileName,
                    mimeType: a.mimeType,
                    size: a.size,
                    url: a.url,
                    createdById: authorId,
                })),
                skipDuplicates: true,
            });
        }

        return this.prisma.message.findUnique({
            where: { id: msg.id },
            include: { attachments: true },
        });
    }



    listMessages(threadId: string, opts: { skip: number; take: number }) {
        return this.prisma.message.findMany({ where: { threadId }, skip: opts.skip, take: opts.take, orderBy: { createdAt: 'desc' } });
    }
}