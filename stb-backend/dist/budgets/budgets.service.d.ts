import { Model } from 'mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
export declare class BudgetsService {
    private budgetModel;
    constructor(budgetModel: Model<BudgetDocument>);
    create(data: Partial<Budget>): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId?: string): Promise<{
        _id: any;
        name: any;
        category: any;
        type: any;
        amount: any;
        spent: any;
        saved: any;
        period: any;
        percentage: number;
        alertThreshold: any;
        targetDate: any;
        description: any;
        startDate: any;
        endDate: any;
    }[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Budget>): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateProgress(id: string, amount: number, isSavings?: boolean): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    private checkAndNotify;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
