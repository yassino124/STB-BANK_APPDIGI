import { Document, Types } from 'mongoose';
export type RiskAlertDocument = RiskAlert & Document;
export declare enum AlertType {
    UNUSUAL_TRANSACTION = "UNUSUAL_TRANSACTION",
    MULTIPLE_LOGINS = "MULTIPLE_LOGINS",
    LARGE_WITHDRAWAL = "LARGE_WITHDRAWAL",
    FOREIGN_TRANSACTION = "FOREIGN_TRANSACTION",
    CREDIT_OVERDUE = "CREDIT_OVERDUE",
    ACCOUNT_ANOMALY = "ACCOUNT_ANOMALY"
}
export declare enum AlertSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum AlertStatus {
    OPEN = "OPEN",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    FALSE_POSITIVE = "FALSE_POSITIVE"
}
export declare class RiskAlert {
    employeeId: Types.ObjectId;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    data: Record<string, any>;
    status: AlertStatus;
    resolvedBy: Types.ObjectId | null;
    resolvedAt: Date | null;
    resolution: string;
}
export declare const RiskAlertSchema: import("mongoose").Schema<RiskAlert, import("mongoose").Model<RiskAlert, any, any, any, any, any, RiskAlert>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RiskAlert, Document<unknown, {}, RiskAlert, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<AlertType, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    severity?: import("mongoose").SchemaDefinitionProperty<AlertSeverity, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    data?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AlertStatus, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resolvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resolvedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resolution?: import("mongoose").SchemaDefinitionProperty<string, RiskAlert, Document<unknown, {}, RiskAlert, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RiskAlert & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, RiskAlert>;
