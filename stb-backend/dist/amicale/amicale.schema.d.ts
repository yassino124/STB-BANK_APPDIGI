import { Document } from 'mongoose';
export declare class AmicaleOffer extends Document {
    title: string;
    sub: string;
    cat: string;
    img: string;
    price: string;
    color: string;
    desc: string;
    isActive: boolean;
}
export declare const AmicaleOfferSchema: import("mongoose").Schema<AmicaleOffer, import("mongoose").Model<AmicaleOffer, any, any, any, any, any, AmicaleOffer>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    sub?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    desc?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cat?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    img?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    price?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    color?: import("mongoose").SchemaDefinitionProperty<string, AmicaleOffer, Document<unknown, {}, AmicaleOffer, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AmicaleOffer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, AmicaleOffer>;
