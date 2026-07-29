import { Document, Types } from 'mongoose';
export type RoleDocument = Role & Document;
export declare class Role {
    name: string;
    description: string;
    permissions: Types.ObjectId[];
    isSystem: boolean;
    isActive: boolean;
}
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, any, any, Role>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, Role, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Role, Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Role, Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    permissions?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Role, Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isSystem?: import("mongoose").SchemaDefinitionProperty<boolean, Role, Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Role, Document<unknown, {}, Role, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Role & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Role>;
