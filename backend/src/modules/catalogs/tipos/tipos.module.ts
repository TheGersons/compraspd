import { Module } from '@nestjs/common';
import { TiposController } from './tipos.controller';
import { TiposService } from './tipos.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiposController],
  providers: [TiposService],
  exports: [TiposService],
})
export class TiposModule {}