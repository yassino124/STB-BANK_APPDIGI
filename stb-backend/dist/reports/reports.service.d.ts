import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
export declare class ReportsService {
    private reportModel;
    constructor(reportModel: Model<ReportDocument>);
    create(data: Partial<Report>): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    generateReport(reportId: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
