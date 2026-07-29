import { PayrollStatus } from '../schemas/payroll.schema';
export declare class CreatePayrollDto {
    employeeId: string;
    month: number;
    year: number;
    salaireBase: number;
    prime?: number;
    avancesDeduites?: number;
    creditsDeduits?: number;
    impot?: number;
    securiteSociale?: number;
}
export declare class UpdatePayrollStatusDto {
    status: PayrollStatus;
    commentaire?: string;
}
