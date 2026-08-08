import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMyDashboard(req: any): Promise<{
        employee: (import("mongoose").Document<unknown, {}, import("../employees/employee.schema").Employee, {}, import("mongoose").DefaultSchemaOptions> & import("../employees/employee.schema").Employee & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }) | null;
        accounts: (import("mongoose").Document<unknown, {}, import("../accounts/schemas/account.schema").Account, {}, import("mongoose").DefaultSchemaOptions> & import("../accounts/schemas/account.schema").Account & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
        cards: (import("mongoose").Document<unknown, {}, import("../cards/schemas/card.schema").Card, {}, import("mongoose").DefaultSchemaOptions> & import("../cards/schemas/card.schema").Card & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
        credits: (import("mongoose").Document<unknown, {}, import("../credits/schemas/credit.schema").Credit, {}, import("mongoose").DefaultSchemaOptions> & import("../credits/schemas/credit.schema").Credit & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        primes: (import("mongoose").Document<unknown, {}, import("../primes/schemas/prime.schema").Prime, {}, import("mongoose").DefaultSchemaOptions> & import("../primes/schemas/prime.schema").Prime & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        lastPayroll: (import("mongoose").Document<unknown, {}, import("../payroll/schemas/payroll.schema").Payroll, {}, import("mongoose").DefaultSchemaOptions> & import("../payroll/schemas/payroll.schema").Payroll & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        recentTransactions: (import("mongoose").Document<unknown, {}, import("../transactions/schemas/transaction.schema").Transaction, {}, import("mongoose").DefaultSchemaOptions> & import("../transactions/schemas/transaction.schema").Transaction & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
        summary: {
            totalBalance: number;
            totalCreditRestant: number;
            soldeCongesDisponible: number;
            unreadNotifications: number;
            salaireNet: number;
            primeMontant: number;
        };
    }>;
    getRhDashboard(): Promise<{
        stats: {
            totalEmployees: number;
            activeEmployees: number;
            pendingLeaves: number;
            pendingPrimes: number;
            totalPayrollMasse: any;
        };
    }>;
    getItDashboard(): Promise<{
        metrics: {
            apiRequestsToday: number;
            connectedUsers: number;
            errorsToday: number;
            cpu: number;
            ram: number;
            storage: number;
            failedLogins: number;
            blockedAccounts: number;
            suspiciousActivity: number;
            lastBackup: string;
        };
    }>;
}
