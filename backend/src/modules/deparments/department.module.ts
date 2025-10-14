import { Module } from '@nestjs/common';
import { DeparmentService } from './deparment.service';
import { DeparmentController } from './department.controller';

@Module({
  controllers: [DeparmentController],
  providers: [DeparmentService],
  exports: [DeparmentService],
})
export class DepartmentModule {}

