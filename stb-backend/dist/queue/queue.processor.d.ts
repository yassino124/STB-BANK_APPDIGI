import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { PayrollService } from '../payroll/payroll.service';
import { CreditsService } from '../credits/credits.service';
import { LeaveService } from '../leave/leave.service';
import { ReportsService } from '../reports/reports.service';
import { AiLogsService } from '../ai_logs/ai-logs.service';
export declare class QueueProcessor {
    private notificationsService;
    private payrollService;
    private creditsService;
    private leaveService;
    private reportsService;
    private aiLogsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService, payrollService: PayrollService, creditsService: CreditsService, leaveService: LeaveService, reportsService: ReportsService, aiLogsService: AiLogsService);
    process(job: Job): Promise<any>;
    private processNotification;
    private processPayroll;
    private processCreditInstallment;
    private processLeaveBalance;
    private processReport;
    private processAiRequest;
}
