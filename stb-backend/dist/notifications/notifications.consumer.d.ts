import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
export declare class NotificationsConsumer {
    private notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    process(job: Job): Promise<any>;
}
