import { Document } from 'mongoose';
export type CurrencyDocument = Currency & Document;
export declare class Currency {
    code: string;
    name: string;
    symbol: string;
    decimalPlaces: number;
    isActive: boolean;
}
export declare const CurrencySchema: import("mongoose").Schema<Currency, import("mongoose").Model<Currency, any, any, any, any, any, Currency>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Currency, Document<unknown, {}, Currency, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    code?: import("mongoose").SchemaDefinitionProperty<string, Currency, Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Currency, Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    symbol?: import("mongoose").SchemaDefinitionProperty<string, Currency, Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    decimalPlaces?: import("mongoose").SchemaDefinitionProperty<number, Currency, Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Currency, Document<unknown, {}, Currency, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Currency & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Currency>;
