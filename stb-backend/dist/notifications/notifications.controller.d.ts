import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(dto: SendNotificationDto): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").Notification, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | (Omit<import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").Notification, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/notification.schema").Notification & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }, "type" | "employeeId" | "title" | "body"> & Omit<{
            employeeId: import("mongoose").Types.ObjectId;
            title: string;
            body: string;
            type: import("./schemas/notification.schema").NotificationType;
        }, "_id">)[];
    }>;
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
