import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThreadsService } from './threads.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EnsureThreadDto } from './dto/ensure-threads.dto';


@ApiTags('Hilos y Comentarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/threads')
export class ThreadsController {
    constructor(private readonly svc: ThreadsService) { }


    @Post('ensure')
    ensure(@CurrentUser() me: any, @Body() dto: EnsureThreadDto) {
        return this.svc.ensureThread(dto.entityType, dto.entityId, me?.sub);
    }


    @Post('message')
    post(@CurrentUser() me: any, @Body() dto: CreateMessageDto) {
        return this.svc.postMessage(dto.threadId, me?.sub, dto.body, dto.attachments);
    }


    @Get(':threadId/messages')
    list(@Param('threadId') threadId: string, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);
        return this.svc.listMessages(threadId, { skip, take });
    }
}