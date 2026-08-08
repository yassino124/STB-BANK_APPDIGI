import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './schemas/notification.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Employee } from '../employees/employee.schema';
export declare class NotificationsService {
    private notifModel;
    private employeeModel;
    constructor(notifModel: Model<Notification>, employeeModel: Model<Employee>);
    sendToEmployee(employeeId: string, title: string, body: string, type?: NotificationType, data?: any): Promise<import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    sendCustomNotification(dto: SendNotificationDto): Promise<(import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | (Omit<import("mongoose").Document<unknown, {}, Notification, {}, import("mongoose").DefaultSchemaOptions> & Notification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, "type" | "employeeId" | "title" | "body"> & Omit<{
        employeeId: Types.ObjectId;
        title: string;
        body: string;
        type: NotificationType;
    }, "_id">)[]>;
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
