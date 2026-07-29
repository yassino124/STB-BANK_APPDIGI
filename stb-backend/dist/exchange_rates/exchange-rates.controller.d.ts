import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRate } from './schemas/exchange-rate.schema';
export declare class ExchangeRatesController {
    private readonly exchangeRatesService;
    constructor(exchangeRatesService: ExchangeRatesService);
    create(data: Partial<ExchangeRate>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/exchange-rate.schema").ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/exchange-rate.schema").ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findLatest(from: string, to: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/exchange-rate.schema").ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findHistory(from: string, to: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/exchange-rate.schema").ExchangeRateDocument, {}, import("mongoose").DefaultSchemaOptions> & ExchangeRate & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    convert(amount: number, from: string, to: string): Promise<number>;
}
