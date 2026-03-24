import { Module } from '@nestjs/common';
import { ArchivadoAutomaticoService } from './archivado-automatico.service';

@Module({
  providers: [ArchivadoAutomaticoService],
})
export class CronServicesModule {}
