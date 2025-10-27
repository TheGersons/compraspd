import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from './departments.service';


@ApiBearerAuth() // auth llegará luego; no se aplica guard aún
@UseGuards(JwtAuthGuard) // auth llegará luego; no se aplica guard aún
@Controller('api/v1/departments')
export class DepartmentsController {
  constructor(private readonly svc: DepartmentsService) { }

  @Get()
  List(){
    return this.svc.listDepartments();
  }

}
