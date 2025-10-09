import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<any>();
    const req = ctx.getRequest<any>();

    const { status, body } = this.map(exception);
    this.logger.error(JSON.stringify({ method: req.method, url: req.url, status, error: body }));
    res.status(status).json(body);
  }

  private map(exception: any): { status: number; body: any } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      return { status, body: typeof resp === 'object' ? resp : { message: resp } };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') return { status: HttpStatus.CONFLICT, body: { message: 'Duplicado: clave única violada', meta: exception.meta } };
      if (exception.code === 'P2003') return { status: HttpStatus.BAD_REQUEST, body: { message: 'Violación de referencia', meta: exception.meta } };
      return { status: HttpStatus.BAD_REQUEST, body: { message: `Prisma error ${exception.code}`, meta: exception.meta } };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return { status: HttpStatus.BAD_REQUEST, body: { message: 'Validación Prisma', detail: String(exception.message) } };
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: { message: 'Error interno' } };
  }
}
