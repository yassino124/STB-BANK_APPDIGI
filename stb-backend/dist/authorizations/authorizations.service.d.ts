import { Model, Types } from 'mongoose';
import { Authorization } from './schemas/authorization.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthorizationsService {
    private authModel;
    private notificationsService;
    constructor(authModel: Model<Authorization>, notificationsService: NotificationsService);
    create(employeeId: string, dto: {
        type: string;
        date: string;
        heureDebut?: string;
        heureFin?: string;
        motif?: string;
    }): Promise<import("mongoose").Document<unknown, {}, Authorization, {}, import("mongoose").DefaultSchemaOptions> & Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMine(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Authorization, {}, import("mongoose").DefaultSchemaOptions> & Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAll(status?: string): Promise<(import("mongoose").Document<unknown, {}, Authorization, {}, import("mongoose").DefaultSchemaOptions> & Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handle(id: string, approverId: string, decision: 'APPROVED' | 'REJECTED', commentaire?: string): Promise<import("mongoose").Document<unknown, {}, Authorization, {}, import("mongoose").DefaultSchemaOptions> & Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
