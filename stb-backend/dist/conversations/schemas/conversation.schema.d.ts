import { Document, Types } from 'mongoose';
export type ConversationDocument = Conversation & Document;
export declare enum ConversationType {
    DIRECT = "DIRECT",
    GROUP = "GROUP",
    SUPPORT = "SUPPORT",
    BROADCAST = "BROADCAST"
}
export declare class Conversation {
    type: ConversationType;
    participants: Types.ObjectId[];
    title: string;
    description: string;
    lastMessageAt: Date | null;
    lastMessagePreview: string;
    createdBy: Types.ObjectId;
    isActive: boolean;
    metadata: Record<string, any>;
}
export declare const ConversationSchema: import("mongoose").Schema<Conversation, import("mongoose").Model<Conversation, any, any, any, any, any, Conversation>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, Conversation, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    type?: import("mongoose").SchemaDefinitionProperty<ConversationType, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    participants?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastMessageAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastMessagePreview?: import("mongoose").SchemaDefinitionProperty<string, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Conversation, Document<unknown, {}, Conversation, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conversation & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Conversation>;
