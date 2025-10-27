import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from './roles.service';


@ApiBearerAuth() // auth llegará luego; no se aplica guard aún
@UseGuards(JwtAuthGuard) // auth llegará luego; no se aplica guard aún
@Controller('api/v1/roles')
export class RolesController {
  constructor(private readonly svc: RolesService) { }

  @Get()
  List(){
    return this.svc.listRoles();
  }

}
