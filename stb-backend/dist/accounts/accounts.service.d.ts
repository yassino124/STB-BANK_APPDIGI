import { Model, Types } from 'mongoose';
import { Account, AccountType } from './schemas/account.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AccountsService {
    private accountModel;
    private transactionModel;
    private eventEmitter;
    constructor(accountModel: Model<Account>, transactionModel: Model<Transaction>, eventEmitter: EventEmitter2);
    createForEmployee(employeeId: string, type?: AccountType, initialBalance?: number): Promise<Account>;
    getMyAccounts(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByEmployeeId(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updateBalance(accountId: string, delta: number): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    findByRIB(rib: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    credit(accountId: string, montant: number, description: string, metadata?: any): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    debit(accountId: string, montant: number, description: string, metadata?: any): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    private enforceSpendingLimits;
    resetDailyLimits(): Promise<void>;
    resetMonthlyLimits(): Promise<void>;
    freeze(id: string, reason?: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    unfreeze(id: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    close(id: string): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    getAllAccounts(): Promise<(import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAccountStats(): Promise<{
        total: number;
        active: number;
        frozen: number;
        closed: number;
        totalBalance: any;
    }>;
    deposit(accountId: string, amount: number): Promise<{
        success: boolean;
        message: string;
        account: (import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }) | null;
        transaction: import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
