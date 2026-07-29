import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Payroll, PayrollSchema } from '../payroll/schemas/payroll.schema';
import { LeaveRequest, LeaveRequestSchema } from '../leave/schemas/leave.schema';
import { Credit, CreditSchema } from '../credits/schemas/credit.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Payroll.name, schema: PayrollSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: Credit.name, schema: CreditSchema },
      { name: Notification.name, schema: NotificationSchema },
    ])
  ],
  providers: [ActivityLogsService],
  controllers: [ActivityLogsController],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
