import { RolesService } from './roles.service';
import { Role } from './schemas/role.schema';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(data: Partial<Role>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Role>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, import("mongoose").DefaultSchemaOptions> & Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
