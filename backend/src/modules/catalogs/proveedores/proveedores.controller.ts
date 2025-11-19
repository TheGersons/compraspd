import { 
  Body, 
  Controller, 
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
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedoresService } from './proveedores.service';

@ApiTags('Proveedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proveedores con filtros' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de proveedores obtenida' })
  list(
    @Query('activo', new ParseBoolPipe({ optional: true })) activo?: boolean,
    @Query('search') search?: string
  ) {
    return this.proveedoresService.listProveedores({ activo, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del proveedor' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.getStats(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  @ApiResponse({ status: 409, description: 'RTN o email duplicado' })
  create(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProveedorDto
  ) {
    return this.proveedoresService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor desactivado exitosamente' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor activado exitosamente' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedoresService.activate(id);
  }
}