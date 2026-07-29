import { Injectable, Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';

@Processor('notifications')
@Injectable()
export class NotificationsConsumer {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(private notificationsService: NotificationsService) {}

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing notification job ${job.id}`);
    const { employeeId, title, body, type, data } = job.data;

    try {
      await this.notificationsService.sendToEmployee(employeeId, title, body, type, data);
      return { success: true };
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
}
