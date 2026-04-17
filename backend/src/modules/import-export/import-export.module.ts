import { Module } from '@nestjs/common';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificacionModule } from '../notifications/notificacion.module';

@Module({
  imports: [PrismaModule, NotificacionModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
