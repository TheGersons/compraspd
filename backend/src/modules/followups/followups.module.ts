import { Module } from '@nestjs/common';
import { FollowUpsController } from './followups.controller';
import { TimelineController } from './timeline.controller';
import { FollowUpsService } from './followups.service';
import { TimelineService } from './timeline.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../Mail/mail.service';

@Module({
  controllers: [
    FollowUpsController,
    TimelineController
  ],
  providers: [
    FollowUpsService,
    TimelineService,
    PrismaService,
    MailService,
  ],
  exports: [
    FollowUpsService,
    TimelineService
  ]
})
export class FollowUpsModule {}