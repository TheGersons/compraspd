import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }


    create(dto: CreateAssignmentDto) {
        return this.prisma.assignment.create({ data: dto });
    }


    listFor(entityType: string, entityId: string) {
        return this.prisma.assignment.findMany({ where: { entityType, entityId }, include: { assignee: true } });
    }
}