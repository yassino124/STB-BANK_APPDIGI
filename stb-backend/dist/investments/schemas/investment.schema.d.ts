import { Document, Types } from 'mongoose';
export type InvestmentDocument = Investment & Document;
export declare enum InvestmentType {
    STOCKS = "STOCKS",
    FUNDS = "FUNDS",
    BONDS = "BONDS",
    CRYPTO = "CRYPTO",
    SAVINGS_PLAN = "SAVINGS_PLAN"
}
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export declare enum InvestmentStatus {
    ACTIVE = "ACTIVE",
    MATURED = "MATURED",
    CANCELLED = "CANCELLED",
    LOST = "LOST"
}
export declare class Investment {
    employeeId: Types.ObjectId;
    type: InvestmentType;
    name: string;
    description: string;
    initialAmount: number;
    currentValue: number;
    currency: string;
    startDate: Date;
    endDate: Date | null;
    expectedReturn: number;
    riskLevel: RiskLevel;
    status: InvestmentStatus;
    accountId: Types.ObjectId | null;
    metadata: Record<string, any>;
}
export declare const InvestmentSchema: import("mongoose").Schema<Investment, import("mongoose").Model<Investment, any, any, any, any, any, Investment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Investment, Document<unknown, {}, Investment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<InvestmentType, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    initialAmount?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currentValue?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date | null, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expectedReturn?: import("mongoose").SchemaDefinitionProperty<number, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    riskLevel?: import("mongoose").SchemaDefinitionProperty<RiskLevel, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<InvestmentStatus, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Investment, Document<unknown, {}, Investment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Investment & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Investment>;
