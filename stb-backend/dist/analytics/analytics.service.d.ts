import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
export declare class AnalyticsService {
    private analyticsModel;
    constructor(analyticsModel: Model<AnalyticsDocument>);
    create(data: Partial<Analytics>): Promise<import("mongoose").Document<unknown, {}, AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(period?: string, metric?: string): Promise<(import("mongoose").Document<unknown, {}, AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string, metric?: string): Promise<(import("mongoose").Document<unknown, {}, AnalyticsDocument, {}, import("mongoose").DefaultSchemaOptions> & Analytics & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAggregates(metric: string, startDate: Date, endDate: Date): Promise<any[]>;
}
