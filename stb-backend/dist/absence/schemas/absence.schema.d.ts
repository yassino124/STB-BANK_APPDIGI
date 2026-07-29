import { Document, Types } from 'mongoose';
export type AbsenceDocument = Absence & Document;
export declare enum AbsenceStatus {
    PENDING_N1 = "PENDING_N1",
    APPROVED_N1 = "APPROVED_N1",
    PENDING_RH = "PENDING_RH",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum AbsenceType {
    ABSENCE = "ABSENCE",
    RETARD = "RETARD",
    DELEGATION = "DELEGATION",
    MISSION = "MISSION"
}
export declare class Absence extends Document {
    employeeId: Types.ObjectId;
    type: AbsenceType;
    dateDebut: Date;
    dateFin: Date;
    nombreHeures: number;
    motif: string;
    pieceJointe: string;
    status: AbsenceStatus;
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
export declare const AbsenceSchema: import("mongoose").Schema<Absence, import("mongoose").Model<Absence, any, any, any, any, any, Absence>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Absence, Document<unknown, {}, Absence, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<AbsenceType, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AbsenceStatus, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    motif?: import("mongoose").SchemaDefinitionProperty<string, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateDebut?: import("mongoose").SchemaDefinitionProperty<Date, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateFin?: import("mongoose").SchemaDefinitionProperty<Date, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pieceJointe?: import("mongoose").SchemaDefinitionProperty<string, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1ApprovedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1ApprovedAt?: import("mongoose").SchemaDefinitionProperty<Date, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    n1Commentaire?: import("mongoose").SchemaDefinitionProperty<string, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhApprovedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhApprovedAt?: import("mongoose").SchemaDefinitionProperty<Date, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rhCommentaire?: import("mongoose").SchemaDefinitionProperty<string, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    validatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    nombreHeures?: import("mongoose").SchemaDefinitionProperty<number, Absence, Document<unknown, {}, Absence, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Absence & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Absence>;
