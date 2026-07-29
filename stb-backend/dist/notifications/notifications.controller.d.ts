import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findMine(req: any, employeeId?: string): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        data: never[];
    } | {
        success: boolean;
        data: {
            data: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").Notification, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & Required<{
                _id: import("mongoose").Types.ObjectId;
            }> & {
                __v: number;
            } & {
                id: string;
            })[];
            total: number;
            page: number;
            limit: number;
        };
        statusCode?: undefined;
        message?: undefined;
    }>;
    getUnreadCount(req: any, employeeId?: string): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            count: number;
        };
        statusCode?: undefined;
        message?: undefined;
    }>;
    markRead(id: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").Notification, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
    }>;
    markAllRead(req: any, employeeId?: string): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("mongoose").UpdateWriteOpResult;
        statusCode?: undefined;
        message?: undefined;
    }>;
}
