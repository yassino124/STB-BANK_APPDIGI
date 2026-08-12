import { Model, Types } from 'mongoose';
import { Avance, AvanceStatut, AvanceType } from './schemas/avance.schema';
import { Employee } from '../employees/employee.schema';
import { Account } from '../accounts/schemas/account.schema';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RulesService } from '../rules/rules.service';
export declare class AvancesService {
    private avanceModel;
    private employeeModel;
    private accountModel;
    private transactionModel;
    private notificationsService;
    private rulesService;
    constructor(avanceModel: Model<Avance>, employeeModel: Model<Employee>, accountModel: Model<Account>, transactionModel: Model<Transaction>, notificationsService: NotificationsService, rulesService: RulesService);
    create(employeeId: string, data: {
        type: AvanceType;
        montant: number;
        motif?: string;
    }): Promise<import("mongoose").Document<unknown, {}, Avance, {}, import("mongoose").DefaultSchemaOptions> & Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyAvances(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Avance, {}, import("mongoose").DefaultSchemaOptions> & Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllAvances(filters?: {
        statut?: AvanceStatut;
        employeeId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, Avance, {}, import("mongoose").DefaultSchemaOptions> & Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateStatut(avanceId: string, statut: AvanceStatut, approvedById?: string, rejectionReason?: string): Promise<import("mongoose").Document<unknown, {}, Avance, {}, import("mongoose").DefaultSchemaOptions> & Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAsDebited(avanceId: string, transactionId?: string): Promise<import("mongoose").Document<unknown, {}, Avance, {}, import("mongoose").DefaultSchemaOptions> & Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(avanceId: string, employeeId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
