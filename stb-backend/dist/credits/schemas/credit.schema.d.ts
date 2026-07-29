import { Document, Types } from 'mongoose';
export declare enum CreditStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    LATE = "LATE",
    PENDING = "PENDING"
}
export declare enum CreditType {
    PERSONNEL = "PERSONNEL",
    IMMOBILIER = "IMMOBILIER",
    AUTO = "AUTO",
    MOYEN_TERME = "MOYEN_TERME"
}
export declare class Credit extends Document {
    employeeId: Types.ObjectId;
    title: string;
    type: CreditType;
    montantInitial: number;
    montantRestant: number;
    tauxInteret: number;
    mensualite: number;
    nombreMois: number;
    dateDebut: Date;
    dateFin: Date;
    status: CreditStatus;
}
export declare const CreditSchema: import("mongoose").Schema<Credit, import("mongoose").Model<Credit, any, any, any, any, any, Credit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Credit, Document<unknown, {}, Credit, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<CreditType, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CreditStatus, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateDebut?: import("mongoose").SchemaDefinitionProperty<Date, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateFin?: import("mongoose").SchemaDefinitionProperty<Date, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montantInitial?: import("mongoose").SchemaDefinitionProperty<number, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montantRestant?: import("mongoose").SchemaDefinitionProperty<number, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tauxInteret?: import("mongoose").SchemaDefinitionProperty<number, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mensualite?: import("mongoose").SchemaDefinitionProperty<number, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    nombreMois?: import("mongoose").SchemaDefinitionProperty<number, Credit, Document<unknown, {}, Credit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Credit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Credit>;
export declare class CreditPayment extends Document {
    creditId: Types.ObjectId;
    employeeId: Types.ObjectId;
    montant: number;
    capital: number;
    interets: number;
    montantRestantApres: number;
    datePaiement: Date;
    mode: string;
    transactionId?: Types.ObjectId;
    isLate: boolean;
    penalite: number;
}
export declare const CreditPaymentSchema: import("mongoose").Schema<CreditPayment, import("mongoose").Model<CreditPayment, any, any, any, any, any, CreditPayment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CreditPayment, Document<unknown, {}, CreditPayment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montant?: import("mongoose").SchemaDefinitionProperty<number, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    creditId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    capital?: import("mongoose").SchemaDefinitionProperty<number, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    interets?: import("mongoose").SchemaDefinitionProperty<number, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    montantRestantApres?: import("mongoose").SchemaDefinitionProperty<number, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    datePaiement?: import("mongoose").SchemaDefinitionProperty<Date, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mode?: import("mongoose").SchemaDefinitionProperty<string, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isLate?: import("mongoose").SchemaDefinitionProperty<boolean, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    penalite?: import("mongoose").SchemaDefinitionProperty<number, CreditPayment, Document<unknown, {}, CreditPayment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CreditPayment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, CreditPayment>;
