import { Model } from 'mongoose';
import { Branch, BranchDocument } from './schemas/branch.schema';
export declare class BranchesService {
    private branchModel;
    constructor(branchModel: Model<BranchDocument>);
    create(data: Partial<Branch>): Promise<import("mongoose").Document<unknown, {}, BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<Branch>): Promise<import("mongoose").Document<unknown, {}, BranchDocument, {}, import("mongoose").DefaultSchemaOptions> & Branch & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
    }>;
}
