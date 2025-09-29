import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';


@Module({
    imports: [PrismaModule],
    providers: [AssignmentsService],
    controllers: [AssignmentsController],
})
export class AssignmentsModule { }