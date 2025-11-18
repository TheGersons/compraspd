import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AddOfferLinesDto } from './dto/add-offer-lines.dto';
import { UpdateOfferLineDto } from './dto/update-offer-line.dto';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class OffersService {
    constructor(private prisma: PrismaService) { }


    create(dto: CreateOfferDto) {
        return this.prisma.quoteOffer.create({ data: { quoteId: dto.quoteId, supplierId: dto.supplierId, currency: dto.currency } });
    }


    listByQuote(quoteId: string) {
        return this.prisma.quoteOffer.findMany({ where: { quoteId }, include: { lines: true, attachments: true, supplier: true } });
    }


    addLines(offerId: string, dto: AddOfferLinesDto) {
        return this.prisma.quoteOffer.update({
            where: { id: offerId },
            data: {
                lines: {
                    createMany: {
                        data: dto.lines.map((l) => ({ prItemId: l.prItemId, unitPrice: l.unitPrice as any, deliveryDays: l.deliveryDays, notes: l.notes })),
                        skipDuplicates: true,
                    },
                },
            },
            include: { lines: true },
        });
    }


    updateLine(lineId: string, dto: UpdateOfferLineDto) {
        return this.prisma.quoteOfferLine.update({ where: { id: lineId }, data: { unitPrice: dto.unitPrice as any, deliveryDays: dto.deliveryDays, notes: dto.notes } });
    }
}