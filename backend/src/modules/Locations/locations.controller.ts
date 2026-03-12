import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('warehouses')
  @ApiOperation({ summary: 'Obtener lista de almacenes' })
  getWarehouses() {
    return this.locationsService.getWarehouses();
  }
}
