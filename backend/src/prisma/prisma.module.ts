// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService], // Provee la clase con los hooks de ciclo de vida
  exports: [PrismaService],   // Permite que otros módulos la inyecten
})
export class PrismaModule {}