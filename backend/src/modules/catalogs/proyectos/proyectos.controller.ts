import { 
  Body, 
  Controller, 
  Delete, // ← AGREGADO
  Get, 
  Param, 
  Patch, 
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectosService } from './proyectos.service';



@ApiTags('Proyectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proyectos con filtros' })
  @ApiQuery({ name: 'estado', required: false, type: Boolean, description: 'true=activos, false=cerrados' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de proyectos obtenida' })
  list(
    @Query('estado', new ParseBoolPipe({ optional: true })) estado?: boolean,
    @Query('search') search?: string
  ) {
    return this.proyectosService.listProyectos({ estado, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyecto por ID con sus cotizaciones' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del proyecto' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.getStats(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un proyecto con ese nombre' })
  create(@Body() dto: CreateProyectoDto) {
    return this.proyectosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProyectoDto
  ) {
    return this.proyectosService.update(id, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Cerrar proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto cerrado exitosamente' })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.close(id);
  }

  @Patch(':id/open')
  @ApiOperation({ summary: 'Abrir proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto abierto exitosamente' })
  open(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.open(id);
  }

  @Delete(':id') // ← AGREGADO
  @ApiOperation({ summary: 'Eliminar proyecto (solo si no tiene cotizaciones)' })
  @ApiResponse({ status: 200, description: 'Proyecto eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar porque tiene cotizaciones' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.delete(id);
  }
}