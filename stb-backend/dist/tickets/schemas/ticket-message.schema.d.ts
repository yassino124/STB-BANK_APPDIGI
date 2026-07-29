import { Document, Types } from 'mongoose';
export type TicketMessageDocument = TicketMessage & Document;
export declare enum MessageSender {
    EMPLOYEE = "EMPLOYEE",
    RH = "RH",
    SYSTEM = "SYSTEM"
}
export declare class TicketMessage {
    ticketId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderType: MessageSender;
    message: string;
    attachments: string[];
    isRead: boolean;
    readAt: Date | null;
}
export declare const TicketMessageSchema: import("mongoose").Schema<TicketMessage, import("mongoose").Model<TicketMessage, any, any, any, any, any, TicketMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TicketMessage, Document<unknown, {}, TicketMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    ticketId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    senderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    senderType?: import("mongoose").SchemaDefinitionProperty<MessageSender, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    attachments?: import("mongoose").SchemaDefinitionProperty<string[], TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isRead?: import("mongoose").SchemaDefinitionProperty<boolean, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    readAt?: import("mongoose").SchemaDefinitionProperty<Date | null, TicketMessage, Document<unknown, {}, TicketMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TicketMessage & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, TicketMessage>;
