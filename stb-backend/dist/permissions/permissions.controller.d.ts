import { PermissionsService } from './permissions.service';
import { Permission } from './schemas/permission.schema';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    create(data: Partial<Permission>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/permission.schema").PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/permission.schema").PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByResource(resource: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/permission.schema").PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/permission.schema").PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Permission>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/permission.schema").PermissionDocument, {}, import("mongoose").DefaultSchemaOptions> & Permission & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
