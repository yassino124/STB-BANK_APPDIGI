import { CurrenciesService } from './currencies.service';
import { Currency } from './schemas/currency.schema';
export declare class CurrenciesController {
    private readonly currenciesService;
    constructor(currenciesService: CurrenciesService);
    create(data: Partial<Currency>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    seedDefaultCurrencies(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByCode(code: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    update(id: string, data: Partial<Currency>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/currency.schema").CurrencyDocument, {}, import("mongoose").DefaultSchemaOptions> & Currency & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
