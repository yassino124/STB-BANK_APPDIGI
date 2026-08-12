import { Model, Types } from 'mongoose';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Card } from '../cards/schemas/card.schema';
import { Credit } from '../credits/schemas/credit.schema';
import { LeaveBalance, LeaveRequest } from '../leave/schemas/leave.schema';
import { Prime } from '../primes/schemas/prime.schema';
import { Payroll } from '../payroll/schemas/payroll.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
export declare class DashboardService {
    private empModel;
    private accountModel;
    private cardModel;
    private creditModel;
    private leaveBalanceModel;
    private leaveRequestModel;
    private primeModel;
    private payrollModel;
    private notifModel;
    private txModel;
    constructor(empModel: Model<Employee>, accountModel: Model<Account>, cardModel: Model<Card>, creditModel: Model<Credit>, leaveBalanceModel: Model<LeaveBalance>, leaveRequestModel: Model<LeaveRequest>, primeModel: Model<Prime>, payrollModel: Model<Payroll>, notifModel: Model<Notification>, txModel: Model<Transaction>);
    getEmployeeDashboard(employeeId: string): Promise<{
        employee: (import("mongoose").Document<unknown, {}, Employee, {}, import("mongoose").DefaultSchemaOptions> & Employee & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }) | null;
        accounts: (import("mongoose").Document<unknown, {}, Account, {}, import("mongoose").DefaultSchemaOptions> & Account & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
        cards: (import("mongoose").Document<unknown, {}, Card, {}, import("mongoose").DefaultSchemaOptions> & Card & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
        credits: (import("mongoose").Document<unknown, {}, Credit, {}, import("mongoose").DefaultSchemaOptions> & Credit & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        primes: (import("mongoose").Document<unknown, {}, Prime, {}, import("mongoose").DefaultSchemaOptions> & Prime & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        lastPayroll: (import("mongoose").Document<unknown, {}, Payroll, {}, import("mongoose").DefaultSchemaOptions> & Payroll & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        recentTransactions: (import("mongoose").Document<unknown, {}, Transaction, {}, import("mongoose").DefaultSchemaOptions> & Transaction & {
            _id: Types.ObjectId;
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
    getAdvancedAnalytics(): Promise<{
        hr: {
            headcount: number;
            turnover: number;
            leaveTrends: {
                name: string;
                leaves: number;
                sickness: number;
            }[];
            skillsRadar: {
                subject: string;
                A: number;
                B: number;
                fullMark: number;
            }[];
            salaryVsExperience: {
                experience: number;
                salary: number;
                role: string;
            }[];
            salaryDist: {
                name: string;
                value: any;
            }[];
        };
        finance: {
            payrollTotal: any;
            creditExposure: any;
            advancesTotal: number;
            financialRisk: {
                name: string;
                riskScore: number;
                repayments: number;
            }[];
        };
        agency: {
            totalAccounts: number;
            totalCards: number;
            transactionsTrend: {
                name: string;
                volume: number;
                alerts: number;
            }[];
            customerActivity: {
                name: string;
                value: number;
            }[];
            activityHeatmap: {
                day: string;
                hour: string;
                value: number;
            }[];
        };
    }>;
}
