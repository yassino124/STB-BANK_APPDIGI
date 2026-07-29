import { Document, Types } from 'mongoose';
export type FraudDetectionDocument = FraudDetection & Document;
export declare enum FraudType {
    CARD_FRAUD = "CARD_FRAUD",
    IDENTITY_THEFT = "IDENTITY_THEFT",
    ACCOUNT_TAKEOVER = "ACCOUNT_TAKEOVER",
    MONEY_LAUNDERING = "MONEY_LAUNDERING",
    SUSPICIOUS_PATTERN = "SUSPICIOUS_PATTERN"
}
export declare enum FraudStatus {
    INVESTIGATING = "INVESTIGATING",
    CONFIRMED = "CONFIRMED",
    DISMISSED = "DISMISSED"
}
export declare class FraudDetection {
    employeeId: Types.ObjectId;
    transactionId: Types.ObjectId | null;
    alertId: Types.ObjectId | null;
    type: FraudType;
    riskScore: number;
    factors: string[];
    details: Record<string, any>;
    status: FraudStatus;
    assignedTo: Types.ObjectId | null;
    actionTaken: string;
}
export declare const FraudDetectionSchema: import("mongoose").Schema<FraudDetection, import("mongoose").Model<FraudDetection, any, any, any, any, any, FraudDetection>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FraudDetection, Document<unknown, {}, FraudDetection, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    alertId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<FraudType, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    riskScore?: import("mongoose").SchemaDefinitionProperty<number, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    factors?: import("mongoose").SchemaDefinitionProperty<string[], FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    details?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<FraudStatus, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    assignedTo?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actionTaken?: import("mongoose").SchemaDefinitionProperty<string, FraudDetection, Document<unknown, {}, FraudDetection, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<FraudDetection & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, FraudDetection>;
