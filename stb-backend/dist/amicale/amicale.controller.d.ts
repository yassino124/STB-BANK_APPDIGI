import { AmicaleService } from './amicale.service';
import { CreateAmicaleOfferDto, UpdateAmicaleOfferDto } from './dto/amicale.dto';
export declare class AmicaleController {
    private readonly service;
    constructor(service: AmicaleService);
    findAllActive(): Promise<(import("mongoose").Document<unknown, {}, import("./amicale.schema").AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & import("./amicale.schema").AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getOfferImage(id: string, req: any): Promise<Buffer<ArrayBuffer> | undefined>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./amicale.schema").AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & import("./amicale.schema").AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(dto: CreateAmicaleOfferDto): Promise<import("mongoose").Document<unknown, {}, import("./amicale.schema").AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & import("./amicale.schema").AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateAmicaleOfferDto): Promise<import("mongoose").Document<unknown, {}, import("./amicale.schema").AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & import("./amicale.schema").AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./amicale.schema").AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & import("./amicale.schema").AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
