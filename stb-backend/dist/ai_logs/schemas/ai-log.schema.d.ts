import { Document, Types } from 'mongoose';
export type AiLogDocument = AiLog & Document;
export declare class AiLog {
    employeeId: Types.ObjectId | null;
    sessionId: string;
    prompt: string;
    response: string;
    model: string;
    context: Record<string, any>;
    tokensUsed: number;
    latency: number;
    success: boolean;
    error: string;
    feedback: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    metadata: Record<string, any>;
}
export declare const AiLogSchema: import("mongoose").Schema<AiLog, import("mongoose").Model<AiLog, any, any, any, any, any, AiLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AiLog, Document<unknown, {}, AiLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sessionId?: import("mongoose").SchemaDefinitionProperty<string, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    prompt?: import("mongoose").SchemaDefinitionProperty<string, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    response?: import("mongoose").SchemaDefinitionProperty<string, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    model?: import("mongoose").SchemaDefinitionProperty<string, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    context?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tokensUsed?: import("mongoose").SchemaDefinitionProperty<number, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    latency?: import("mongoose").SchemaDefinitionProperty<number, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    success?: import("mongoose").SchemaDefinitionProperty<boolean, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    error?: import("mongoose").SchemaDefinitionProperty<string, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    feedback?: import("mongoose").SchemaDefinitionProperty<"POSITIVE" | "NEGATIVE" | "NEUTRAL", AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, AiLog, Document<unknown, {}, AiLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiLog & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, AiLog>;
