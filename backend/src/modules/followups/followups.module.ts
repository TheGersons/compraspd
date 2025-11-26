import { Module } from '@nestjs/common';
import { FollowUpsController } from './followups.controller';
import { TimelineController } from './timeline.controller';
import { FollowUpsService } from './followups.service';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [
    FollowUpsController,
    TimelineController
  ],
  providers: [
    FollowUpsService,
    TimelineService,
    PrismaService
  ],
  exports: [
    FollowUpsService,
    TimelineService
  ]
})
export class FollowUpsModule {}