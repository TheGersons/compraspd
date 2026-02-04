import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger:['error','warn','log']});
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:8080', 'http://192.168.3.37:5173', 'http://192.168.3.37:8080','http://192.168.114.18:5173', 'http://192.168.114.18:8080', 'http://192.168.3.38:5173', 'http://192.168.3.38:8080'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Compras API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT || 3001);
  new Logger('Bootstrap').log(`API on :${process.env.PORT || 3001}`)
}
bootstrap();
