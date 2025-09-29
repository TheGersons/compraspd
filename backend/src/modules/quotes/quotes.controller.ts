import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quotes.dto';
import { SelectLineDto } from './dto/select-line.sto';
import { UpdateQuoteDto } from './dto/update-quotes.dto';

@ApiTags('Comparativos (Quotes)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/quotes')
export class QuotesController {
  constructor(private readonly svc: QuotesService) { }


  @Post('ensure')
  ensure(@Body() dto: CreateQuoteDto) {
    return this.svc.ensureForPr(dto);
  }


  @Get('by-request/:prId')
  getByPr(@Param('prId') prId: string) {
    return this.svc.getByPr(prId);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.svc.update(id, dto);
  }


  @Patch('select-line')
  selectLine(@Body() dto: SelectLineDto) {
    return this.svc.selectLine(dto);
  }
}