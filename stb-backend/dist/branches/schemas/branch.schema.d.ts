import { Document, Types } from 'mongoose';
export type BranchDocument = Branch & Document;
export declare class Branch {
    name: string;
    code: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    managerId: Types.ObjectId | null;
    isActive: boolean;
    metadata: Record<string, any>;
}
export declare const BranchSchema: import("mongoose").Schema<Branch, import("mongoose").Model<Branch, any, any, any, any, any, Branch>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Branch, Document<unknown, {}, Branch, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    code?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    country?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Branch, Document<unknown, {}, Branch, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Branch & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Branch>;
