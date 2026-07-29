import { Document, Types } from 'mongoose';
export type RechargeDocument = Recharge & Document;
export declare enum Operator {
    ORANGE = "ORANGE",
    TUNISIE_TELECOM = "TUNISIE_TELECOM",
    OOREDOO = "OOREDOO"
}
export declare enum RechargeStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class Recharge {
    employeeId: Types.ObjectId;
    phoneNumber: string;
    operator: Operator;
    amount: number;
    currency: string;
    status: RechargeStatus;
    accountId: Types.ObjectId | null;
    transactionId: Types.ObjectId | null;
}
export declare const RechargeSchema: import("mongoose").Schema<Recharge, import("mongoose").Model<Recharge, any, any, any, any, any, Recharge>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recharge, Document<unknown, {}, Recharge, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    employeeId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    phoneNumber?: import("mongoose").SchemaDefinitionProperty<string, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    operator?: import("mongoose").SchemaDefinitionProperty<Operator, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<RechargeStatus, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    accountId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transactionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Recharge, Document<unknown, {}, Recharge, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Recharge & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Recharge>;
