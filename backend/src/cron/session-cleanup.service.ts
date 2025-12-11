// src/cron/session-cleanup.service.ts
// VERSIÓN CON @nestjs/schedule (para usar con pnpm instalado)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '../modules/auth/auth.service';

/**
 * Servicio que limpia automáticamente sesiones expiradas
 * Se ejecuta cada hora
 */
@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private authService: AuthService) {}

  /**
   * Limpia sesiones expiradas cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanExpiredSessions() {
    this.logger.log('🧹 Iniciando limpieza de sesiones expiradas...');
    
    try {
      const result = await this.authService.cleanExpiredSessions();
      
      if (result.count > 0) {
        this.logger.log(`✅ Limpieza completada: ${result.count} sesiones expiradas marcadas como inactivas`);
      } else {
        this.logger.debug('✓ No hay sesiones expiradas para limpiar');
      }
    } catch (error) {
      this.logger.error('❌ Error al limpiar sesiones expiradas:', error);
    }
  }

  /**
   * Elimina físicamente sesiones inactivas viejas cada día a las 3 AM
   */
  @Cron('0 3 * * *') // Cada día a las 3:00 AM
  async deleteOldSessions() {
    this.logger.log('🗑️  Iniciando eliminación de sesiones antiguas...');
    
    try {
      const result = await this.authService.deleteOldSessions();
      
      if (result.count > 0) {
        this.logger.log(`✅ Eliminación completada: ${result.count} sesiones antiguas eliminadas`);
      } else {
        this.logger.debug('✓ No hay sesiones antiguas para eliminar');
      }
    } catch (error) {
      this.logger.error('❌ Error al eliminar sesiones antiguas:', error);
    }
  }

  /**
   * Genera reporte de sesiones activas cada día a mediodía
   */
  @Cron('0 12 * * *') // Cada día a las 12:00 PM
  async generateSessionReport() {
    this.logger.log('📊 Generando reporte de sesiones...');
    
    try {
      const stats = await this.authService.getSessionStats();
      
      this.logger.log(`
╔════════════════════════════════════════╗
║      REPORTE DE SESIONES ACTIVAS       ║
╠════════════════════════════════════════╣
║ Total sesiones activas: ${String(stats.activeSessions).padEnd(14)} ║
║ Total usuarios conectados: ${String(stats.uniqueUsers).padEnd(10)} ║
║ Sesiones web: ${String(stats.webSessions).padEnd(20)} ║
║ Sesiones móviles: ${String(stats.mobileSessions).padEnd(16)} ║
║ Sesiones desktop: ${String(stats.desktopSessions).padEnd(16)} ║
╚════════════════════════════════════════╝
      `);
    } catch (error) {
      this.logger.error('❌ Error al generar reporte:', error);
    }
  }
}