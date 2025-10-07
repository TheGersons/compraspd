import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth() // auth llegará luego; no se aplica guard aún
@UseGuards(JwtAuthGuard) // auth llegará luego; no se aplica guard aún
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly svc: UsersService) { }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Get()
  list(@Query() q: QueryUsersDto) {
    return this.svc.paginate({
      page: q.page ? parseInt(q.page, 10) : undefined,
      pageSize: q.pageSize ? parseInt(q.pageSize, 10) : undefined,
      search: q.search,
      roleId: q.roleId,
      isActive: typeof q.isActive === 'string' ? q.isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.svc.changePassword(id, dto.newPassword, dto.oldPassword);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.svc.update(id, { isActive: false });
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.svc.update(id, { isActive: true });
  }
}
