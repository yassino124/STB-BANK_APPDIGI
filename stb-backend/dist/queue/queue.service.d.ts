import { Queue } from 'bull';
export declare class QueueService {
    private notificationsQueue;
    private payrollQueue;
    private creditsQueue;
    private leavesQueue;
    private reportsQueue;
    private aiQueue;
    constructor(notificationsQueue: Queue, payrollQueue: Queue, creditsQueue: Queue, leavesQueue: Queue, reportsQueue: Queue, aiQueue: Queue);
    addToNotificationQueue(jobData: any): Promise<import("bull").Job<any>>;
    addToPayrollQueue(jobData: any): Promise<import("bull").Job<any>>;
    addToCreditQueue(jobData: any): Promise<import("bull").Job<any>>;
    addToLeaveQueue(jobData: any): Promise<import("bull").Job<any>>;
    addToReportQueue(jobData: any): Promise<import("bull").Job<any>>;
    addToAiQueue(jobData: any): Promise<import("bull").Job<any>>;
    getJobStatus(queueName: string, jobId: string): Promise<{
        id: any;
        progress: any;
        state: any;
        failedReason: any;
    } | null>;
}
