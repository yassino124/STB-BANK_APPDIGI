import { Model } from 'mongoose';
import { Bill, BillDocument } from './schemas/bill.schema';
export declare class BillsService {
    private billModel;
    constructor(billModel: Model<BillDocument>);
    create(data: Partial<Bill> & {
        reference?: string;
    }): Promise<import("mongoose").Document<unknown, {}, BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
