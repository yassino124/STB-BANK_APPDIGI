import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus } from './schemas/ticket.schema';
import { MessageSender } from './schemas/ticket-message.schema';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(req: any, data: Partial<Ticket>): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        statusCode?: undefined;
        message?: undefined;
    }>;
    getUnreadCount(req: any, employeeId?: string): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    findMine(req: any, employeeId?: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findAll(status?: string, type?: string, priority?: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    updateStatus(id: string, status: TicketStatus, req: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    assign(id: string, req: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").TicketDocument, {}, import("mongoose").DefaultSchemaOptions> & Ticket & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    getMessages(id: string, req: any): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/ticket-message.schema").TicketMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ticket-message.schema").TicketMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    sendMessage(id: string, message: string, senderType: MessageSender, req: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/ticket-message.schema").TicketMessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ticket-message.schema").TicketMessage & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
