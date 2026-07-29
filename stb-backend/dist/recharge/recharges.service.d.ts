import { Model } from 'mongoose';
import { Recharge, RechargeDocument } from './schemas/recharge.schema';
export declare class RechargesService {
    private rechargeModel;
    constructor(rechargeModel: Model<RechargeDocument>);
    create(data: Partial<Recharge>): Promise<import("mongoose").Document<unknown, {}, RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
