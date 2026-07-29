import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
export declare class FavoritesService {
    private favoriteModel;
    constructor(favoriteModel: Model<FavoriteDocument>);
    create(employeeId: string, data: Partial<Favorite>): Promise<import("mongoose").Document<unknown, {}, FavoriteDocument, {}, import("mongoose").DefaultSchemaOptions> & Favorite & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, FavoriteDocument, {}, import("mongoose").DefaultSchemaOptions> & Favorite & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findByType(employeeId: string, type: string): Promise<(import("mongoose").Document<unknown, {}, FavoriteDocument, {}, import("mongoose").DefaultSchemaOptions> & Favorite & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
