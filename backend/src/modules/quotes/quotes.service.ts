import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateQuoteDto } from './dto/create-quotes.dto';
import { UpdateQuoteDto } from './dto/update-quotes.dto';


@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaClient) { }


  async ensureForPr(dto: CreateQuoteDto) {
    const pr = await this.prisma.purchaseRequest.findUnique({ where: { id: dto.purchaseRequestId }, include: { items: true } });
    if (!pr) throw new NotFoundException('Solicitud no encontrada');
    const existing = await this.prisma.quote.findUnique({ where: { purchaseRequestId: pr.id } });
    if (existing) return existing;
    return this.prisma.quote.create({
      data: {
        purchaseRequestId: pr.id,
        baseCurrency: dto.baseCurrency ?? 'HNL',
        status: 'REQUESTED',
        lines: { create: pr.items.map((i) => ({ prItemId: i.id })) },
      },
    });
  }


  getByPr(prId: string) {
    return this.prisma.quote.findUnique({
      where: { purchaseRequestId: prId },
      include: { lines: true, offers: true, attachments: true },
    });
  }


  update(id: string, dto: UpdateQuoteDto) {
    return this.prisma.quote.update({
      where: { id },
      data: { status: dto.status, validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined },
    });
  }


  selectLine(dto: { lineId: string; chosenSupplierId?: string; chosenOfferId?: string; chosenUnitPrice?: string; chosenCurrency?: string }) {
    return this.prisma.quoteLine.update({
      where: { id: dto.lineId },
      data: {
        chosenSupplierId: dto.chosenSupplierId,
        chosenOfferId: dto.chosenOfferId,
        chosenUnitPrice: dto.chosenUnitPrice as any,
        chosenCurrency: dto.chosenCurrency,
      },
    });
  }
}