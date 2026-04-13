import { Module } from '@nestjs/common';
import { OdooClientService } from './odoo-client.service';
import { OdooController } from './odoo.controller';

@Module({
  controllers: [OdooController],
  providers: [OdooClientService],
  exports: [OdooClientService],
})
export class OdooModule {}
