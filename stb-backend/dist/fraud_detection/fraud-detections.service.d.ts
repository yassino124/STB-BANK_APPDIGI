import { Model } from 'mongoose';
import { FraudDetection, FraudDetectionDocument } from './schemas/fraud-detection.schema';
export declare class FraudDetectionsService {
    private fraudDetectionModel;
    constructor(fraudDetectionModel: Model<FraudDetectionDocument>);
    create(data: Partial<FraudDetection>): Promise<import("mongoose").Document<unknown, {}, FraudDetectionDocument, {}, import("mongoose").DefaultSchemaOptions> & FraudDetection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, FraudDetectionDocument, {}, import("mongoose").DefaultSchemaOptions> & FraudDetection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findHighRisk(threshold?: number): Promise<(import("mongoose").Document<unknown, {}, FraudDetectionDocument, {}, import("mongoose").DefaultSchemaOptions> & FraudDetection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, FraudDetectionDocument, {}, import("mongoose").DefaultSchemaOptions> & FraudDetection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string, assignedTo?: string): Promise<import("mongoose").Document<unknown, {}, FraudDetectionDocument, {}, import("mongoose").DefaultSchemaOptions> & FraudDetection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
