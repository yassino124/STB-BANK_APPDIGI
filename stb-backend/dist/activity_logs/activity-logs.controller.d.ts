import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './schemas/activity-log.schema';
export declare class ActivityLogsController {
    private readonly activityLogsService;
    constructor(activityLogsService: ActivityLogsService);
    create(data: Partial<ActivityLog>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByModule(module: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findRecent(limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/activity-log.schema").ActivityLogDocument, {}, import("mongoose").DefaultSchemaOptions> & ActivityLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
