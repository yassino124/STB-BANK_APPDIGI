import { Document, Types } from 'mongoose';
export type LeaveRequestDocument = LeaveRequest & Document;
export declare enum LeaveStatus {
    PENDING_N1 = "PENDING_N1",
    APPROVED_N1 = "APPROVED_N1",
    PENDING_RH = "PENDING_RH",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum LeaveType {
    REPOS = "REPOS",
    MALADIE = "MALADIE",
    EXCEPTIONNEL = "EXCEPTIONNEL",
    SANS_SOLDE = "SANS_SOLDE",
    MATERNITE = "MATERNITE"
}
export declare class LeaveRequest extends Document {
    employeeId: Types.ObjectId;
    type: LeaveType;
    dateDebut: Date;
    dateFin: Date;
    nombreJours: number;
    motif: string;
    pieceJointe: string;
    status: LeaveStatus;
    managerId: Types.ObjectId;
    n1ApprovedBy: Types.ObjectId;
    n1ApprovedAt: Date;
    n1Commentaire: string;
    rhApprovedBy: Types.ObjectId;
    rhApprovedAt: Date;
    rhCommentaire: string;
    validatedBy: Types.ObjectId;
    validatedAt: Date;
    commentaire: string;
}
export declare const LeaveRequestSchema: import("mongoose").Schema<LeaveRequest, import("mongoose").Model<LeaveRequest, any, any, any, any, any, LeaveRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeaveRequest, Document<unknown, {}, LeaveRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<LeaveType, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<LeaveStatus, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    motif?: import("mongoose").SchemaDefinitionProperty<string, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateDebut?: import("mongoose").SchemaDefinitionProperty<Date, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateFin?: import("mongoose").SchemaDefinitionProperty<Date, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    nombreJours?: import("mongoose").SchemaDefinitionProperty<number, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pieceJointe?: import("mongoose").SchemaDefinitionProperty<string, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1ApprovedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1ApprovedAt?: import("mongoose").SchemaDefinitionProperty<Date, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1Commentaire?: import("mongoose").SchemaDefinitionProperty<string, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhApprovedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhApprovedAt?: import("mongoose").SchemaDefinitionProperty<Date, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhCommentaire?: import("mongoose").SchemaDefinitionProperty<string, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedAt?: import("mongoose").SchemaDefinitionProperty<Date, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, LeaveRequest, Document<unknown, {}, LeaveRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveRequest & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, LeaveRequest>;
export declare class LeaveBalance extends Document {
    employeeId: Types.ObjectId;
    soldeAnnuel: number;
    soldeUtilise: number;
    soldeReporte: number;
    get soldeDisponible(): number;
    annee: number;
}
export declare const LeaveBalanceSchema: import("mongoose").Schema<LeaveBalance, import("mongoose").Model<LeaveBalance, any, any, any, any, any, LeaveBalance>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeaveBalance, Document<unknown, {}, LeaveBalance, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    annee?: import("mongoose").SchemaDefinitionProperty<number, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    soldeAnnuel?: import("mongoose").SchemaDefinitionProperty<number, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    soldeUtilise?: import("mongoose").SchemaDefinitionProperty<number, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    soldeReporte?: import("mongoose").SchemaDefinitionProperty<number, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    readonly soldeDisponible?: import("mongoose").SchemaDefinitionProperty<number, LeaveBalance, Document<unknown, {}, LeaveBalance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<LeaveBalance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, LeaveBalance>;
