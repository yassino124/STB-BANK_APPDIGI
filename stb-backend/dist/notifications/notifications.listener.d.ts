import { NotificationsService } from './notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class NotificationsListener {
    private readonly notificationsService;
    private readonly realtimeGateway;
    constructor(notificationsService: NotificationsService, realtimeGateway: RealtimeGateway);
    handleTransferCompleted(payload: any): Promise<void>;
    handleFraudDetected(payload: any): Promise<void>;
}
