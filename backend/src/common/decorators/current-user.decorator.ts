// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!request?.user) throw new UnauthorizedException('Token inválido o ausente');
  return request.user as { sub: string; email: string; role?: string };
});
