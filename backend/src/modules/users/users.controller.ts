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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginateUsersDto } from './dto/paginate-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear nuevo usuario
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email duplicado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Listar todos los usuarios con filtros y paginación
   */
  @Get()
  @ApiOperation({ summary: 'Listar usuarios con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  paginate(@Query() query: PaginateUsersDto) {
    return this.usersService.paginate(query);
  }

  /**
   * Listar supervisores activos
   */
  @Get('supervisors')
  @ApiOperation({ summary: 'Listar supervisores activos' })
  @ApiResponse({ status: 200, description: 'Lista de supervisores obtenida' })
  @ApiResponse({ status: 404, description: 'No se encontraron supervisores' })
  listSupervisors() {
    return this.usersService.supervisorsList();
  }

  /**
   * Listar todos los usuarios (sin paginación)
   */
  @Get('all')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista completa de usuarios' })
  listAll() {
    return this.usersService.listUsers();
  }

  /**
   * Obtener usuario por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Actualizar usuario
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.update(id, dto);
  }

  /**
   * Cambiar contraseña de usuario
   */
  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña de usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  changePassword(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(id, dto.newPassword, dto.oldPassword);
  }

  /**
   * Desactivar usuario
   */
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivate(id);
  }

  /**
   * Activar usuario
   */
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }
}