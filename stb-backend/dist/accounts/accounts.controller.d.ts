import { AccountsService } from './accounts.service';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/account.schema").Account & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/account.schema").Account & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createForEmployee(employeeId: string, body: {
        type?: any;
        initialBalance?: number;
    }): Promise<import("./schemas/account.schema").Account>;
    freeze(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/account.schema").Account & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    unfreeze(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/account.schema").Account & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    deposit(id: string, body: {
        amount: number;
    }): Promise<{
        success: boolean;
        message: string;
        account: (import("mongoose").Document<unknown, {}, import("./schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/account.schema").Account & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }) | null;
        transaction: import("mongoose").Document<unknown, {}, import("../transactions/schemas/transaction.schema").Transaction, {}, import("mongoose").DefaultSchemaOptions> & import("../transactions/schemas/transaction.schema").Transaction & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
