import { Model, Types } from 'mongoose';
import { Payroll, PayrollDocument, PayrollStatus } from './schemas/payroll.schema';
import { Budget, BudgetDocument, BudgetStatus } from './schemas/budget.schema';
import { Investment, InvestmentDocument, InvestmentStatus } from './schemas/investment.schema';
import { CreatePayrollDto } from './dto/payroll.dto';
import { CreateBudgetDto, UpdateBudgetProgressDto } from './dto/budget.dto';
import { CreateInvestmentDto } from './dto/investment.dto';
import { EmployeeDocument } from '../employees/employee.schema';
export declare class FinanceService {
    private readonly payrollModel;
    private readonly budgetModel;
    private readonly investmentModel;
    private readonly employeeModel;
    constructor(payrollModel: Model<PayrollDocument>, budgetModel: Model<BudgetDocument>, investmentModel: Model<InvestmentDocument>, employeeModel: Model<EmployeeDocument>);
    createPayroll(dto: CreatePayrollDto): Promise<import("mongoose").Document<unknown, {}, PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & Payroll & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getPayrolls(employeeId?: string, month?: number, year?: number): Promise<(import("mongoose").Document<unknown, {}, PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & Payroll & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPayrollById(id: string): Promise<(import("mongoose").Document<unknown, {}, PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & Payroll & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updatePayrollStatus(id: string, status: PayrollStatus, commentaire?: string, validatedBy?: string): Promise<import("mongoose").Document<unknown, {}, PayrollDocument, {}, import("mongoose").DefaultSchemaOptions> & Payroll & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createBudget(dto: CreateBudgetDto, createdBy: string): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getBudgets(department?: string, status?: string): Promise<(import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateBudgetProgress(id: string, dto: UpdateBudgetProgressDto): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateBudgetStatus(id: string, status: BudgetStatus, commentaire?: string, approvedBy?: string): Promise<import("mongoose").Document<unknown, {}, BudgetDocument, {}, import("mongoose").DefaultSchemaOptions> & Budget & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createInvestment(dto: CreateInvestmentDto): Promise<import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getInvestments(employeeId?: string, status?: string): Promise<(import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateInvestmentStatus(id: string, status: InvestmentStatus, commentaire?: string, approvedBy?: string): Promise<import("mongoose").Document<unknown, {}, InvestmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Investment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
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
