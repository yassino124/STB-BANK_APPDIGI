import { Document, Types } from 'mongoose';
export declare enum RequestType {
    CONGE = "CONGE",
    AVANCE = "AVANCE",
    CREDIT = "CREDIT",
    PRIME = "PRIME",
    DOCUMENT = "DOCUMENT",
    CARTE = "CARTE"
}
export declare enum RequestStatus {
    EN_ATTENTE = "EN_ATTENTE",
    APPROUVE = "APPROUVE",
    REFUSE = "REFUSE",
    ANNULE = "ANNULE"
}
export declare class Request extends Document {
    type: RequestType;
    status: RequestStatus;
    employeeId: Types.ObjectId;
    payload: Record<string, any>;
    responseMessage: string;
}
export declare const RequestSchema: import("mongoose").Schema<Request, import("mongoose").Model<Request, any, any, any, any, any, Request>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Request, Document<unknown, {}, Request, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<RequestType, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<RequestStatus, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    payload?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    responseMessage?: import("mongoose").SchemaDefinitionProperty<string, Request, Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Request>;
