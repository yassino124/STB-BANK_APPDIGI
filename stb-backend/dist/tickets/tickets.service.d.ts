import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from './schemas/ticket.schema';
import { TicketMessage, TicketMessageDocument, MessageSender } from './schemas/ticket-message.schema';
export declare class TicketsService {
    private ticketModel;
    private messageModel;
    constructor(ticketModel: Model<TicketDocument>, messageModel: Model<TicketMessageDocument>);
    create(data: Partial<Ticket>): Promise<import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMyTickets(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findAll(filters?: {
        status?: string;
        type?: string;
        priority?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateStatus(id: string, status: TicketStatus, rhId?: string): Promise<import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    assignTicket(id: string, rhId: string): Promise<import("mongoose").Document<unknown, {}, TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMessages(ticketId: string): Promise<(import("mongoose").Document<unknown, {}, TicketMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & TicketMessage & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    sendMessage(ticketId: string, senderId: string, senderType: MessageSender, message: string): Promise<import("mongoose").Document<unknown, {}, TicketMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & TicketMessage & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAsRead(ticketId: string, userId: string): Promise<void>;
    getUnreadCount(employeeId: string): Promise<number>;
}
