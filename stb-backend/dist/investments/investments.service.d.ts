import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from './schemas/investment.schema';
export declare class InvestmentsService {
    private investmentModel;
    constructor(investmentModel: Model<InvestmentDocument>);
    create(data: Partial<Investment>): Promise<import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId?: string): Promise<{
        _id: any;
        name: any;
        type: any;
        amount: any;
        returns: number;
        roi: number;
        status: any;
        startDate: any;
        riskLevel: any;
    }[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Investment>): Promise<import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
