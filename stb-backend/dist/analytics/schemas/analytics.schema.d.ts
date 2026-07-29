import { Document, Types } from 'mongoose';
export type AnalyticsDocument = Analytics & Document;
export declare enum AnalyticsPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare class Analytics {
    employeeId: Types.ObjectId | null;
    metric: string;
    value: number;
    dimensions: Record<string, any>;
    period: AnalyticsPeriod;
    startDate: Date;
    endDate: Date;
}
export declare const AnalyticsSchema: import("mongoose").Schema<Analytics, import("mongoose").Model<Analytics, any, any, any, any, any, Analytics>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Analytics, Document<unknown, {}, Analytics, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metric?: import("mongoose").SchemaDefinitionProperty<string, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    value?: import("mongoose").SchemaDefinitionProperty<number, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dimensions?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    period?: import("mongoose").SchemaDefinitionProperty<AnalyticsPeriod, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date, Analytics, Document<unknown, {}, Analytics, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Analytics & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Analytics>;
