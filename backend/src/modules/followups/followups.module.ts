import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';

/**
 * FollowupsModule bundles the controller and service responsible for
 * driving the assignment follow‑up workflow.  The PrismaModule is
 * imported so that the service can inject the Prisma client.  Without
 * defining this module NestJS would be unable to resolve the
 * dependencies for the controller or service.
 */
@Module({
  imports: [PrismaModule],
  controllers: [FollowupsController],
  providers: [FollowupsService],
})
export class FollowupsModule {}