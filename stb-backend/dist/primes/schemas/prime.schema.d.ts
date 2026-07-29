import { Document, Types } from 'mongoose';
export declare enum PrimeType {
    PERFORMANCE = "PERFORMANCE",
    AID = "AID",
    RAMADAN = "RAMADAN",
    VACANCES = "VACANCES",
    ANCIENNETE = "ANCIENNETE",
    EXCEPTIONNELLE = "EXCEPTIONNELLE"
}
export declare enum PrimeStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PAID = "PAID"
}
export declare class Prime extends Document {
    employeeId: Types.ObjectId;
    type: PrimeType;
    montant: number;
    status: PrimeStatus;
    description: string;
    approvedBy: Types.ObjectId;
    approvedAt: Date;
    payrollId: Types.ObjectId;
}
export declare const PrimeSchema: import("mongoose").Schema<Prime, import("mongoose").Model<Prime, any, any, any, any, any, Prime>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Prime, Document<unknown, {}, Prime, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<PrimeType, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<PrimeStatus, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montant?: import("mongoose").SchemaDefinitionProperty<number, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    payrollId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Prime, Document<unknown, {}, Prime, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Prime & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Prime>;
