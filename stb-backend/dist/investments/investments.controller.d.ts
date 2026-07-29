import { InvestmentsService } from './investments.service';
import { Investment } from './schemas/investment.schema';
export declare class InvestmentsController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    create(data: Partial<Investment>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Investment>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
