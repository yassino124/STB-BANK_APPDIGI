import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveBalance } from './schemas/leave.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { HierarchyService } from '../hierarchy/hierarchy.service';
export declare class LeaveService {
    private leaveRequestModel;
    private leaveBalanceModel;
    private notificationsService;
    private hierarchyService;
    constructor(leaveRequestModel: Model<LeaveRequest>, leaveBalanceModel: Model<LeaveBalance>, notificationsService: NotificationsService, hierarchyService: HierarchyService);
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
    handleManagerApproval(id: string, managerId: string, decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    handleRhApproval(id: string, rhId: string, decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & LeaveRequest & Required<{
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
