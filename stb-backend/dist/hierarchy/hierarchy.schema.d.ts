import { Document, Types } from 'mongoose';
export type HierarchyDocument = Hierarchy & Document;
export declare class Hierarchy {
    employeeId: Types.ObjectId;
    managerId: Types.ObjectId | null;
    managerName: string | null;
    level: number;
    isManager: boolean;
    directReports: Types.ObjectId[];
}
export declare const HierarchySchema: import("mongoose").Schema<Hierarchy, import("mongoose").Model<Hierarchy, any, any, any, any, any, Hierarchy>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Hierarchy, Document<unknown, {}, Hierarchy, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerName?: import("mongoose").SchemaDefinitionProperty<string | null, Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    level?: import("mongoose").SchemaDefinitionProperty<number, Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isManager?: import("mongoose").SchemaDefinitionProperty<boolean, Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    directReports?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Hierarchy, Document<unknown, {}, Hierarchy, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Hierarchy & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Hierarchy>;
