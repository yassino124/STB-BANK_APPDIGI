import { RiskAlertsService } from './risk-alerts.service';
import { RiskAlert } from './schemas/risk-alert.schema';
export declare class RiskAlertsController {
    private readonly riskAlertsService;
    constructor(riskAlertsService: RiskAlertsService);
    create(data: Partial<RiskAlert>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getSummary(): Promise<{
        total: number;
        open: number;
        critical: number;
        resolved: number;
        active: number;
    }>;
    getMonthlyStats(months?: number): Promise<{
        month: string;
        year: any;
        total: any;
        critical: any;
        resolved: any;
    }[]>;
    findOpen(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string, resolvedBy?: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/risk-alert.schema").RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
