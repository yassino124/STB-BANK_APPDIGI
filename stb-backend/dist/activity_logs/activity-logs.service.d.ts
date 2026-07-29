import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';
export declare class ActivityLogsService {
    private activityLogModel;
    private transactionModel;
    private payrollModel;
    private leaveModel;
    private creditModel;
    private notificationModel;
    constructor(activityLogModel: Model<ActivityLogDocument>, transactionModel: Model<any>, payrollModel: Model<any>, leaveModel: Model<any>, creditModel: Model<any>, notificationModel: Model<any>);
    create(data: Partial<ActivityLog>): Promise<import("mongoose").Document<unknown, {}, ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByModule(module: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findRecent(limit?: number): Promise<(import("mongoose").Document<unknown, {}, ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyActivityTimeline(employeeId: string, limit?: number): Promise<any[]>;
}
