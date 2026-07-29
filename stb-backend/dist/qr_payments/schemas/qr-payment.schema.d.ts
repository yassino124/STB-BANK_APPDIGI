import { Document, Types } from 'mongoose';
export type QrPaymentDocument = QrPayment & Document;
export declare enum QrPaymentType {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC"
}
export declare enum QrPaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare class QrPayment {
    employeeId: Types.ObjectId;
    type: QrPaymentType;
    amount: number;
    currency: string;
    merchantName: string;
    merchantId: string;
    status: QrPaymentStatus;
    qrData: string;
    expiresAt: Date;
    completedAt: Date | null;
    accountId: Types.ObjectId;
}
export declare const QrPaymentSchema: import("mongoose").Schema<QrPayment, import("mongoose").Model<QrPayment, any, any, any, any, any, QrPayment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QrPayment, Document<unknown, {}, QrPayment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<QrPaymentType, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    merchantName?: import("mongoose").SchemaDefinitionProperty<string, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    merchantId?: import("mongoose").SchemaDefinitionProperty<string, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<QrPaymentStatus, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    qrData?: import("mongoose").SchemaDefinitionProperty<string, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    completedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, QrPayment, Document<unknown, {}, QrPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QrPayment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, QrPayment>;
