import { DocumentsService } from './documents.service';
import { EmployeeDocument } from './schemas/document.schema';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    generate(employeeId: string, data: {
        type: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(data: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findByEmployee(employeeId: string, year?: number): Promise<{
        _id: any;
        title: any;
        type: any;
        fileName: any;
        fileSize: any;
        fileUrl: any;
        mimeType: any;
        description: any;
        isRead: any;
        year: any;
        month: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getStats(employeeId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<string, number>;
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<EmployeeDocument>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
