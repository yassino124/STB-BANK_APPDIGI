import { Model, Types } from 'mongoose';
import { Payroll } from './schemas/payroll.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { CreditsService } from '../credits/credits.service';
export declare class PayrollService {
    private payrollModel;
    private employeeModel;
    private accountModel;
    private transactionModel;
    private notificationsService;
    private creditsService;
    constructor(payrollModel: Model<Payroll>, employeeModel: Model<Employee>, accountModel: Model<Account>, transactionModel: Model<Transaction>, notificationsService: NotificationsService, creditsService: CreditsService);
    generateMonthlyPayroll(mois: number, annee: number): Promise<any[]>;
    getMyPayrolls(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Payroll, {}, import("mongoose").DefaultSchemaOptions> & Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPayrollById(id: string): Promise<import("mongoose").Document<unknown, {}, Payroll, {}, import("mongoose").DefaultSchemaOptions> & Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllPayrolls(mois?: number, annee?: number): Promise<(import("mongoose").Document<unknown, {}, Payroll, {}, import("mongoose").DefaultSchemaOptions> & Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    creditMonthlySalaries(employeeId?: string, force?: boolean): Promise<any[]>;
    private getMonthName;
}
