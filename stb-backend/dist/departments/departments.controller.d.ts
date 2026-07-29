import { DepartmentsService } from './departments.service';
import { Department } from './schemas/department.schema';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(data: Partial<Department>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getStats(): Promise<{
        total: number;
        active: number;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Department>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, import("mongoose").DefaultSchemaOptions> & Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
