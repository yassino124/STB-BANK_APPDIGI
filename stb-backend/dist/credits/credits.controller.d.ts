import { CreditsService } from './credits.service';
export declare class CreditsController {
    private readonly creditsService;
    constructor(creditsService: CreditsService);
    create(req: any, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/credit.schema").Credit, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/credit.schema").Credit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    createForEmployee(employeeId: string, dto: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/credit.schema").Credit, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/credit.schema").Credit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/credit.schema").Credit, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/credit.schema").Credit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/credit.schema").Credit, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/credit.schema").Credit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    processMonthly(): Promise<any[]>;
    processPenalties(): Promise<any[]>;
    retryLatePayment(id: string): Promise<{
        success: boolean;
        mensualite: number;
        capital: number;
        interets: number;
        reste: number;
        status: import("./schemas/credit.schema").CreditStatus.ACTIVE | import("./schemas/credit.schema").CreditStatus.CLOSED;
    }>;
    calculateEarlyRepayment(id: string): Promise<{
        creditId: import("mongoose").Types.ObjectId;
        title: string;
        capitalRestant: number;
        moisRestants: number;
        economieInterets: number;
        fraisRemboursement: number;
        montantTotal: number;
        economieNette: number;
    }>;
    performEarlyRepayment(id: string): Promise<{
        success: boolean;
        creditId: import("mongoose").Types.ObjectId;
        montantDebite: number;
        capital: number;
        frais: number;
        economieInterets: number;
        economieNette: number;
        transactionRef: string;
    }>;
    getAmortizationTable(id: string): Promise<{
        creditId: import("mongoose").Types.ObjectId;
        title: string;
        montantInitial: number;
        montantRestant: number;
        tauxInteret: number;
        nombreMois: number;
        mensualite: number;
        dateDebut: Date;
        dateFin: Date;
        status: import("./schemas/credit.schema").CreditStatus;
        totalMensualites: number;
        totalInteretsTheoriques: number;
        totalCapitalPaye: number;
        totalInteretsPayes: number;
        moisPayes: number;
        moisRestants: number;
        progressionPct: number;
        tableau: any[];
    }>;
    getPaymentHistory(id: string): Promise<{
        creditId: import("mongoose").Types.ObjectId;
        title: string;
        totalPayments: number;
        payments: {
            id: import("mongoose").Types.ObjectId;
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
}
