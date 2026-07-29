import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
export declare class PermissionsService {
    private permissionModel;
    constructor(permissionModel: Model<PermissionDocument>);
    create(data: Partial<Permission>): Promise<import("mongoose").Document<unknown, {}, PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByResource(resource: string): Promise<(import("mongoose").Document<unknown, {}, PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    update(id: string, data: Partial<Permission>): Promise<import("mongoose").Document<unknown, {}, PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
