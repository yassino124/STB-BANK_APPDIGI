import { Document, Types } from 'mongoose';
export declare enum PayrollStatus {
    DRAFT = "DRAFT",
    VALIDATED = "VALIDATED",
    PAID = "PAID"
}
export declare class Payroll extends Document {
    employeeId: Types.ObjectId;
    mois: number;
    annee: number;
    salaireBrut: number;
    cnss: number;
    impot: number;
    prime: number;
    heuresSup: number;
    retenues: number;
    salaireNet: number;
    status: PayrollStatus;
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
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mois?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    annee?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    salaireBrut?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cnss?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
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
    heuresSup?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Payroll & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    retenues?: import("mongoose").SchemaDefinitionProperty<number, Payroll, Document<unknown, {}, Payroll, {
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
}, Payroll>;
