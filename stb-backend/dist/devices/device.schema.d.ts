import { Document, Types } from 'mongoose';
export type DeviceDocument = Device & Document;
export declare enum Platform {
    IOS = "iOS",
    ANDROID = "Android",
    WEB = "Web"
}
export declare class Device {
    employeeId: Types.ObjectId;
    deviceUUID: string;
    deviceName: string;
    platform: Platform;
    model: string | null;
    osVersion: string | null;
    trusted: boolean;
    lastLoginAt: Date | null;
    lastLoginIp: string | null;
    lastLoginLocation: string | null;
    biometricsEnabled: boolean;
    loginCount: number;
}
export declare const DeviceSchema: import("mongoose").Schema<Device, import("mongoose").Model<Device, any, any, any, any, any, Device>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Device, Document<unknown, {}, Device, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deviceUUID?: import("mongoose").SchemaDefinitionProperty<string, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deviceName?: import("mongoose").SchemaDefinitionProperty<string, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    platform?: import("mongoose").SchemaDefinitionProperty<Platform, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    model?: import("mongoose").SchemaDefinitionProperty<string | null, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    osVersion?: import("mongoose").SchemaDefinitionProperty<string | null, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    trusted?: import("mongoose").SchemaDefinitionProperty<boolean, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastLoginAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastLoginIp?: import("mongoose").SchemaDefinitionProperty<string | null, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastLoginLocation?: import("mongoose").SchemaDefinitionProperty<string | null, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    biometricsEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    loginCount?: import("mongoose").SchemaDefinitionProperty<number, Device, Document<unknown, {}, Device, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Device & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Device>;
