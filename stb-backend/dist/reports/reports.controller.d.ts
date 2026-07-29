import { ReportsService } from './reports.service';
import { Report } from './schemas/report.schema';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(data: Partial<Report>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/report.schema").ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/report.schema").ReportDocument, {}, import("mongoose").DefaultSchemaOptions> & Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
