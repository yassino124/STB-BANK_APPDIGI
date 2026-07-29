import { BranchesService } from './branches.service';
import { Branch } from './schemas/branch.schema';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(data: Partial<Branch>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/branch.schema").BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/branch.schema").BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/branch.schema").BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Branch>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/branch.schema").BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
