import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from './roles.service';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';



@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Listar roles
   */
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida' })
  list(@Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive?: boolean) {
    return this.rolesService.listRoles(includeInactive);
  }

  /**
   * Obtener rol por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID con sus permisos' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findById(id);
  }

  /**
   * Crear nuevo rol
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El rol ya existe' })
  create(@Body() dto: CreateRolDto) {
    return this.rolesService.create(dto);
  }

  /**
   * Actualizar rol
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolDto
  ) {
    return this.rolesService.update(id, dto);
  }

  /**
   * Desactivar rol
   */
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar rol' })
  @ApiResponse({ status: 200, description: 'Rol desactivado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede desactivar (tiene usuarios activos)' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.deactivate(id);
  }

  /**
   * Activar rol
   */
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar rol' })
  @ApiResponse({ status: 200, description: 'Rol activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.activate(id);
  }

  /**
   * Asignar permisos a rol
   */
  @Post(':id/permissions')
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  @ApiResponse({ status: 200, description: 'Permisos asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto
  ) {
    return this.rolesService.assignPermissions(id, dto);
  }

  /**
   * Obtener permisos de un rol
   */
  @Get(':id/permissions')
  @ApiOperation({ summary: 'Obtener permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Lista de permisos del rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissions(id);
  }
}