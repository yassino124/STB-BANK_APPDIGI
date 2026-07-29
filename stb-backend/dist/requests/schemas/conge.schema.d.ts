import { Document, Types } from 'mongoose';
export declare enum CongeType {
    REPOS = "REPOS",
    MALADIE = "MALADIE",
    MARIAGE = "MARIAGE",
    NAISSANCE = "NAISSANCE",
    DECES = "DECES",
    PELERINAGE = "PELERINAGE",
    SANS_SOLDE = "SANS_SOLDE"
}
export declare enum CongeStatus {
    EN_ATTENTE = "EN_ATTENTE",
    EN_ATTENTE_RH = "EN_ATTENTE_RH",
    EN_ATTENTE_DG = "EN_ATTENTE_DG",
    APPROUVE = "APPROUVE",
    REFUSE = "REFUSE"
}
export declare const CONGE_RULES: {
    REPOS: {
        dureeMax: null;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: null;
    };
    MALADIE: {
        dureeMax: null;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: null;
    };
    MARIAGE: {
        dureeMax: number;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: number;
    };
    NAISSANCE: {
        dureeMax: number;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: null;
    };
    DECES: {
        dureeMax: number;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: null;
    };
    PELERINAGE: {
        dureeMax: number;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: number;
    };
    SANS_SOLDE: {
        dureeMax: null;
        deductFromSolde: boolean;
        justificatifRequis: boolean;
        limiteCarriere: null;
    };
};
export declare class Conge extends Document {
    employeeId: Types.ObjectId;
    type: CongeType;
    status: CongeStatus;
    startDate: Date;
    endDate: Date;
    dureeDays: number;
    motif: string;
    justificatif?: {
        filename: string;
        url: string;
        mimetype: string;
        uploadedAt: Date;
    };
    approvals: {
        manager?: {
            approved: boolean;
            date: Date;
            managerId: Types.ObjectId;
        };
        rh?: {
            approved: boolean;
            date: Date;
            rhId: Types.ObjectId;
        };
        dg?: {
            approved: boolean;
            date: Date;
            dgId: Types.ObjectId;
        };
    };
    refusalReason?: string;
    countedInCarrierLimit: boolean;
}
export declare const CongeSchema: import("mongoose").Schema<Conge, import("mongoose").Model<Conge, any, any, any, any, any, Conge>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conge, Document<unknown, {}, Conge, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<CongeType, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CongeStatus, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    motif?: import("mongoose").SchemaDefinitionProperty<string, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dureeDays?: import("mongoose").SchemaDefinitionProperty<number, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    justificatif?: import("mongoose").SchemaDefinitionProperty<{
        filename: string;
        url: string;
        mimetype: string;
        uploadedAt: Date;
    } | undefined, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    approvals?: import("mongoose").SchemaDefinitionProperty<{
        manager?: {
            approved: boolean;
            date: Date;
            managerId: Types.ObjectId;
        };
        rh?: {
            approved: boolean;
            date: Date;
            rhId: Types.ObjectId;
        };
        dg?: {
            approved: boolean;
            date: Date;
            dgId: Types.ObjectId;
        };
    }, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refusalReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    countedInCarrierLimit?: import("mongoose").SchemaDefinitionProperty<boolean, Conge, Document<unknown, {}, Conge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Conge & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Conge>;
