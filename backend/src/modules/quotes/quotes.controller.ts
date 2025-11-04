// quotes/quotes.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuotesService } from './quotes.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // GET /api/v1/quotes/dashboard
  @Get('dashboard')
  getDashboardData(
    @Query('period') period?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('procurement') procurement?: string,
    @Query('projectId') projectId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
  ) {
    return this.quotesService.getDashboardData({
      period,
      status,
      category,
      procurement,
      projectId,
      assignedTo,
      search,
    });
  }

  // GET /api/v1/quotes/stats
  @Get('stats')
  getStats(@Query('period') period: string = '30d') {
    return this.quotesService.getStats(period);
  }
}