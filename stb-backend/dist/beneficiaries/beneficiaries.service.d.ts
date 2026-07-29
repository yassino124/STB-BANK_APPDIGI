import { Model } from 'mongoose';
import { Beneficiary, BeneficiaryDocument } from './schemas/beneficiary.schema';
export declare class BeneficiariesService {
    private beneficiaryModel;
    constructor(beneficiaryModel: Model<BeneficiaryDocument>);
    create(employeeId: string, data: Partial<Beneficiary>): Promise<import("mongoose").Document<unknown, {}, BeneficiaryDocument, {}, import("mongoose").DefaultSchemaOptions> & Beneficiary & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, BeneficiaryDocument, {}, import("mongoose").DefaultSchemaOptions> & Beneficiary & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findFavorites(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, BeneficiaryDocument, {}, import("mongoose").DefaultSchemaOptions> & Beneficiary & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    update(id: string, data: Partial<Beneficiary>): Promise<import("mongoose").Document<unknown, {}, BeneficiaryDocument, {}, import("mongoose").DefaultSchemaOptions> & Beneficiary & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
