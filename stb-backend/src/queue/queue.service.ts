import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('payroll') private payrollQueue: Queue,
    @InjectQueue('credits') private creditsQueue: Queue,
    @InjectQueue('leaves') private leavesQueue: Queue,
    @InjectQueue('reports') private reportsQueue: Queue,
    @InjectQueue('ai') private aiQueue: Queue,
  ) {}

  async addToNotificationQueue(jobData: any) {
    return this.notificationsQueue.add('send-notification', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async addToPayrollQueue(jobData: any) {
    return this.payrollQueue.add('process-payroll', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async addToCreditQueue(jobData: any) {
    return this.creditsQueue.add('process-credit-installment', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async addToLeaveQueue(jobData: any) {
    return this.leavesQueue.add('sync-leave-balance', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async addToReportQueue(jobData: any) {
    return this.reportsQueue.add('generate-report', jobData, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async addToAiQueue(jobData: any) {
    return this.aiQueue.add('process-ai-request', jobData, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async getJobStatus(queueName: string, jobId: string) {
    const queue = this[`${queueName}Queue`];
    if (!queue) return null;
    const job = await queue.getJob(jobId);
    if (!job) return null;
    return {
      id: job.id,
      progress: await job.progress(),
      state: await job.getState(),
      failedReason: job.failedReason,
    };
  }
}
