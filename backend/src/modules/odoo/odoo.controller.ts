import {
  Controller, Get, Param, Query, Res, ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { OdooClientService } from './odoo-client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/odoo')
export class OdooController {
  constructor(private readonly odoo: OdooClientService) {}

  // ── GET /api/v1/odoo/oportunidades ────────────────────────────────────────
  // Retorna oportunidades + sus adjuntos en una sola respuesta
  @Get('oportunidades')
  async getOportunidades(
    @Query('limit')  limit  = '20',
    @Query('offset') offset = '0',
    @Query('desde')  desde?: string,
    @Query('hasta')  hasta?: string,
    @Query('search') search?: string,
  ) {
    const { leads, total } = await this.odoo.getLeads({
      limit:  parseInt(limit,  10),
      offset: parseInt(offset, 10),
      desde,
      hasta,
      search,
    });

    const leadIds = leads.map((l) => l.id);
    const adjuntos = await this.odoo.getAttachmentsForLeads(leadIds);

    // Agrupar adjuntos por lead
    const adjuntosByLead = adjuntos.reduce<Record<number, typeof adjuntos>>(
      (acc, att) => {
        (acc[att.res_id] ??= []).push(att);
        return acc;
      },
      {},
    );

    return {
      total,
      leads: leads.map((l) => ({
        ...l,
        adjuntos: adjuntosByLead[l.id] ?? [],
      })),
    };
  }

  // ── GET /api/v1/odoo/oportunidades/:id/mensajes ───────────────────────────
  @Get('oportunidades/:id/mensajes')
  async getMensajes(@Param('id', ParseIntPipe) id: number) {
    return this.odoo.getMessagesForLead(id);
  }

  // ── GET /api/v1/odoo/adjuntos/:id/descargar ───────────────────────────────
  @Get('adjuntos/:id/descargar')
  async descargarAdjunto(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { data, filename, mimetype } = await this.odoo.downloadAttachment(id);

    const encoded = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`);
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Length', data.length);
    res.send(data);
  }
}
