import { Document, Types } from 'mongoose';
export type SessionDocument = Session & Document;
export declare class Session {
    employeeId: Types.ObjectId;
    deviceId: Types.ObjectId | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    isRevoked: boolean;
    revokedAt: Date | null;
    ip: string | null;
    userAgent: string | null;
    location: string | null;
}
export declare const SessionSchema: import("mongoose").Schema<Session, import("mongoose").Model<Session, any, any, any, any, any, Session>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Session, Document<unknown, {}, Session, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deviceId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accessToken?: import("mongoose").SchemaDefinitionProperty<string, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refreshToken?: import("mongoose").SchemaDefinitionProperty<string, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accessTokenExpiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refreshTokenExpiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isRevoked?: import("mongoose").SchemaDefinitionProperty<boolean, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    revokedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ip?: import("mongoose").SchemaDefinitionProperty<string | null, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userAgent?: import("mongoose").SchemaDefinitionProperty<string | null, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string | null, Session, Document<unknown, {}, Session, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Session & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Session>;
