import { Document, Types } from 'mongoose';
export type BudgetDocument = Budget & Document;
export declare enum BudgetStatus {
    DRAFT = "DRAFT",
    APPROVED = "APPROVED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Budget extends Document {
    name: string;
    department: string;
    amount: number;
    spent: number;
    savings: number;
    status: BudgetStatus;
    createdBy: Types.ObjectId;
    approvedBy: Types.ObjectId;
    approvedAt: Date;
    commentaire: string;
    metadata: Record<string, any>;
}
export declare const BudgetSchema: import("mongoose").Schema<Budget, import("mongoose").Model<Budget, any, any, any, any, any, Budget>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Budget, Document<unknown, {}, Budget, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<BudgetStatus, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    spent?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    department?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    savings?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Budget>;
