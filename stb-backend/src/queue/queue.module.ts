import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { NotificationsModule } from '../notifications/notifications.module';
import { PayrollModule } from '../payroll/payroll.module';
import { CreditsModule } from '../credits/credits.module';
import { LeaveModule } from '../leave/leave.module';
import { ReportsModule } from '../reports/reports.module';
import { AiLogsModule } from '../ai_logs/ai_logs.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
          db: config.get<number>('redis.db', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    BullModule.registerQueue({
      name: 'payroll',
    }),
    BullModule.registerQueue({
      name: 'credits',
    }),
    BullModule.registerQueue({
      name: 'leaves',
    }),
    BullModule.registerQueue({
      name: 'reports',
    }),
    BullModule.registerQueue({
      name: 'ai',
    }),
    NotificationsModule,
    PayrollModule,
    CreditsModule,
    LeaveModule,
    ReportsModule,
    AiLogsModule,
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
