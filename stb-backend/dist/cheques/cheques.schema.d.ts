import { Document, Types } from 'mongoose';
export declare class ChequeRequest extends Document {
    employeeId: Types.ObjectId;
    type: string;
    status: string;
}
export declare const ChequeRequestSchema: import("mongoose").Schema<ChequeRequest, import("mongoose").Model<ChequeRequest, any, any, any, any, any, ChequeRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChequeRequest, Document<unknown, {}, ChequeRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChequeRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChequeRequest, Document<unknown, {}, ChequeRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, ChequeRequest, Document<unknown, {}, ChequeRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, ChequeRequest, Document<unknown, {}, ChequeRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ChequeRequest, Document<unknown, {}, ChequeRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChequeRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ChequeRequest>;
