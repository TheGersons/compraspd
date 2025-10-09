// backend/src/prisma/prisma.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Prisma');

  constructor() {
    super({
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn',  emit: 'event' },
        // { level: 'query', emit: 'event' },
        // { level: 'info',  emit: 'event' },
      ],
    });

    // Forzar la firma de $on para evitar "never"
    const on = this.$on.bind(this) as unknown as {
      (event: 'error'|'warn', cb: (e: Prisma.LogEvent) => void): void;
      (event: 'query', cb: (e: Prisma.QueryEvent) => void): void;
      (event: 'info',  cb: (e: Prisma.LogEvent) => void): void;
    };

    on('error', (e) => this.logger.error(`[${e.target}] ${e.message}`));
    on('warn',  (e) => this.logger.warn(`[${e.target}] ${e.message}`));
    // on('query', (e) => this.logger.log(`${e.query} :: ${e.duration}ms`));
    // on('info',  (e) => this.logger.log(e.message));
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma conectado');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado');
  }

  async enableShutdownHooks(appClose: () => Promise<void>) {
    process.on('beforeExit', async () => {
      this.logger.log('beforeExit recibido, cerrando app…');
      await appClose();
    });
  }
}
