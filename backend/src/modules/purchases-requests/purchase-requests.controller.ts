/*


import { Body, Controller, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePurchaseRequestDto } from './dto/create-pr.dto';
import { UpdatePurchaseRequestDto } from './dto/update-pr.dto';
import { ChangePrStatusDto } from './dto/change-pr-status.dto';
import { SendMessageDto } from './dto/sendmessage.dto';
import { FilesInterceptor } from '@nestjs/platform-express';


interface AuthenticatedRequest extends Request {
    user: { id: string; sub: string }; 
}


@Controller('api/v1/purchase-requests')
@UseGuards(AuthGuard('jwt'))
export class PurchaseRequestsController {
  constructor(private readonly service: PurchaseRequestsService) {}

  // Crear solicitud
  @Post()
  create(@Body() dto: CreatePurchaseRequestDto,@CurrentUser() user: {sub: string; userId?: string}) {
    //if(!req?.user?.sub) throw new UnauthorizedException('Token invalido');
    return this.service.create(dto, user);
  }

  // Listar las mías
  @Get()
  listMine(
    @CurrentUser() me: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listMine(me, Number(page ?? 1), Number(pageSize ?? 20));
  }

  @Get('my-requests')
  listMyRequests(@Req() req: AuthenticatedRequest) {
    return this.service.listMyRequests(req.user.sub);
  }
   // POST /api/v1/purchase-requests/:id/chat
  @Post(':id/chat')
  sendRequestChat(
    @Param('id') requestId: string,
    @Body() messageDto: SendMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.sendRequestChat(requestId, req.user.sub, messageDto);
  }

  // POST /api/v1/purchase-requests/upload-files
  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.service.uploadFiles(files);
  }

   // GET /api/v1/purchase-requests/:id/chat
  @Get(':id/chat')
  listRequestChat(@Param('id') requestId: string) {
    return this.service.listRequestChat(requestId);
  }

  // Obtener una concreta
  @Get(':id')
  getOne(@CurrentUser() me: any, @Param('id') id: string) {
    return this.service.getById(id, me);
  }

  // Actualizar (solo campos de cabecera; los items podrían manejarse con endpoints propios)
  @Patch(':id')
  update(@CurrentUser() me: any, @Param('id') id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.service.update(id, dto, me);
  }

  // Cambiar estado
  @Patch(':id/status')
  changeStatus(@CurrentUser() me: any, @Param('id') id: string, @Body() dto: ChangePrStatusDto) {
    return this.service.changeStatus(id, dto.status, me);
  }

  // Asignadas al supervisor actual
  @Get('supervisor/assigned/list')
  listAssigned(
    @CurrentUser() me: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listAssignedTo(me, Number(page ?? 1), Number(pageSize ?? 20));
  }

  @Get('history/all')
  listAllRequests() {
    return this.service.listAllRequests();
  }
  
  @Get('history/my')
  listMyRequestsHistory(@Req() req: AuthenticatedRequest) {
    return this.service.listMyRequestsHistory(req.user.sub);
  }

}

*/
