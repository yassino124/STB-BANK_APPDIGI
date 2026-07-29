import { RechargesService } from './recharges.service';
import { Recharge } from './schemas/recharge.schema';
export declare class RechargesController {
    private readonly rechargesService;
    constructor(rechargesService: RechargesService);
    create(req: any, data: Partial<Recharge>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/recharge.schema").RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }> | {
        success: boolean;
        statusCode: number;
        message: string;
        debug: {
            receivedData: Partial<Recharge>;
            user: any;
        };
    };
    findByEmployee(req: any, employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/recharge.schema").RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/recharge.schema").RechargeDocument, {}, import("mongoose").DefaultSchemaOptions> & Recharge & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
