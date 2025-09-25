import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}
  me(id: string) { return this.prisma.user.findUnique({ where: { id }, include: { role: true } }); }
}
