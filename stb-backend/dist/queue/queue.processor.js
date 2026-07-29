"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueProcessor = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const notifications_service_1 = require("../notifications/notifications.service");
const payroll_service_1 = require("../payroll/payroll.service");
const credits_service_1 = require("../credits/credits.service");
const leave_service_1 = require("../leave/leave.service");
const reports_service_1 = require("../reports/reports.service");
const ai_logs_service_1 = require("../ai_logs/ai-logs.service");
let QueueProcessor = QueueProcessor_1 = class QueueProcessor {
    notificationsService;
    payrollService;
    creditsService;
    leaveService;
    reportsService;
    aiLogsService;
    logger = new common_1.Logger(QueueProcessor_1.name);
    constructor(notificationsService, payrollService, creditsService, leaveService, reportsService, aiLogsService) {
        this.notificationsService = notificationsService;
        this.payrollService = payrollService;
        this.creditsService = creditsService;
        this.leaveService = leaveService;
        this.reportsService = reportsService;
        this.aiLogsService = aiLogsService;
    }
    async process(job) {
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
        }
        catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processNotification(job) {
        const { employeeId, title, body, type, data } = job.data;
        await this.notificationsService.sendToEmployee(employeeId, title, body, type, data);
        return { success: true, message: 'Notification sent' };
    }
    async processPayroll(job) {
        const { mois, annee } = job.data;
        return this.payrollService.generateMonthlyPayroll(mois, annee);
    }
    async processCreditInstallment(job) {
        const { creditId } = job.data;
        return this.creditsService.processMonthlyInstallment(creditId);
    }
    async processLeaveBalance(job) {
        const { employeeId, days } = job.data;
        return this.leaveService.updateBalance(employeeId, days);
    }
    async processReport(job) {
        const { reportId } = job.data;
        return this.reportsService.generateReport(reportId);
    }
    async processAiRequest(job) {
        const { employeeId, prompt, sessionId } = job.data;
        return this.aiLogsService.create({
            employeeId,
            prompt,
            response: 'AI response placeholder',
            sessionId,
        });
    }
};
exports.QueueProcessor = QueueProcessor;
exports.QueueProcessor = QueueProcessor = QueueProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    (0, bull_1.Processor)('payroll'),
    (0, bull_1.Processor)('credits'),
    (0, bull_1.Processor)('leaves'),
    (0, bull_1.Processor)('reports'),
    (0, bull_1.Processor)('ai'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        payroll_service_1.PayrollService,
        credits_service_1.CreditsService,
        leave_service_1.LeaveService,
        reports_service_1.ReportsService,
        ai_logs_service_1.AiLogsService])
], QueueProcessor);
//# sourceMappingURL=queue.processor.js.map