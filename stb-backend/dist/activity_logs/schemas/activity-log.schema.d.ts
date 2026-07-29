import { Document, Types } from 'mongoose';
export type ActivityLogDocument = ActivityLog & Document;
export declare class ActivityLog {
    employeeId: Types.ObjectId;
    action: string;
    module: string;
    resource: string;
    resourceId: string;
    changes: Record<string, any>;
    ip: string;
    userAgent: string;
    deviceInfo: Record<string, any>;
    success: boolean;
    metadata: Record<string, any>;
}
export declare const ActivityLogSchema: import("mongoose").Schema<ActivityLog, import("mongoose").Model<ActivityLog, any, any, any, any, any, ActivityLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActivityLog, Document<unknown, {}, ActivityLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    action?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    module?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resource?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resourceId?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    changes?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ip?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userAgent?: import("mongoose").SchemaDefinitionProperty<string, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deviceInfo?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    success?: import("mongoose").SchemaDefinitionProperty<boolean, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, ActivityLog, Document<unknown, {}, ActivityLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ActivityLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ActivityLog>;
