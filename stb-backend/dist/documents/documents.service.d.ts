import { Model, Types } from 'mongoose';
import { EmployeeDocument, DocumentDocument } from './schemas/document.schema';
import { EmployeeDocument as EmployeeDoc } from '../employees/employee.schema';
export declare class DocumentsService {
    private documentModel;
    private employeeModel;
    constructor(documentModel: Model<DocumentDocument>, employeeModel: Model<EmployeeDoc>);
    generateDocument(employeeId: string, type: string): Promise<import("mongoose").Document<unknown, {}, DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(data: Partial<EmployeeDocument>): Promise<import("mongoose").Document<unknown, {}, DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
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
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    markAsRead(id: string): Promise<import("mongoose").Document<unknown, {}, DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: Partial<EmployeeDocument>): Promise<import("mongoose").Document<unknown, {}, DocumentDocument, {}, import("mongoose").DefaultSchemaOptions> & EmployeeDocument & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getStats(employeeId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<string, number>;
    }>;
}
