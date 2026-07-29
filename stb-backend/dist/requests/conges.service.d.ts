import { Model } from 'mongoose';
import { Conge, CongeType } from './schemas/conge.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
export declare class CongesService {
    private congeModel;
    private employeeModel;
    private accountModel;
    private transactionModel;
    constructor(congeModel: Model<Conge>, employeeModel: Model<Employee>, accountModel: Model<Account>, transactionModel: Model<Transaction>);
    createCongeRequest(employeeId: string, type: CongeType, startDate: Date, endDate: Date, motif?: string): Promise<Conge>;
    private validateCongeRequest;
    private calculateDuration;
    approveConge(congeId: string, approverId: string, role: 'MANAGER' | 'RH' | 'DG'): Promise<Conge>;
    private deductSolde;
    refuseConge(congeId: string, reason: string): Promise<Conge>;
    uploadJustificatif(congeId: string, file: {
        filename: string;
        url: string;
        mimetype: string;
    }): Promise<Conge>;
    getMyConges(employeeId: string): Promise<Conge[]>;
    getAllConges(filters?: {
        statut?: string;
        employeeId?: string;
    }): Promise<Conge[]>;
    getTeamCalendar(managerId: string, month: number, year: number): Promise<Conge[]>;
    handleYearEndConges(): Promise<void>;
}
