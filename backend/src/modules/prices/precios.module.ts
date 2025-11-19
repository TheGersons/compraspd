import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [PrismaService],
  controllers: [PreciosController],
  providers: [PreciosService],
  exports: [PreciosService],
})
export class PreciosModule {}