import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AddOfferLinesDto } from './dto/add-offer-lines.dto';
import { UpdateOfferLineDto } from './dto/update-offer-line.dto';


@ApiTags('Ofertas de Proveedores')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/offers')
export class OffersController {
    constructor(private readonly svc: OffersService) { }


    @Post()
    create(@Body() dto: CreateOfferDto) {
        return this.svc.create(dto);
    }


    @Get('by-quote/:quoteId')
    byQuote(@Param('quoteId') quoteId: string) {
        return this.svc.listByQuote(quoteId);
    }


    @Post(':offerId/lines')
    addLines(@Param('offerId') offerId: string, @Body() dto: AddOfferLinesDto) {
        return this.svc.addLines(offerId, dto);
    }


    @Patch('lines/:lineId')
    updateLine(@Param('lineId') lineId: string, @Body() dto: UpdateOfferLineDto) {
        return this.svc.updateLine(lineId, dto);
    }
}