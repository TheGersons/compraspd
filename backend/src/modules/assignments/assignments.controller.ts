import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';


@ApiTags('Asignaciones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/v1/assignments')
export class AssignmentsController {
    constructor(private readonly svc: AssignmentsService) { }


    @Post()
    create(@Body() dto: CreateAssignmentDto, @Body('eta') eta: string) {
        return this.svc.create(dto, eta);
    }


    @Get(':entityType/:entityId')
    list(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
        return this.svc.listFor(entityType, entityId);
    }


    @Get()
    listAll() {
        return this.svc.listIncompletes();
    }

    //Obtener asignacion por id de supervisor
    @Get('MyAssignments/:me')
    listMyAssignments(@Param('me') me: string) {
        return this.svc.listMyAssignments(me);
    }
}    