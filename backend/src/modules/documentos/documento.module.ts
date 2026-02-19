// documento.module.ts

import { Module } from '@nestjs/common';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [DocumentoService],
})
export class DocumentoModule {}
