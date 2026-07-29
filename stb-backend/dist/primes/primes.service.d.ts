import { Model, Types } from 'mongoose';
import { Prime } from './schemas/prime.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PrimesService {
    private primeModel;
    private notificationsService;
    constructor(primeModel: Model<Prime>, notificationsService: NotificationsService);
    create(employeeId: string, dto: {
        type: string;
        montant: number;
        description: string;
    }): Promise<import("mongoose").Document<unknown, {}, Prime, {}, import("mongoose").DefaultSchemaOptions> & Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyPrimes(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, Prime, {}, import("mongoose").DefaultSchemaOptions> & Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllPrimes(status?: string): Promise<(import("mongoose").Document<unknown, {}, Prime, {}, import("mongoose").DefaultSchemaOptions> & Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    handle(id: string, approverId: string, decision: 'APPROVED' | 'REJECTED'): Promise<import("mongoose").Document<unknown, {}, Prime, {}, import("mongoose").DefaultSchemaOptions> & Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
