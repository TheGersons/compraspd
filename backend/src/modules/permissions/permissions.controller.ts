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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Listar permisos
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los permisos' })
  @ApiQuery({ name: 'modulo', required: false, type: String })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiQuery({ name: 'groupByModulo', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de permisos obtenida' })
  list(
    @Query('modulo') modulo?: string,
    @Query('activo', new ParseBoolPipe({ optional: true })) activo?: boolean,
    @Query('groupByModulo', new ParseBoolPipe({ optional: true })) groupByModulo?: boolean
  ) {
    return this.permissionsService.listPermissions({ modulo, activo, groupByModulo });
  }

  /**
   * Listar módulos únicos
   */
  @Get('modules')
  @ApiOperation({ summary: 'Listar módulos únicos' })
  @ApiResponse({ status: 200, description: 'Lista de módulos' })
  listModules() {
    return this.permissionsService.listModules();
  }

  /**
   * Obtener permiso por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener permiso por ID' })
  @ApiResponse({ status: 200, description: 'Permiso encontrado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findById(id);
  }

  /**
   * Crear nuevo permiso
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El permiso ya existe' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  /**
   * Actualizar permiso
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar permiso' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto
  ) {
    return this.permissionsService.update(id, dto);
  }

  /**
   * Desactivar permiso
   */
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar permiso' })
  @ApiResponse({ status: 200, description: 'Permiso desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.deactivate(id);
  }

  /**
   * Activar permiso
   */
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar permiso' })
  @ApiResponse({ status: 200, description: 'Permiso activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.activate(id);
  }
}