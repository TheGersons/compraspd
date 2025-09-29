import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAssignmentDto } from './dto/create-assignment.dto';


@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaClient) { }


    create(dto: CreateAssignmentDto) {
        return this.prisma.assignment.create({ data: dto });
    }


    listFor(entityType: string, entityId: string) {
        return this.prisma.assignment.findMany({ where: { entityType, entityId }, include: { assignee: true } });
    }
}