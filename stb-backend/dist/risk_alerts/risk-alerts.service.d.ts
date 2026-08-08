import { Model } from 'mongoose';
import { RiskAlert, RiskAlertDocument } from './schemas/risk-alert.schema';
export declare class RiskAlertsService {
    private riskAlertModel;
    constructor(riskAlertModel: Model<RiskAlertDocument>);
    create(data: Partial<RiskAlert>): Promise<import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(limit?: number): Promise<(import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOpen(): Promise<(import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string, resolvedBy?: string): Promise<import("mongoose").Document<unknown, {}, RiskAlertDocument, {}, import("mongoose").DefaultSchemaOptions> & RiskAlert & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
