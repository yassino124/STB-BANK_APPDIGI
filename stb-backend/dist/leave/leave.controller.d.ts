import { LeaveService } from './leave.service';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    create(req: any, dto: {
        type: string;
        dateDebut: string;
        dateFin: string;
        motif: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getBalance(req: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveBalance, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveBalance & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getPendingForManager(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingTeam(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyTeamRequests(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(status?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getPendingRh(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handleManagerApproval(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    handleRhApproval(id: string, req: any, body: {
        decision: 'APPROVED' | 'REJECTED';
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    managerApprove(id: string, req: any, body?: {
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    managerReject(id: string, req: any, body?: {
        reason?: string;
        commentaire?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    debugAll(): Promise<{
        total: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/leave.schema").LeaveRequest, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/leave.schema").LeaveRequest & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
