import { FinanceService } from './finance.service';
import { PayrollStatus } from './schemas/payroll.schema';
import { BudgetStatus } from './schemas/budget.schema';
import { InvestmentStatus } from './schemas/investment.schema';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    createPayroll(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getPayrolls(req: any, employeeId?: string, month?: number, year?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPayrollById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updatePayrollStatus(id: string, req: any, body: {
        status: PayrollStatus;
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createBudget(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/budget.schema").BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/budget.schema").Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getBudgets(req: any, department?: string, status?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/budget.schema").BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/budget.schema").Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateBudgetProgress(id: string, body: {
        amount: number;
        isSavings: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/budget.schema").BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/budget.schema").Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateBudgetStatus(id: string, req: any, body: {
        status: BudgetStatus;
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/budget.schema").BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/budget.schema").Budget & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createInvestment(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/investment.schema").Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getInvestments(req: any, employeeId?: string, status?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/investment.schema").Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateInvestmentStatus(id: string, req: any, body: {
        status: InvestmentStatus;
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/investment.schema").InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/investment.schema").Investment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getDashboardStats(): Promise<{
        totalPayrolls: number;
        totalPayrollAmount: any;
        pendingPayrolls: number;
        activeBudgets: number;
        totalBudgetAmount: any;
        activeInvestments: number;
    }>;
}
