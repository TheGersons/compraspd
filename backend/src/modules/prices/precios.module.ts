import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { PrismaModule } from '../../prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  controllers: [PreciosController],
  providers: [PreciosService],
  exports: [PreciosService],
})
export class PreciosModule {}