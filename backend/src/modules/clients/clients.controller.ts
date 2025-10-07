import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ListClientQueryDto } from './dto/list-client.query.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListClientQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
