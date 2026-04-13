import { Module } from '@nestjs/common';
import { ArchivadoAutomaticoService } from './archivado-automatico.service';
import { OdooSyncService } from './odoo-sync.service';
import { OdooModule } from '../odoo/odoo.module';

@Module({
  imports: [OdooModule],
  providers: [
    ArchivadoAutomaticoService,
    OdooSyncService,
  ],
})
export class CronServicesModule {}
