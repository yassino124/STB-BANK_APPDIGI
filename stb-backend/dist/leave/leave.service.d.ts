import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveBalance } from './schemas/leave.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { HierarchyService } from '../hierarchy/hierarchy.service';
import { Employee } from '../employees/employee.schema';
import { RulesService } from '../rules/rules.service';
export declare class LeaveService {
    private leaveRequestModel;
    private leaveBalanceModel;
    private employeeModel;
    private notificationsService;
    private hierarchyService;
    private rulesService;
    constructor(leaveRequestModel: Model<LeaveRequest>, leaveBalanceModel: Model<LeaveBalance>, employeeModel: Model<Employee>, notificationsService: NotificationsService, hierarchyService: HierarchyService, rulesService: RulesService);
    createRequest(employeeId: string, dto: {
        type: string;
        dateDebut: string;
        dateFin: string;
        motif: string;
    }): Promise<import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyRequests(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingForManager(managerId: string): Promise<(import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyTeamRequests(managerId: string): Promise<(import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    processApproval(id: string, userId: string, userRoles: string[], decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllRequests(status?: string): Promise<(import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyBalance(employeeId: string): Promise<import("mongoose").Document<unknown, {}, LeaveBalance, {}, import("mongoose").DefaultSchemaOptions> & LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    addMonthlyBalance(days?: number): Promise<import("mongoose").UpdateWriteOpResult>;
    updateBalance(employeeId: string, days: number): Promise<import("mongoose").Document<unknown, {}, LeaveBalance, {}, import("mongoose").DefaultSchemaOptions> & LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    private getOrCreateBalance;
}
