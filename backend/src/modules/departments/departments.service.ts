import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) { }

  async listDepartments() {
    return this.prisma.department.findMany({
      select :
      {
        id : true,
        name: true,
      },
      orderBy :
      {
        name : 'asc'
      }
    });
  }
}
