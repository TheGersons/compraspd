// src/locations/locations.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeparmentService } from './deparment.service';

// Define explícitamente el tipo de retorno para mayor claridad
type departamento = { name: string; }; 

@Controller('/api/v1/departments')
@UseGuards(JwtAuthGuard)
export class DeparmentController {
  constructor(private readonly deparmentService: DeparmentService) {}

  
    //creamos un nuevo endp0oint para crear un nuevo departamento
    //solo Id y name
    @Post() // Ruta final: /departments/create
    async createDepartment(@Body('name') name: string): Promise<departamento[]> {


        const newDepartment = await this.deparmentService.CreateDepartment(name);
        return newDepartment;
    }
}