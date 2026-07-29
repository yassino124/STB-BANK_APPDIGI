import { Model } from 'mongoose';
import { AmicaleOffer } from './amicale.schema';
import { CreateAmicaleOfferDto, UpdateAmicaleOfferDto } from './dto/amicale.dto';
export declare class AmicaleService {
    private model;
    constructor(model: Model<AmicaleOffer>);
    findAllActive(): Promise<(import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(dto: CreateAmicaleOfferDto): Promise<import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateAmicaleOfferDto): Promise<import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, AmicaleOffer, {}, import("mongoose").DefaultSchemaOptions> & AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
