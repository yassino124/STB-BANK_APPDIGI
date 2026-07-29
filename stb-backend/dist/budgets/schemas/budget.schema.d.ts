import { Document, Types } from 'mongoose';
export type BudgetDocument = Budget & Document;
export declare enum BudgetCategory {
    FOOD = "FOOD",
    TRANSPORT = "TRANSPORT",
    ENTERTAINMENT = "ENTERTAINMENT",
    SHOPPING = "SHOPPING",
    BILLS = "BILLS",
    HEALTH = "HEALTH",
    EDUCATION = "EDUCATION",
    SAVINGS = "SAVINGS",
    TRAVEL = "TRAVEL",
    EMERGENCY = "EMERGENCY",
    OTHER = "OTHER"
}
export declare enum BudgetPeriod {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare enum BudgetType {
    SPENDING = "SPENDING",
    SAVINGS_GOAL = "SAVINGS_GOAL"
}
export declare class Budget {
    employeeId: Types.ObjectId;
    name: string;
    category: BudgetCategory;
    type: BudgetType;
    amount: number;
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    spent: number;
    saved: number;
    currency: string;
    isActive: boolean;
    alertThreshold: number;
    notificationSent: boolean;
    targetDate: Date;
    description: string;
}
export declare const BudgetSchema: import("mongoose").Schema<Budget, import("mongoose").Model<Budget, any, any, any, any, any, Budget>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Budget, Document<unknown, {}, Budget, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<BudgetCategory, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<BudgetType, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    period?: import("mongoose").SchemaDefinitionProperty<BudgetPeriod, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    spent?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    saved?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    alertThreshold?: import("mongoose").SchemaDefinitionProperty<number, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    notificationSent?: import("mongoose").SchemaDefinitionProperty<boolean, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    targetDate?: import("mongoose").SchemaDefinitionProperty<Date, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Budget, Document<unknown, {}, Budget, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Budget & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Budget>;
