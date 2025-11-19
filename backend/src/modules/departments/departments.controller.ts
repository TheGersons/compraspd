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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /**
   * Listar departamentos
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los departamentos' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos obtenida' })
  list() {
    return this.departmentsService.listDepartments();
  }

  /**
   * Obtener departamento por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener departamento por ID con sus usuarios' })
  @ApiResponse({ status: 200, description: 'Departamento encontrado' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findById(id);
  }

  /**
   * Obtener estadísticas del departamento
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del departamento' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.getStats(id);
  }

  /**
   * Crear nuevo departamento
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo departamento' })
  @ApiResponse({ status: 201, description: 'Departamento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El departamento ya existe' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  /**
   * Actualizar departamento
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar departamento' })
  @ApiResponse({ status: 200, description: 'Departamento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un departamento con ese nombre' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto
  ) {
    return this.departmentsService.update(id, dto);
  }

  /**
   * Eliminar departamento
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar departamento' })
  @ApiResponse({ status: 200, description: 'Departamento eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene usuarios asignados)' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}