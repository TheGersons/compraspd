import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaisResponseDto } from './dto/paises.dto';
import { PaisesService } from './paises.service';

@ApiTags('Países')
@Controller('api/v1/paises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaisesController {
  constructor(private readonly paisesService: PaisesService) {}

   @Get()
  @ApiOperation({ summary: 'Listar todos los países activos' })
  @ApiResponse({ status: 200, description: 'Lista de países', type: [PaisResponseDto] })
  findAll() {
    return this.paisesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un país por ID' })
  @ApiResponse({ status: 200, description: 'País encontrado', type: PaisResponseDto })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  findOne(@Param('id') id: string) {
    return this.paisesService.findOne(id);
  }
}