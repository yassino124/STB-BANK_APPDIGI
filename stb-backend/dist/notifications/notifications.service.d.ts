import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
export declare class NotificationsService {
    private notifModel;
    constructor(notifModel: Model<Notification>);
    sendToEmployee(employeeId: string, title: string, body: string, type?: NotificationType, data?: any): Promise<import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyNotifications(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUnreadCount(employeeId: string): Promise<number>;
    markRead(id: string): Promise<(import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    markAllRead(employeeId: string): Promise<import("mongoose").UpdateWriteOpResult>;
}
