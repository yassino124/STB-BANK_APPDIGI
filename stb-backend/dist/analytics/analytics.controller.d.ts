import { AnalyticsService } from './analytics.service';
import { Analytics } from './schemas/analytics.schema';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    create(data: Partial<Analytics>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/analytics.schema").AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(period?: string, metric?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/analytics.schema").AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string, metric?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/analytics.schema").AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAggregates(metric: string, startDate: string, endDate: string): Promise<any[]>;
}
