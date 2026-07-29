import { Document } from 'mongoose';
export type ServiceDocument = Service & Document;
export declare enum ServiceCategory {
    BANKING = "BANKING",
    HR = "HR",
    FINANCE = "FINANCE",
    IT = "IT",
    SUPPORT = "SUPPORT"
}
export declare class Service {
    name: string;
    description: string;
    category: ServiceCategory;
    isActive: boolean;
}
export declare const ServiceSchema: import("mongoose").Schema<Service, import("mongoose").Model<Service, any, any, any, any, any, Service>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, Document<unknown, {}, Service, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Service, Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Service, Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<ServiceCategory, Service, Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Service, Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Service>;
