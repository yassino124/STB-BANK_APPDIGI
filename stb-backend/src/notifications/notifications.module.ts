import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsController } from '../notifications/notifications.controller';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsListener } from './notifications.listener';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { RealtimeModule } from '../realtime/realtime.module';

import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    RealtimeModule,
    EmployeesModule,
  ],
  providers: [NotificationsService, NotificationsConsumer, NotificationsListener],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
