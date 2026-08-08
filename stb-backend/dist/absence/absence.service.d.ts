import { Model, Types } from 'mongoose';
import { Absence, AbsenceDocument } from './schemas/absence.schema';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { EmployeeDocument } from '../employees/employee.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AbsenceService {
    private readonly absenceModel;
    private readonly employeeModel;
    private readonly notificationsService;
    constructor(absenceModel: Model<AbsenceDocument>, employeeModel: Model<EmployeeDocument>, notificationsService: NotificationsService);
    create(employeeId: string, dto: CreateAbsenceDto): Promise<import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyAbsences(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingForManager(managerId: string): Promise<(import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyTeamAbsences(managerId: string): Promise<(import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingForRh(): Promise<(import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(status?: string): Promise<(import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handleManagerApproval(absenceId: string, managerId: string, decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    handleRhApproval(absenceId: string, rhId: string, decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    cancel(absenceId: string, employeeId: string): Promise<import("mongoose").Document<unknown, {}, AbsenceDocument, {}, import("mongoose").DefaultSchemaOptions> & Absence & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
