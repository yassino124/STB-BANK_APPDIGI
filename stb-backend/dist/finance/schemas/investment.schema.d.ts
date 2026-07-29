import { Document, Types } from 'mongoose';
export type InvestmentDocument = Investment & Document;
export declare enum InvestmentStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare class Investment extends Document {
    employeeId: Types.ObjectId;
    name: string;
    amount: number;
    expectedReturn: number;
    actualReturn: number;
    status: InvestmentStatus;
    approvedBy: Types.ObjectId;
    approvedAt: Date;
    commentaire: string;
    metadata: Record<string, any>;
}
export declare const InvestmentSchema: import("mongoose").Schema<Investment, import("mongoose").Model<Investment, any, any, any, any, any, Investment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Investment, Document<unknown, {}, Investment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<InvestmentStatus, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expectedReturn?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actualReturn?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Investment>;
