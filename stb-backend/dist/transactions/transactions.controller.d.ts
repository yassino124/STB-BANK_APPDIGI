import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findMine(req: any, employeeId?: string): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        data: never[];
    } | {
        success: boolean;
        data: {
            data: {
                sens: string;
                employeeId: import("mongoose").Types.ObjectId;
                montant: number;
                type: import("./schemas/transaction.schema").TransactionType;
                description: string;
                status: import("./schemas/transaction.schema").TransactionStatus;
                date: Date;
                from: import("mongoose").Types.ObjectId | null;
                to: import("mongoose").Types.ObjectId | null;
                accountId: import("mongoose").Types.ObjectId;
                toAccountId: import("mongoose").Types.ObjectId | null;
                cardId: import("mongoose").Types.ObjectId | null;
                reference: string;
                fee: number;
                exchangeRate: number;
                originalAmount: number;
                originalCurrency: string;
                category: import("./schemas/transaction.schema").TransactionCategory;
                subcategory: string;
                location: string;
                merchantName: string;
                merchantCategoryCode: string;
                isRecurring: boolean;
                recurringId: string;
                tags: string[];
                fraudScore: number;
                riskLevel: "LOW" | "MEDIUM" | "HIGH";
                metadata: Record<string, any>;
                _id: import("mongoose").Types.ObjectId;
                __v: number;
            }[];
            total: number;
            page: number;
            limit: number;
        };
        statusCode?: undefined;
        message?: undefined;
    }>;
    transfer(req: any, body: any): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        debug: {
            receivedBody: any;
            amount?: undefined;
        };
        data?: undefined;
    } | {
        success: boolean;
        statusCode: number;
        message: string;
        debug: {
            receivedBody: any;
            amount: any;
        };
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        statusCode?: undefined;
        message?: undefined;
        debug?: undefined;
    }>;
    findEmployeeTx(id: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/transaction.schema").Transaction, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/transaction.schema").Transaction & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
