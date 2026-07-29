import { Document, Types } from 'mongoose';
export type BeneficiaryDocument = Beneficiary & Document;
export declare class Beneficiary {
    employeeId: Types.ObjectId;
    name: string;
    rib: string;
    bankName: string;
    accountType: string;
    isFavorite: boolean;
    isInternal: boolean;
    metadata: Record<string, any>;
}
export declare const BeneficiarySchema: import("mongoose").Schema<Beneficiary, import("mongoose").Model<Beneficiary, any, any, any, any, any, Beneficiary>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Beneficiary, Document<unknown, {}, Beneficiary, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rib?: import("mongoose").SchemaDefinitionProperty<string, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bankName?: import("mongoose").SchemaDefinitionProperty<string, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountType?: import("mongoose").SchemaDefinitionProperty<string, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isFavorite?: import("mongoose").SchemaDefinitionProperty<boolean, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isInternal?: import("mongoose").SchemaDefinitionProperty<boolean, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Beneficiary, Document<unknown, {}, Beneficiary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Beneficiary & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Beneficiary>;
