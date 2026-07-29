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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = class QueueService {
    notificationsQueue;
    payrollQueue;
    creditsQueue;
    leavesQueue;
    reportsQueue;
    aiQueue;
    constructor(notificationsQueue, payrollQueue, creditsQueue, leavesQueue, reportsQueue, aiQueue) {
        this.notificationsQueue = notificationsQueue;
        this.payrollQueue = payrollQueue;
        this.creditsQueue = creditsQueue;
        this.leavesQueue = leavesQueue;
        this.reportsQueue = reportsQueue;
        this.aiQueue = aiQueue;
    }
    async addToNotificationQueue(jobData) {
        return this.notificationsQueue.add('send-notification', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async addToPayrollQueue(jobData) {
        return this.payrollQueue.add('process-payroll', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async addToCreditQueue(jobData) {
        return this.creditsQueue.add('process-credit-installment', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async addToLeaveQueue(jobData) {
        return this.leavesQueue.add('sync-leave-balance', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async addToReportQueue(jobData) {
        return this.reportsQueue.add('generate-report', jobData, {
            attempts: 2,
            backoff: { type: 'exponential', delay: 2000 },
        });
    }
    async addToAiQueue(jobData) {
        return this.aiQueue.add('process-ai-request', jobData, {
            attempts: 2,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async getJobStatus(queueName, jobId) {
        const queue = this[`${queueName}Queue`];
        if (!queue)
            return null;
        const job = await queue.getJob(jobId);
        if (!job)
            return null;
        return {
            id: job.id,
            progress: await job.progress(),
            state: await job.getState(),
            failedReason: job.failedReason,
        };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('notifications')),
    __param(1, (0, bull_1.InjectQueue)('payroll')),
    __param(2, (0, bull_1.InjectQueue)('credits')),
    __param(3, (0, bull_1.InjectQueue)('leaves')),
    __param(4, (0, bull_1.InjectQueue)('reports')),
    __param(5, (0, bull_1.InjectQueue)('ai')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map