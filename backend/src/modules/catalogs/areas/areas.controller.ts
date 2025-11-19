import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post,
  Delete,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AreasService } from './areas.service';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateAreaDto } from './dto/create-area.dto';

@ApiTags('Áreas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las áreas' })
  @ApiResponse({ status: 200, description: 'Lista de áreas obtenida' })
  list() {
    return this.areasService.listAreas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener área por ID con sus tipos' })
  @ApiResponse({ status: 200, description: 'Área encontrada' })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva área' })
  @ApiResponse({ status: 201, description: 'Área creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El área ya existe' })
  create(@Body() dto: CreateAreaDto) {
    return this.areasService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar área' })
  @ApiResponse({ status: 200, description: 'Área actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAreaDto
  ) {
    return this.areasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar área' })
  @ApiResponse({ status: 200, description: 'Área eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene tipos relacionados)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.areasService.remove(id);
  }
}