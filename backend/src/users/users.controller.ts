import { Controller, Get, Req } from '@nestjs/common';

@Controller('api/v1/users')
export class UsersController {
  @Get('me')
  me(@Req() req: any) { return { userId: req.user?.sub ?? 'demo' }; } // integrar JWT más tarde
}
