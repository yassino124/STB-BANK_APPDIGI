import { Injectable, Logger } from '@nestjs/common';
import { Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { PayrollService } from '../payroll/payroll.service';
import { CreditsService } from '../credits/credits.service';
import { LeaveService } from '../leave/leave.service';
import { ReportsService } from '../reports/reports.service';
import { AiLogsService } from '../ai_logs/ai-logs.service';

@Processor('notifications')
@Processor('payroll')
@Processor('credits')
@Processor('leaves')
@Processor('reports')
@Processor('ai')
@Injectable()
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private payrollService: PayrollService,
    private creditsService: CreditsService,
    private leaveService: LeaveService,
    private reportsService: ReportsService,
    private aiLogsService: AiLogsService,
  ) {
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    try {
      switch (job.name) {
        case 'send-notification':
          return this.processNotification(job);
        case 'process-payroll':
          return this.processPayroll(job);
        case 'process-credit-installment':
          return this.processCreditInstallment(job);
        case 'sync-leave-balance':
          return this.processLeaveBalance(job);
        case 'generate-report':
          return this.processReport(job);
        case 'process-ai-request':
          return this.processAiRequest(job);
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processNotification(job: Job) {
    const { employeeId, title, body, type, data } = job.data;
    await this.notificationsService.sendToEmployee(employeeId, title, body, type, data);
    return { success: true, message: 'Notification sent' };
  }

  private async processPayroll(job: Job) {
    const { mois, annee } = job.data;
    return this.payrollService.generateMonthlyPayroll(mois, annee);
  }

  private async processCreditInstallment(job: Job) {
    const { creditId } = job.data;
    return this.creditsService.processMonthlyInstallment(creditId);
  }

  private async processLeaveBalance(job: Job) {
    const { employeeId, days } = job.data;
    return this.leaveService.updateBalance(employeeId, days);
  }

  private async processReport(job: Job) {
    const { reportId } = job.data;
    return this.reportsService.generateReport(reportId);
  }

  private async processAiRequest(job: Job) {
    const { employeeId, prompt, sessionId } = job.data;
    return this.aiLogsService.create({
      employeeId,
      prompt,
      response: 'AI response placeholder',
      sessionId,
    });
  }
}
