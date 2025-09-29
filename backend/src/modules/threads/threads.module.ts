import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';


@Module({
    imports: [PrismaModule],
    providers: [ThreadsService],
    controllers: [ThreadsController],
})
export class ThreadsModule { }