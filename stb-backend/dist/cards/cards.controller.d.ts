import { CardsService } from './cards.service';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    getMine(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/card.schema").Card, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/card.schema").Card & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    })[]>;
    freeze(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/card.schema").Card, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/card.schema").Card & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    createForEmployee(employeeId: string, body: {
        type?: any;
    }): Promise<import("./schemas/card.schema").Card>;
    unfreeze(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/card.schema").Card, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/card.schema").Card & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updateLimits(id: string, body: {
        limitQuotidien: number;
        limitMensuel: number;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/card.schema").Card, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/card.schema").Card & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
