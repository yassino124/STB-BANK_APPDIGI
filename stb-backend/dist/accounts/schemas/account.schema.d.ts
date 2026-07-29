import { Document, Types } from 'mongoose';
export declare enum AccountType {
    COURANT = "COURANT",
    EPARGNE = "EPARGNE",
    DEVISE = "DEVISE",
    JOINT = "JOINT"
}
export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    FROZEN = "FROZEN",
    CLOSED = "CLOSED",
    PENDING = "PENDING"
}
export declare class Account {
    employeeId: Types.ObjectId;
    rib: string;
    iban: string;
    numCompte: string;
    type: AccountType;
    status: AccountStatus;
    solde: number;
    currency: string;
    branchId: Types.ObjectId;
    isPrimary: boolean;
    dailyWithdrawalLimit: number;
    dailyTransferLimit: number;
    monthlyLimit: number;
    dailySpent: number;
    monthlySpent: number;
    lastWithdrawalReset: Date | null;
    lastMonthlyReset: Date | null;
    metadata: Record<string, any>;
}
export declare const AccountSchema: import("mongoose").Schema<Account, import("mongoose").Model<Account, any, any, any, any, any, Account>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Account, Document<unknown, {}, Account, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    rib?: import("mongoose").SchemaDefinitionProperty<string, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    iban?: import("mongoose").SchemaDefinitionProperty<string, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    numCompte?: import("mongoose").SchemaDefinitionProperty<string, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<AccountType, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AccountStatus, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    solde?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    branchId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isPrimary?: import("mongoose").SchemaDefinitionProperty<boolean, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dailyWithdrawalLimit?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dailyTransferLimit?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    monthlyLimit?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dailySpent?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    monthlySpent?: import("mongoose").SchemaDefinitionProperty<number, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastWithdrawalReset?: import("mongoose").SchemaDefinitionProperty<Date | null, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastMonthlyReset?: import("mongoose").SchemaDefinitionProperty<Date | null, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Account, Document<unknown, {}, Account, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Account & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Account>;
