// src/prisma/prisma.service.ts
import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
  constructor() {
    // 1. **CLAVE:** Inicializar con la configuración 'log'
    // Esto asegura que PrismaClient sepa que debe escuchar eventos,
    // incluyendo 'beforeExit'.
    super({
      // ¡AGREGA ESTO!
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' }, // <--- ESTO MUESTRA CADA CONSULTA SQL
      ],
      // ... otras configuraciones
    });
  }

  async onModuleInit() {
    await this.$connect();

    // 2. Suscribirse a los eventos de consulta y registrarlos
    (this as any).$on('query', (event: any) => {
      this.logger.log(`Prisma Query: ${event.query} (Params: ${event.params})`);
    });

    // Opcional: registrar advertencias y errores
    (this as any).$on('warn', (event: any) => {
      this.logger.warn(`Prisma Warning: ${event.message}`);
    });
    (this as any).$on('error', (event: any) => {
      this.logger.error(`Prisma Error: ${event.message}`);
    });
  }
  async onModuleDestroy() {
    // 3. Desconexión limpia durante el hot-reload.
    await this.$disconnect();
  }

  // Hook para permitir un cierre elegante de NestJS.
  // IMPORTANTE: El tipado se arregla al configurar 'log' en el constructor.
  // Si persiste el error, verifica que no tengas problemas de versiones de @types.
  async enableShutdownHooks(app: INestApplication) {
    // Para entornos muy estrictos, a veces es necesario un pequeño "hack" de tipado:
    (this as any).$on('beforeExit', async () => {
       await app.close();
    });
    
    /*
    // Si la solución de 'as any' no te gusta, intenta la línea normal:
    // this.$on('beforeExit', async () => {
    //   await app.close();
    // });
    */
  }
}