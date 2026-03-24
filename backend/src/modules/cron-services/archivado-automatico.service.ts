import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CronService — Archivado automático de Licitaciones y Ofertas
 *
 * Reglas:
 * - Licitaciones: si conDescuento = true y han pasado 30 días sin avanzar → ARCHIVADA
 * - Ofertas:      si conDescuento = true y han pasado  30 días sin avanzar → ARCHIVADA
 *
 * "Sin avanzar" = fecha_con_descuento + N días <= hoy y el siguiente estado (aprobacionCompra) sigue en false
 */
@Injectable()
export class ArchivadoAutomaticoService {
  private readonly logger = new Logger(ArchivadoAutomaticoService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Corre todos los días a las 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async archivarVencidos() {
    this.logger.log('▶ Iniciando archivado automático...');
    await Promise.all([
      this.archivarLicitacionesVencidas(),
      this.archivarOfertasVencidas(),
    ]);
    this.logger.log('✅ Archivado automático completado');
  }

  // ============================================
  // LICITACIONES — 30 días desde conDescuento
  // ============================================
  private async archivarLicitacionesVencidas() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Buscar licitaciones ACTIVAS donde al menos un producto
    // tiene conDescuento=true, fechaConDescuento <= hace30Dias
    // y aprobacionCompra sigue en false
    const licitaciones = await this.prisma.licitacion.findMany({
      where: { estado: 'ACTIVA' },
      include: { productos: true },
    });

    let archivadas = 0;
    for (const lic of licitaciones) {
      const debeArchivar = lic.productos.some(
        (p) =>
          p.conDescuento &&
          !p.aprobacionCompra &&
          p.fechaConDescuento &&
          new Date(p.fechaConDescuento) <= hace30Dias,
      );

      if (debeArchivar) {
        await this.prisma.licitacion.update({
          where: { id: lic.id },
          data: {
            estado: 'ARCHIVADA',
            motivoArchivo:
              'Archivado automáticamente: 30 días sin avanzar desde Con Descuento',
            fechaArchivo: new Date(),
          },
        });
        archivadas++;
        this.logger.log(
          `📁 Licitación archivada automáticamente: ${lic.id} (${lic.nombre})`,
        );
      }
    }

    this.logger.log(`Licitaciones archivadas: ${archivadas}`);
  }

  // ============================================
  // OFERTAS — 5 días desde conDescuento
  // ============================================
  private async archivarOfertasVencidas() {
    const hace30DiasOfertas = new Date();
    hace30DiasOfertas.setDate(hace30DiasOfertas.getDate() - 30);

    const ofertas = await this.prisma.oferta.findMany({
      where: { estado: 'ACTIVA' },
      include: { productos: true },
    });

    let archivadas = 0;
    for (const oferta of ofertas) {
      const debeArchivar = oferta.productos.some(
        (p) =>
          p.conDescuento &&
          !p.aprobacionCompra &&
          p.fechaConDescuento &&
          new Date(p.fechaConDescuento) <= hace30DiasOfertas,
      );

      if (debeArchivar) {
        await this.prisma.oferta.update({
          where: { id: oferta.id },
          data: {
            estado: 'ARCHIVADA',
            motivoArchivo:
              'Archivado automáticamente: 30 días sin avanzar desde Con Descuento',
            fechaArchivo: new Date(),
          },
        });
        archivadas++;
        this.logger.log(
          `📁 Oferta comercial archivada automáticamente: ${oferta.id} (${oferta.nombre})`,
        );
      }
    }

    this.logger.log(`Ofertas comerciales archivadas: ${archivadas}`);
  }
}
