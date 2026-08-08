import { Document, Types } from 'mongoose';
export declare enum AuthorizationType {
    SORTIE = "SORTIE",
    MISSION = "MISSION",
    TELETRAVAIL = "TELETRAVAIL",
    RETARD = "RETARD",
    HEURES_SUP = "HEURES_SUP",
    CONGE = "CONGE",
    FORMATION = "FORMATION",
    DELEGATION = "DELEGATION"
}
export declare enum AuthorizationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare enum AuthorizationPriority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class Authorization extends Document {
    employeeId: Types.ObjectId;
    type: AuthorizationType;
    date: Date;
    heureDebut: string;
    heureFin: string;
    motif: string;
    status: AuthorizationStatus;
    approvedBy: Types.ObjectId;
    commentaire: string;
    approverId: Types.ObjectId | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    priority: AuthorizationPriority;
    metadata: Record<string, any>;
}
export declare const AuthorizationSchema: import("mongoose").Schema<Authorization, import("mongoose").Model<Authorization, any, any, any, any, any, Authorization>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Authorization, Document<unknown, {}, Authorization, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    date?: import("mongoose").SchemaDefinitionProperty<Date, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<AuthorizationType, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AuthorizationStatus, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    priority?: import("mongoose").SchemaDefinitionProperty<AuthorizationPriority, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    motif?: import("mongoose").SchemaDefinitionProperty<string, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approverId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    commentaire?: import("mongoose").SchemaDefinitionProperty<string, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | null, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    heureDebut?: import("mongoose").SchemaDefinitionProperty<string, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    heureFin?: import("mongoose").SchemaDefinitionProperty<string, Authorization, Document<unknown, {}, Authorization, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Authorization & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Authorization>;
