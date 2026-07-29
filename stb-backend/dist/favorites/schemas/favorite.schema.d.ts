import { Document, Types } from 'mongoose';
export type FavoriteDocument = Favorite & Document;
export declare enum FavoriteType {
    TRANSFER = "TRANSFER",
    BILL = "BILL",
    RECHARGE = "RECHARGE",
    SERVICE = "SERVICE"
}
export declare class Favorite {
    employeeId: Types.ObjectId;
    type: FavoriteType;
    referenceId: string;
    referenceData: Record<string, any>;
    label: string;
}
export declare const FavoriteSchema: import("mongoose").Schema<Favorite, import("mongoose").Model<Favorite, any, any, any, any, any, Favorite>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Favorite, Document<unknown, {}, Favorite, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Favorite, Document<unknown, {}, Favorite, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<FavoriteType, Favorite, Document<unknown, {}, Favorite, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    referenceId?: import("mongoose").SchemaDefinitionProperty<string, Favorite, Document<unknown, {}, Favorite, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    referenceData?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Favorite, Document<unknown, {}, Favorite, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    label?: import("mongoose").SchemaDefinitionProperty<string, Favorite, Document<unknown, {}, Favorite, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Favorite & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Favorite>;
