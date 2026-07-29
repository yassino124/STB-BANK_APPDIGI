import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
export declare class MessagesService {
    private messageModel;
    constructor(messageModel: Model<MessageDocument>);
    create(data: Partial<Message>): Promise<import("mongoose").Document<unknown, {}, MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByConversation(conversationId: string, page?: number, limit?: number): Promise<(import("mongoose").Document<unknown, {}, MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    markAsRead(conversationId: string, recipientId: string): Promise<import("mongoose").UpdateWriteOpResult>;
    findUnreadCount(employeeId: string): Promise<number>;
}
