import { Document, Types } from 'mongoose';
export declare enum AvanceType {
    SALAIRE = "SALAIRE",
    PRIME = "PRIME",
    PRIME_AID = "PRIME_AID"
}
export declare enum AvanceStatut {
    EN_ATTENTE = "EN_ATTENTE",
    APPROUVE = "APPROUVE",
    REFUSE = "REFUSE",
    DEBITEE = "DEBITEE"
}
export declare class Avance extends Document {
    employee: Types.ObjectId;
    type: AvanceType;
    montant: number;
    motif: string | null;
    statut: AvanceStatut;
    approvedBy: Types.ObjectId | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    transactionId: Types.ObjectId | null;
    debitedAt: Date | null;
}
export declare const AvanceSchema: import("mongoose").Schema<Avance, import("mongoose").Model<Avance, any, any, any, any, any, Avance>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Avance, Document<unknown, {}, Avance, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<AvanceType, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employee?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montant?: import("mongoose").SchemaDefinitionProperty<number, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    motif?: import("mongoose").SchemaDefinitionProperty<string | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    statut?: import("mongoose").SchemaDefinitionProperty<AvanceStatut, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rejectionReason?: import("mongoose").SchemaDefinitionProperty<string | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    debitedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Avance, Document<unknown, {}, Avance, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Avance & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Avance>;
