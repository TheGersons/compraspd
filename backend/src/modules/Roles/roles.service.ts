import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  async listRoles() {
    return this.prisma.role.findMany({
      select :
      {
        id : true,
        name: true,
        description: true
      },
      orderBy :
      {
        name : 'asc'
      }
    });
  }
}
