// src/locations/locations.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Define explícitamente el tipo de retorno para mayor claridad
type LocationDto = { id: string; name: string; type: string }; 

@Controller('/api/v1/locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('warehouses') // Ruta final: /locations/warehouses
  // 1. CORRECCIÓN: Cambia Promise<string[]> a Promise<LocationDto[]>
  async findAllWarehouses(): Promise<LocationDto[]> {
    // 2. SIMPLIFICACIÓN: Llama al servicio directamente.
    return this.locationsService.findAllWarehouses();
  }
}