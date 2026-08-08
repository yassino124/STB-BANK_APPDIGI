import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    getMyPayrolls(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").Payroll, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(mois: string, annee: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").Payroll, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/payroll.schema").Payroll, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/payroll.schema").Payroll & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    generate(body: {
        mois: number;
        annee: number;
    }): Promise<any[]>;
    creditSalaries(): Promise<any[]>;
    creditSalaryForEmployee(employeeId: string, body: {
        force?: boolean;
    }): Promise<any[]>;
}
