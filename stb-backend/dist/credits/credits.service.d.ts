import { Model, Types } from 'mongoose';
import { Credit, CreditPayment, CreditStatus } from './schemas/credit.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Employee } from '../employees/employee.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RulesService } from '../rules/rules.service';
export declare class CreditsService {
    private creditModel;
    private paymentModel;
    private accountModel;
    private employeeModel;
    private transactionModel;
    private notificationsService;
    private rulesService;
    constructor(creditModel: Model<Credit>, paymentModel: Model<CreditPayment>, accountModel: Model<Account>, employeeModel: Model<Employee>, transactionModel: Model<Transaction>, notificationsService: NotificationsService, rulesService: RulesService);
    create(employeeId: string, data: {
        title: string;
        type: string;
        montantInitial: number;
        tauxInteret: number;
        nombreMois: number;
        dateDebut: Date;
    }): Promise<import("mongoose").Document<unknown, {}, Credit, {}, import("mongoose").DefaultSchemaOptions> & Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyCredits(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Credit, {}, import("mongoose").DefaultSchemaOptions> & Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllCredits(): Promise<(import("mongoose").Document<unknown, {}, Credit, {}, import("mongoose").DefaultSchemaOptions> & Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    processLatePaymentPenalties(): Promise<any[]>;
    retryLatePayment(creditId: string): Promise<{
        success: boolean;
        mensualite: number;
        capital: number;
        interets: number;
        reste: number;
        status: CreditStatus.ACTIVE | CreditStatus.CLOSED;
    }>;
    calculateEarlyRepayment(creditId: string): Promise<{
        creditId: Types.ObjectId;
        title: string;
        capitalRestant: number;
        moisRestants: number;
        economieInterets: number;
        fraisRemboursement: number;
        montantTotal: number;
        economieNette: number;
    }>;
    performEarlyRepayment(creditId: string): Promise<{
        success: boolean;
        creditId: Types.ObjectId;
        montantDebite: number;
        capital: number;
        frais: number;
        economieInterets: number;
        economieNette: number;
        transactionRef: string;
    }>;
    generateAmortizationTable(creditId: string): Promise<{
        creditId: Types.ObjectId;
        title: string;
        montantInitial: number;
        montantRestant: number;
        tauxInteret: number;
        nombreMois: number;
        mensualite: number;
        dateDebut: Date;
        dateFin: Date;
        status: CreditStatus;
        totalMensualites: number;
        totalInteretsTheoriques: number;
        totalCapitalPaye: number;
        totalInteretsPayes: number;
        moisPayes: number;
        moisRestants: number;
        progressionPct: number;
        tableau: any[];
    }>;
    getPaymentHistory(creditId: string): Promise<{
        creditId: Types.ObjectId;
        title: string;
        totalPayments: number;
        payments: {
            id: Types.ObjectId;
            datePaiement: Date;
            montant: number;
            capital: number;
            interets: number;
            montantRestantApres: number;
            mode: string;
            isLate: boolean;
            penalite: number;
            transactionRef: any;
        }[];
    }>;
    processMonthlyCreditDeductions(): Promise<any[]>;
    processMonthlyInstallment(creditId: string): Promise<{
        success: boolean;
        message: string;
        creditId?: undefined;
        mensualite?: undefined;
        capital?: undefined;
        interets?: undefined;
        reste?: undefined;
        transactionRef?: undefined;
    } | {
        success: boolean;
        creditId: Types.ObjectId;
        mensualite: number;
        capital: number;
        interets: number;
        reste: number;
        transactionRef: string;
        message?: undefined;
    }>;
}
