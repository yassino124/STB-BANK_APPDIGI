import { MessagesService } from './messages.service';
import { Message } from './schemas/message.schema';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(data: Partial<Message>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByConversation(conversationId: string, page?: number, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    markAsRead(conversationId: string, recipientId: string): Promise<import("mongoose").UpdateWriteOpResult>;
}
