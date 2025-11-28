import { Module } from '@nestjs/common';
import { PaisesController } from './paises.controller';
import { PaisesService } from './paises.service';
import { PrismaService } from '../../prisma/prisma.service'; // Ajusta la ruta

@Module({
  controllers: [PaisesController],
  providers: [PaisesService, PrismaService],
  exports: [PaisesService],
})
export class CountriesModule {}