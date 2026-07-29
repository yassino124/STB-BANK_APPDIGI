import { AiLogsService } from './ai-logs.service';
import { AiLog } from './schemas/ai-log.schema';
export declare class AiLogsController {
    private readonly aiLogsService;
    constructor(aiLogsService: AiLogsService);
    create(data: Partial<AiLog>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ai-log.schema").AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findBySession(sessionId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ai-log.schema").AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ai-log.schema").AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getStats(employeeId: string): Promise<{
        total: number;
        successCount: number;
        failureCount: number;
        successRate: number;
    }>;
}
