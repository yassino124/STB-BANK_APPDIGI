import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRequest, LeaveRequestSchema, LeaveBalance, LeaveBalanceSchema } from './schemas/leave.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { HierarchyModule } from '../hierarchy/hierarchy.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
    ]),
    NotificationsModule,
    HierarchyModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
