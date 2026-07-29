import { Model } from 'mongoose';
import { AiLog, AiLogDocument } from './schemas/ai-log.schema';
export declare class AiLogsService {
    private aiLogModel;
    constructor(aiLogModel: Model<AiLogDocument>);
    create(data: Partial<AiLog>): Promise<import("mongoose").Document<unknown, {}, AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findBySession(sessionId: string): Promise<(import("mongoose").Document<unknown, {}, AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, AiLogDocument, {}, import("mongoose").DefaultSchemaOptions> & AiLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findStats(employeeId: string): Promise<{
        total: number;
        successCount: number;
        failureCount: number;
        successRate: number;
    }>;
}
