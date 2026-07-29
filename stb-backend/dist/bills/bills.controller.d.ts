import { BillsService } from './bills.service';
import { Bill } from './schemas/bill.schema';
export declare class BillsController {
    private readonly billsService;
    constructor(billsService: BillsService);
    create(req: any, data: Partial<Bill>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bill.schema").BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
            receivedData: Partial<Bill>;
            user: any;
        };
    };
    findByEmployee(req: any, employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/bill.schema").BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bill.schema").BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/bill.schema").BillDocument, {}, import("mongoose").DefaultSchemaOptions> & Bill & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
