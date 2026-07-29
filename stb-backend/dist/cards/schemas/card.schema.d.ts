import { Document, Types } from 'mongoose';
export declare enum CardType {
    VISA = "VISA",
    MASTERCARD = "MASTERCARD",
    PLATINUM = "PLATINUM",
    BLACK = "BLACK",
    VIRTUAL = "VIRTUAL",
    CORPORATE = "CORPORATE"
}
export declare enum CardStatus {
    ACTIVE = "ACTIVE",
    FROZEN = "FROZEN",
    BLOCKED = "BLOCKED",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED"
}
export declare enum CardBlockReason {
    LOST = "LOST",
    STOLEN = "STOLEN",
    DAMAGED = "DAMAGED",
    SUSPICIOUS = "SUSPICIOUS",
    FRAUD = "FRAUD",
    CUSTOMER_REQUEST = "CUSTOMER_REQUEST"
}
export declare class Card {
    employeeId: Types.ObjectId;
    accountId: Types.ObjectId;
    cardNumber: string;
    maskedNumber: string;
    expiryDate: string;
    cvvHash: string;
    pinHash: string | null;
    type: CardType;
    status: CardStatus;
    limitQuotidien: number;
    limitMensuel: number;
    isVirtual: boolean;
    isFrozen: boolean;
    frozenAt: Date | null;
    frozenBy: Types.ObjectId | null;
    freezeReason: string | null;
    blockReason: CardBlockReason | null;
    activatedAt: Date | null;
    cancelledAt: Date | null;
    contactlessEnabled: boolean;
    onlinePaymentsEnabled: boolean;
    internationalEnabled: boolean;
    spendingLimits: {
        daily: number;
        weekly: number;
        monthly: number;
        atmDaily: number;
    };
    allowedCountries: string[];
    blockedCountries: string[];
    metadata: Record<string, any>;
}
export declare const CardSchema: import("mongoose").Schema<Card, import("mongoose").Model<Card, any, any, any, any, any, Card>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Card, Document<unknown, {}, Card, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cardNumber?: import("mongoose").SchemaDefinitionProperty<string, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    maskedNumber?: import("mongoose").SchemaDefinitionProperty<string, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expiryDate?: import("mongoose").SchemaDefinitionProperty<string, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cvvHash?: import("mongoose").SchemaDefinitionProperty<string, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pinHash?: import("mongoose").SchemaDefinitionProperty<string | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<CardType, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CardStatus, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    limitQuotidien?: import("mongoose").SchemaDefinitionProperty<number, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    limitMensuel?: import("mongoose").SchemaDefinitionProperty<number, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isVirtual?: import("mongoose").SchemaDefinitionProperty<boolean, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isFrozen?: import("mongoose").SchemaDefinitionProperty<boolean, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    frozenAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    frozenBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    freezeReason?: import("mongoose").SchemaDefinitionProperty<string | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    blockReason?: import("mongoose").SchemaDefinitionProperty<CardBlockReason | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    activatedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cancelledAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    contactlessEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    onlinePaymentsEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    internationalEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    spendingLimits?: import("mongoose").SchemaDefinitionProperty<{
        daily: number;
        weekly: number;
        monthly: number;
        atmDaily: number;
    }, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    allowedCountries?: import("mongoose").SchemaDefinitionProperty<string[], Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    blockedCountries?: import("mongoose").SchemaDefinitionProperty<string[], Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Card, Document<unknown, {}, Card, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Card & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Card>;
