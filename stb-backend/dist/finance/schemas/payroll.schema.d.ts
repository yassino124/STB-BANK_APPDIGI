import { Document, Types } from 'mongoose';
export type PayrollDocument = Payroll & Document;
export declare enum PayrollStatus {
    DRAFT = "DRAFT",
    GENERATED = "GENERATED",
    APPROVED = "APPROVED",
    PAID = "PAID"
}
export declare class Payroll extends Document {
    employeeId: Types.ObjectId;
    month: number;
    year: number;
    salaireBase: number;
    prime: number;
    avancesDeduites: number;
    creditsDeduits: number;
    impot: number;
    securiteSociale: number;
    salaireNet: number;
    status: PayrollStatus;
    validatedBy: Types.ObjectId;
    validatedAt: Date;
    commentaire: string;
    metadata: Record<string, any>;
}
export declare const PayrollSchema: import("mongoose").Schema<Payroll, import("mongoose").Model<Payroll, any, any, any, any, any, Payroll>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payroll, Document<unknown, {}, Payroll, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<PayrollStatus, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    prime?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    salaireBase?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    year?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    impot?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    salaireNet?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    month?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    avancesDeduites?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    creditsDeduits?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    securiteSociale?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Payroll>;
