import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
export declare class ExchangeRatesService {
    private exchangeRateModel;
    constructor(exchangeRateModel: Model<ExchangeRateDocument>);
    create(data: Partial<ExchangeRate>): Promise<import("mongoose").Document<unknown, {}, ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findLatest(fromCurrency: string, toCurrency: string): Promise<(import("mongoose").Document<unknown, {}, ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findHistory(fromCurrency: string, toCurrency: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
}
