import { Document, Types } from 'mongoose';
export type TicketDocument = Ticket & Document;
export declare enum TicketType {
    ASSISTANCE = "ASSISTANCE",
    RECLAMATION = "RECLAMATION",
    BUG = "BUG",
    FEEDBACK = "FEEDBACK"
}
export declare enum TicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING_RESPONSE = "WAITING_RESPONSE",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class Ticket {
    employeeId: Types.ObjectId;
    subject: string;
    message: string;
    type: TicketType;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo: Types.ObjectId | null;
    resolvedAt: Date | null;
    closedAt: Date | null;
    messageCount: number;
    lastMessageAt: Date;
}
export declare const TicketSchema: import("mongoose").Schema<Ticket, import("mongoose").Model<Ticket, any, any, any, any, any, Ticket>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Ticket, Document<unknown, {}, Ticket, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    subject?: import("mongoose").SchemaDefinitionProperty<string, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<TicketType, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<TicketStatus, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    priority?: import("mongoose").SchemaDefinitionProperty<TicketPriority, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    assignedTo?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    resolvedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    closedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    messageCount?: import("mongoose").SchemaDefinitionProperty<number, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastMessageAt?: import("mongoose").SchemaDefinitionProperty<Date, Ticket, Document<unknown, {}, Ticket, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Ticket & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Ticket>;
