import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<RoleDocument>);
    create(data: Partial<Role>): Promise<import("mongoose").Document<unknown, {}, RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Role>): Promise<import("mongoose").Document<unknown, {}, RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
