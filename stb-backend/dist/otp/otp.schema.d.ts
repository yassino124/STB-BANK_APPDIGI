import { Document, Types } from 'mongoose';
export type OtpDocument = Otp & Document;
export declare enum OtpPurpose {
    ACTIVATION = "ACTIVATION",
    PASSWORD_RESET = "PASSWORD_RESET",
    DEVICE_CHANGE = "DEVICE_CHANGE",
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION"
}
export declare class Otp {
    employeeId: Types.ObjectId;
    codeHash: string;
    purpose: OtpPurpose;
    expiresAt: Date;
    used: boolean;
    attempts: number;
    sentToEmail: string | null;
    sentToPhone: string | null;
}
export declare const OtpSchema: import("mongoose").Schema<Otp, import("mongoose").Model<Otp, any, any, any, any, any, Otp>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Otp, Document<unknown, {}, Otp, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    codeHash?: import("mongoose").SchemaDefinitionProperty<string, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    purpose?: import("mongoose").SchemaDefinitionProperty<OtpPurpose, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expiresAt?: import("mongoose").SchemaDefinitionProperty<Date, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    used?: import("mongoose").SchemaDefinitionProperty<boolean, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    attempts?: import("mongoose").SchemaDefinitionProperty<number, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sentToEmail?: import("mongoose").SchemaDefinitionProperty<string | null, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sentToPhone?: import("mongoose").SchemaDefinitionProperty<string | null, Otp, Document<unknown, {}, Otp, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Otp & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Otp>;
