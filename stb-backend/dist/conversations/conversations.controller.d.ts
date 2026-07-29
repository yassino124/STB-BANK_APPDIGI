import { ConversationsService } from './conversations.service';
import { Conversation } from './schemas/conversation.schema';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(data: Partial<Conversation>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByParticipant(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateLastMessage(id: string, preview: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
