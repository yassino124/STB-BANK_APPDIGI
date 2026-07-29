import { Document, Types } from 'mongoose';
export type BillDocument = Bill & Document;
export declare enum BillType {
    ELECTRICITY = "ELECTRICITY",
    WATER = "WATER",
    GAS = "GAS",
    INTERNET = "INTERNET",
    PHONE = "PHONE",
    TV = "TV",
    INSURANCE = "INSURANCE",
    OTHER = "OTHER",
    STEG = "STEG",
    SONEDE = "SONEDE",
    TOPNET = "TOPNET",
    TELECOM = "TELECOM",
    TGM = "TGM"
}
export declare enum BillStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    CANCELLED = "CANCELLED"
}
export declare class Bill {
    employeeId: Types.ObjectId;
    billerId: string;
    billerName: string;
    billType: BillType;
    referenceNumber: string;
    amount: number;
    currency: string;
    status: BillStatus;
    dueDate: Date;
    paidAt: Date | null;
    accountId: Types.ObjectId | null;
    transactionId: Types.ObjectId | null;
}
export declare const BillSchema: import("mongoose").Schema<Bill, import("mongoose").Model<Bill, any, any, any, any, any, Bill>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Bill, Document<unknown, {}, Bill, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    billerId?: import("mongoose").SchemaDefinitionProperty<string, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    billerName?: import("mongoose").SchemaDefinitionProperty<string, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    billType?: import("mongoose").SchemaDefinitionProperty<BillType, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    referenceNumber?: import("mongoose").SchemaDefinitionProperty<string, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<BillStatus, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dueDate?: import("mongoose").SchemaDefinitionProperty<Date, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paidAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Bill, Document<unknown, {}, Bill, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Bill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Bill>;
