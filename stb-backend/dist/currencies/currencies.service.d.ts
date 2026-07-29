import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from './schemas/currency.schema';
export declare class CurrenciesService {
    private currencyModel;
    constructor(currencyModel: Model<CurrencyDocument>);
    create(data: Partial<Currency>): Promise<import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByCode(code: string): Promise<(import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    update(id: string, data: Partial<Currency>): Promise<import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    seedDefaultCurrencies(): Promise<(import("mongoose").Document<unknown, {}, CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
