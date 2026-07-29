import { Document, Types } from 'mongoose';
export type ExchangeRateDocument = ExchangeRate & Document;
export declare class ExchangeRate {
    fromCurrency: Types.ObjectId;
    toCurrency: Types.ObjectId;
    rate: number;
    effectiveDate: Date;
    metadata: Record<string, any>;
}
export declare const ExchangeRateSchema: import("mongoose").Schema<ExchangeRate, import("mongoose").Model<ExchangeRate, any, any, any, any, any, ExchangeRate>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExchangeRate, Document<unknown, {}, ExchangeRate, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    fromCurrency?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExchangeRate, Document<unknown, {}, ExchangeRate, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    toCurrency?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ExchangeRate, Document<unknown, {}, ExchangeRate, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rate?: import("mongoose").SchemaDefinitionProperty<number, ExchangeRate, Document<unknown, {}, ExchangeRate, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    effectiveDate?: import("mongoose").SchemaDefinitionProperty<Date, ExchangeRate, Document<unknown, {}, ExchangeRate, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, ExchangeRate, Document<unknown, {}, ExchangeRate, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ExchangeRate & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ExchangeRate>;
