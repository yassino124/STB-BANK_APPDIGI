import { Document as MongooseDocument, Types } from 'mongoose';
export type DocumentDocument = EmployeeDocument & MongooseDocument;
export declare enum DocumentType {
    PAYSLIP = "PAYSLIP",
    WORK_CERTIFICATE = "WORK_CERTIFICATE",
    SALARY_CERTIFICATE = "SALARY_CERTIFICATE",
    TAX_DECLARATION = "TAX_DECLARATION",
    CNSS_DECLARATION = "CNSS_DECLARATION",
    CONTRACT = "CONTRACT",
    ID_DOCUMENT = "ID_DOCUMENT",
    OTHER = "OTHER"
}
export declare class EmployeeDocument {
    employeeId: Types.ObjectId;
    title: string;
    type: DocumentType;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    description: string;
    uploadedBy: Types.ObjectId;
    isRead: boolean;
    year: number;
    month: number;
    isActive: boolean;
}
export declare const EmployeeDocumentSchema: import("mongoose").Schema<EmployeeDocument, import("mongoose").Model<EmployeeDocument, any, any, any, any, any, EmployeeDocument>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<DocumentType, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fileUrl?: import("mongoose").SchemaDefinitionProperty<string, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fileName?: import("mongoose").SchemaDefinitionProperty<string, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fileSize?: import("mongoose").SchemaDefinitionProperty<number, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mimeType?: import("mongoose").SchemaDefinitionProperty<string, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    uploadedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isRead?: import("mongoose").SchemaDefinitionProperty<boolean, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    year?: import("mongoose").SchemaDefinitionProperty<number, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    month?: import("mongoose").SchemaDefinitionProperty<number, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, EmployeeDocument, MongooseDocument<unknown, {}, EmployeeDocument, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<EmployeeDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, EmployeeDocument>;
